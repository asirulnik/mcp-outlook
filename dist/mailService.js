"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const authHelper_1 = require("./authHelper");
// Service class for mail operations
class MailService {
    constructor() {
        this.folderPathCache = new Map(); // Cache for folder paths to IDs
        this.folderIdCache = new Map(); // Cache for folder IDs to paths
        this.client = (0, authHelper_1.getGraphClient)();
    }
    /**
     * Resolves a folder path to its ID
     * @param folderPathOrId Folder path (e.g., "/Inbox") or ID
     * @param userEmail Email address of the user
     * @returns The resolved folder ID
     */
    async resolveFolderPath(folderPathOrId, userEmail) {
        // If it doesn't start with "/", assume it's already an ID
        if (!folderPathOrId.startsWith('/')) {
            return folderPathOrId;
        }
        // Normalize path - remove trailing slash and ensure starting slash
        const normalizedPath = folderPathOrId.endsWith('/')
            ? folderPathOrId.slice(0, -1)
            : folderPathOrId;
        // Check cache first
        if (!this.folderPathCache.has(userEmail)) {
            this.folderPathCache.set(userEmail, new Map());
        }
        if (this.folderPathCache.get(userEmail).has(normalizedPath.toLowerCase())) {
            return this.folderPathCache.get(userEmail).get(normalizedPath.toLowerCase());
        }
        // Special case for root folder "/"
        if (normalizedPath === '/') {
            throw new Error('Root folder does not have an ID. Please specify a specific folder.');
        }
        // Split path parts
        const parts = normalizedPath.split('/').filter(p => p.length > 0);
        // Start with top level folders
        let folders = await this.getMailFolders(userEmail);
        let currentFolder;
        let currentPath = '';
        // Navigate down the path
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].toLowerCase();
            currentPath += `/${parts[i]}`;
            // Find matching folder (case insensitive)
            currentFolder = folders.find(f => f.displayName.toLowerCase() === part);
            if (!currentFolder) {
                throw new Error(`Folder not found: ${currentPath}`);
            }
            // Cache this folder path
            this.folderPathCache.get(userEmail).set(currentPath.toLowerCase(), currentFolder.id);
            // If not at the end of the path, we need to go deeper
            if (i < parts.length - 1) {
                folders = await this.getChildFolders(currentFolder.id, userEmail);
            }
        }
        if (!currentFolder) {
            throw new Error(`Could not resolve folder path: ${normalizedPath}`);
        }
        return currentFolder.id;
    }
    /**
     * Builds a complete folder path map for a user
     * @param userEmail Email address of the user
     * @returns Map of folder IDs to their full paths
     */
    async buildFolderPathMap(userEmail) {
        if (!this.folderIdCache.has(userEmail)) {
            this.folderIdCache.set(userEmail, new Map());
        }
        // Start with top level folders
        const rootFolders = await this.getMailFolders(userEmail);
        // Process each folder
        for (const folder of rootFolders) {
            await this.processFolderAndChildren(folder, `/${folder.displayName}`, userEmail);
        }
        return this.folderIdCache.get(userEmail);
    }
    /**
     * Recursively process folders to build path maps
     * @param folder The current folder
     * @param currentPath Current path to this folder
     * @param userEmail User email
     */
    async processFolderAndChildren(folder, currentPath, userEmail) {
        // Add to ID cache
        this.folderIdCache.get(userEmail).set(folder.id, currentPath);
        // Add to path cache
        if (!this.folderPathCache.has(userEmail)) {
            this.folderPathCache.set(userEmail, new Map());
        }
        this.folderPathCache.get(userEmail).set(currentPath.toLowerCase(), folder.id);
        // Store full path in the folder object itself
        folder.fullPath = currentPath;
        // Process children if there are any
        if (folder.childFolderCount > 0) {
            const children = await this.getChildFolders(folder.id, userEmail);
            for (const child of children) {
                await this.processFolderAndChildren(child, `${currentPath}/${child.displayName}`, userEmail);
            }
        }
    }
    /**
     * Get folder path by ID
     * @param folderId Folder ID
     * @param userEmail User email
     * @returns Folder path
     */
    async getFolderPath(folderId, userEmail) {
        // Check if we already have the path cached
        if (this.folderIdCache.has(userEmail) && this.folderIdCache.get(userEmail).has(folderId)) {
            return this.folderIdCache.get(userEmail).get(folderId);
        }
        // If not cached, build the complete folder path map
        await this.buildFolderPathMap(userEmail);
        // Check if we found it
        if (this.folderIdCache.get(userEmail).has(folderId)) {
            return this.folderIdCache.get(userEmail).get(folderId);
        }
        // If still not found, return the ID as fallback
        return folderId;
    }
    /**
     * Get mail folders for a specific user
     * @param userEmail Email address of the user (required for app-only authentication)
     * @returns List of mail folders
     */
    async getMailFolders(userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint for the specified user
            const endpoint = `/users/${userEmail}/mailFolders`;
            // Query parameters to include child folder count and more details
            const queryParams = '?$top=100&$select=id,displayName,parentFolderId,childFolderCount,unreadItemCount,totalItemCount';
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(`${endpoint}${queryParams}`)
                .get();
            let emails = response.value;
            // Process message bodies if requested to hide quoted content
            // This is just placeholder logic for now - actual implementation would use parameters provided in listEmails
            const includeBodies = false;
            const hideQuotedContent = false;
            if (includeBodies && hideQuotedContent && emails.length > 0) {
                const { htmlToText } = require('./htmlToText');
                // Process each email to hide quoted content
                emails = emails.map((email) => {
                    if (email.body) {
                        if (email.body.contentType === 'html') {
                            // Convert HTML to text to identify quoted content
                            const plainText = htmlToText(email.body.content);
                            // Split by the separator we use to mark quoted content
                            const parts = plainText.split('\n---\n');
                            // Only keep the first part (the main message)
                            if (parts.length > 1) {
                                // Create a note that content was removed
                                const removedContentNote = '\n\n[Prior quoted messages removed]';
                                // For HTML emails, we need to inject this note into the HTML
                                const noteHtml = '<div style="margin-top: 20px; padding: 10px; background-color: #f0f0f0; border-left: 3px solid #ccc;"><em>[Prior quoted messages removed]</em></div>';
                                // Save both versions
                                email.body.originalContent = email.body.content;
                                email.body.content = email.body.content.split('<blockquote')[0];
                                email.body.content += noteHtml;
                            }
                        }
                        else {
                            // For plain text emails
                            const parts = email.body.content.split('\n---\n');
                            // Only keep the first part (the main message)
                            if (parts.length > 1) {
                                // Save original content
                                email.body.originalContent = email.body.content;
                                email.body.content = parts[0] + '\n\n[Prior quoted messages removed]';
                            }
                        }
                    }
                    return email;
                });
            }
            return emails;
        }
        catch (error) {
            console.error('Error getting mail folders:', error);
            throw error;
        }
    }
    /**
     * Get child folders for a specific mail folder
     * @param folderIdOrWellKnownName Folder ID or wellKnownName (like 'inbox') or path (like '/Inbox')
     * @param userEmail Email address of the user (required for app-only authentication)
     * @returns List of child mail folders
     */
    async getChildFolders(folderIdOrWellKnownName, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Resolve folder path to ID if it's a path
            const folderId = await this.resolveFolderPath(folderIdOrWellKnownName, userEmail);
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/mailFolders/${folderId}/childFolders`;
            // Query parameters to include more details
            const queryParams = '?$select=id,displayName,parentFolderId,childFolderCount,unreadItemCount,totalItemCount';
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(`${endpoint}${queryParams}`)
                .get();
            return response.value;
        }
        catch (error) {
            console.error('Error getting child folders:', error);
            throw error;
        }
    }
    /**
     * List emails in a folder with optional search and date filtering
     * @param folderIdOrWellKnownName Folder ID, wellKnownName (like 'inbox'), or path (like '/Inbox')
     * @param userEmail Email address of the user
     * @param limit Number of emails to retrieve (default: 25)
     * @param searchOptions Optional search and date filters
     * @returns List of email messages (with optional bodies)
     */
    async listEmails(folderIdOrWellKnownName, userEmail, limit = 25, searchOptions) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Resolve folder path to ID if it's a path
            const folderId = await this.resolveFolderPath(folderIdOrWellKnownName, userEmail);
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/mailFolders/${folderId}/messages`;
            // When initializing query parameters, don't include orderby if we're going to search
            // Microsoft Graph API doesn't support using $search and $orderby together
            const willUseSearch = searchOptions && searchOptions.searchQuery && searchOptions.searchQuery.trim().length > 0;
            // Query parameters for pagination and fields - only include sort if not searching
            let queryParams = `?$top=${limit}&$select=id,subject,from,receivedDateTime,`;
            // Include full body content if requested
            if (searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.includeBodies) {
                queryParams += `body,toRecipients,ccRecipients,`;
            }
            queryParams += `bodyPreview,hasAttachments,isRead`;
            // Only add ordering if we're not searching
            if (!willUseSearch) {
                queryParams += `&$orderby=receivedDateTime desc`;
            }
            // Add search and date filters if provided
            if (searchOptions) {
                let filterString = '';
                // Process 'previous period' first (e.g., 'previous 7 days')
                if (searchOptions.previousPeriod) {
                    const { value, unit } = searchOptions.previousPeriod;
                    const now = new Date();
                    const pastDate = new Date();
                    switch (unit) {
                        case 'days':
                            pastDate.setDate(now.getDate() - value);
                            break;
                        case 'weeks':
                            pastDate.setDate(now.getDate() - (value * 7));
                            break;
                        case 'months':
                            pastDate.setMonth(now.getMonth() - value);
                            break;
                        case 'years':
                            pastDate.setFullYear(now.getFullYear() - value);
                            break;
                    }
                    searchOptions.afterDate = pastDate;
                }
                // Process before/after dates
                if (searchOptions.afterDate) {
                    const isoDate = searchOptions.afterDate.toISOString();
                    filterString += filterString ? ' and ' : '';
                    filterString += `receivedDateTime ge ${isoDate}`;
                }
                if (searchOptions.beforeDate) {
                    const isoDate = searchOptions.beforeDate.toISOString();
                    filterString += filterString ? ' and ' : '';
                    filterString += `receivedDateTime le ${isoDate}`;
                }
                // Process search query
                if (searchOptions.searchQuery && searchOptions.searchQuery.trim()) {
                    // If search fields are specified, construct specific search
                    if (searchOptions.searchFields && searchOptions.searchFields.length > 0) {
                        // Skip 'all' if other specific fields are present
                        const fields = searchOptions.searchFields.filter(f => f !== 'all');
                        // If no specific fields left (only 'all' was specified or fields is empty), default to all fields
                        if (fields.length === 0 || searchOptions.searchFields.includes('all')) {
                            // Search in all fields (body, subject, from, toRecipients, ccRecipients)
                            // Use double quotes for search terms to avoid syntax errors with apostrophes
                            const searchExpr = encodeURIComponent(`"${searchOptions.searchQuery.replace(/"/g, '\"')}"`);
                            // Use $search for full-text search across all fields
                            queryParams += `&$search=${searchExpr}`;
                        }
                        else {
                            // Search in specific fields
                            const escapedQuery = searchOptions.searchQuery.replace(/"/g, '\\"'); // Escape double quotes for OData query
                            const searchConditions = [];
                            fields.forEach(field => {
                                switch (field) {
                                    case 'subject':
                                        searchConditions.push(`contains(subject, "${escapedQuery}")`);
                                        break;
                                    case 'body':
                                        searchConditions.push(`contains(body/content, "${escapedQuery}")`);
                                        break;
                                    case 'from':
                                        searchConditions.push(`contains(from/emailAddress/address, "${escapedQuery}") or contains(from/emailAddress/name, "${escapedQuery}")`);
                                        break;
                                    case 'recipients':
                                        searchConditions.push(`(toRecipients/any(r: contains(r/emailAddress/address, "${escapedQuery}") or contains(r/emailAddress/name, "${escapedQuery}"))) or ` +
                                            `(ccRecipients/any(r: contains(r/emailAddress/address, "${escapedQuery}") or contains(r/emailAddress/name, "${escapedQuery}")))`);
                                        break;
                                }
                            });
                            if (searchConditions.length > 0) {
                                filterString += filterString ? ' and ' : '';
                                filterString += `(${searchConditions.join(' or ')})`;
                            }
                        }
                    }
                    else {
                        // Default to search all fields
                        // Use double quotes for search terms to avoid syntax errors with apostrophes
                        const searchExpr = encodeURIComponent(`"${searchOptions.searchQuery.replace(/"/g, '\"')}"`);
                        queryParams += `&$search=${searchExpr}`;
                    }
                }
                // Add filter to query params if we have any filters
                if (filterString) {
                    queryParams += `&$filter=${encodeURIComponent(filterString)}`;
                }
            }
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(`${endpoint}${queryParams}`)
                .get();
            return response.value;
        }
        catch (error) {
            console.error('Error listing emails:', error);
            throw error;
        }
    }
    /**
     * Get a specific email with details
     * @param emailId ID of the email to retrieve
     * @param userEmail Email address of the user
     * @param hideQuotedContent Optional flag to hide quoted content in the email body
     * @returns Email details
     */
    async getEmail(emailId, userEmail, hideQuotedContent = false) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${emailId}`;
            // Query parameters to include body and attachments
            const queryParams = '?$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,body,bodyPreview,hasAttachments,isRead';
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(`${endpoint}${queryParams}`)
                .get();
            // If the email has attachments, get them
            if (response.hasAttachments) {
                const attachmentsEndpoint = `/users/${userEmail}/messages/${emailId}/attachments`;
                const attachmentsResponse = await this.client
                    .api(attachmentsEndpoint)
                    .get();
                response.attachments = attachmentsResponse.value;
            }
            // Process message body to hide quoted content if requested
            if (hideQuotedContent && response.body) {
                const { htmlToText } = require('./htmlToText');
                if (response.body.contentType === 'html') {
                    // Convert HTML to text to identify quoted content
                    const plainText = htmlToText(response.body.content);
                    // Split by the separator we use to mark quoted content
                    const parts = plainText.split('\n---\n');
                    // Only keep the first part (the main message)
                    if (parts.length > 1) {
                        // Create a note that content was removed
                        const removedContentNote = '\n\n[Prior quoted messages removed]';
                        // For HTML emails, we need to inject this note into the HTML
                        const noteHtml = '<div style="margin-top: 20px; padding: 10px; background-color: #f0f0f0; border-left: 3px solid #ccc;"><em>[Prior quoted messages removed]</em></div>';
                        // Save both versions
                        response.body.originalContent = response.body.content;
                        response.body.content = response.body.content.split('<blockquote')[0];
                        response.body.content += noteHtml;
                    }
                }
                else {
                    // For plain text emails
                    const parts = response.body.content.split('\n---\n');
                    // Only keep the first part (the main message)
                    if (parts.length > 1) {
                        // Save original content
                        response.body.originalContent = response.body.content;
                        response.body.content = parts[0] + '\n\n[Prior quoted messages removed]';
                    }
                }
            }
            return response;
        }
        catch (error) {
            console.error('Error getting email details:', error);
            throw error;
        }
    }
    /**
     * Move an email to another folder
     * @param emailId ID of the email to move
     * @param destinationFolderIdOrPath ID or path of the destination folder
     * @param userEmail Email address of the user
     * @returns Moved email message
     */
    async moveEmail(emailId, destinationFolderIdOrPath, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Resolve folder path to ID if it's a path
            const destinationFolderId = await this.resolveFolderPath(destinationFolderIdOrPath, userEmail);
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${emailId}/move`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .post({
                destinationId: destinationFolderId
            });
            return response;
        }
        catch (error) {
            console.error('Error moving email:', error);
            throw error;
        }
    }
    /**
     * Copy an email to another folder
     * @param emailId ID of the email to copy
     * @param destinationFolderIdOrPath ID or path of the destination folder
     * @param userEmail Email address of the user
     * @returns Copied email message
     */
    async copyEmail(emailId, destinationFolderIdOrPath, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Resolve folder path to ID if it's a path
            const destinationFolderId = await this.resolveFolderPath(destinationFolderIdOrPath, userEmail);
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${emailId}/copy`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .post({
                destinationId: destinationFolderId
            });
            return response;
        }
        catch (error) {
            console.error('Error copying email:', error);
            throw error;
        }
    }
    /**
     * Create a new draft email
     * @param draft Draft email content
     * @param userEmail Email address of the user
     * @returns Created draft email
     */
    async createDraft(draft, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint for creating a message in drafts folder
            const endpoint = `/users/${userEmail}/messages`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .post(draft);
            return response;
        }
        catch (error) {
            console.error('Error creating draft:', error);
            throw error;
        }
    }
    /**
     * Create a new mail folder
     * @param newFolder New folder details
     * @param userEmail Email address of the user
     * @param parentFolderIdOrPath Optional parent folder ID or path (if not provided, creates at root)
     * @returns Created mail folder
     */
    async createFolder(newFolder, userEmail, parentFolderIdOrPath) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint
            let endpoint = `/users/${userEmail}`;
            if (parentFolderIdOrPath) {
                // Resolve parent folder path to ID if it's a path
                const parentFolderId = await this.resolveFolderPath(parentFolderIdOrPath, userEmail);
                endpoint += `/mailFolders/${parentFolderId}/childFolders`;
            }
            else {
                endpoint += '/mailFolders';
            }
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .post(newFolder);
            // Clear the cache since folder structure has changed
            this.folderPathCache.delete(userEmail);
            this.folderIdCache.delete(userEmail);
            return response;
        }
        catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    }
    /**
     * Update a mail folder's properties (rename)
     * @param folderIdOrPath ID or path of the folder to update
     * @param updatedFolder Updated folder properties
     * @param userEmail Email address of the user
     * @returns Updated mail folder
     */
    async updateFolder(folderIdOrPath, updatedFolder, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Resolve folder path to ID if it's a path
            const folderId = await this.resolveFolderPath(folderIdOrPath, userEmail);
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/mailFolders/${folderId}`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .patch(updatedFolder);
            // Clear the cache since folder structure has changed
            this.folderPathCache.delete(userEmail);
            this.folderIdCache.delete(userEmail);
            return response;
        }
        catch (error) {
            console.error('Error updating folder:', error);
            throw error;
        }
    }
    /**
     * Move a folder to another parent folder
     * @param folderIdOrPath ID or path of the folder to move
     * @param destinationParentFolderIdOrPath ID or path of the destination parent folder
     * @param userEmail Email address of the user
     * @returns Moved mail folder
     */
    async moveFolder(folderIdOrPath, destinationParentFolderIdOrPath, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Resolve folder paths to IDs if they're paths
            const folderId = await this.resolveFolderPath(folderIdOrPath, userEmail);
            const destinationParentFolderId = await this.resolveFolderPath(destinationParentFolderIdOrPath, userEmail);
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/mailFolders/${folderId}/move`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .post({
                destinationId: destinationParentFolderId
            });
            // Clear the cache since folder structure has changed
            this.folderPathCache.delete(userEmail);
            this.folderIdCache.delete(userEmail);
            return response;
        }
        catch (error) {
            console.error('Error moving folder:', error);
            throw error;
        }
    }
    /**
     * Copy a folder to another parent folder
     * Note: This might not be supported by the Microsoft Graph API
     * @param folderIdOrPath ID or path of the folder to copy
     * @param destinationParentFolderIdOrPath ID or path of the destination parent folder
     * @param userEmail Email address of the user
     * @returns Copied mail folder
     */
    async copyFolder(folderIdOrPath, destinationParentFolderIdOrPath, userEmail) {
        var _a;
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Resolve folder paths to IDs if they're paths
            const folderId = await this.resolveFolderPath(folderIdOrPath, userEmail);
            const destinationParentFolderId = await this.resolveFolderPath(destinationParentFolderIdOrPath, userEmail);
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/mailFolders/${folderId}/copy`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .post({
                destinationId: destinationParentFolderId
            });
            // Clear the cache since folder structure has changed
            this.folderPathCache.delete(userEmail);
            this.folderIdCache.delete(userEmail);
            return response;
        }
        catch (error) {
            const apiError = error;
            // Check if the error is because the API doesn't support folder copying
            if (apiError.statusCode === 501 || ((_a = apiError.message) === null || _a === void 0 ? void 0 : _a.includes('Not Implemented'))) {
                throw new Error('Folder copying is not supported by the Microsoft Graph API');
            }
            console.error('Error copying folder:', error);
            throw error;
        }
    }
}
exports.MailService = MailService;
