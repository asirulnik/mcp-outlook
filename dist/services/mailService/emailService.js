"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const graphConfig_1 = require("../../config/graphConfig");
const htmlToText_1 = require("../../utils/htmlToText");
const errors_1 = require("../../utils/errors");
/**
 * Service for handling email operations
 */
class EmailService {
    constructor(authService, folderService) {
        this.client = authService.getClient();
        this.folderService = folderService;
    }
    /**
     * List emails in a folder with optional search and date filtering
     * @param folderIdOrPath Folder ID, wellKnownName (like 'inbox'), or path (like '/Inbox')
     * @param userEmail Email address of the user
     * @param limit Number of emails to retrieve (default: 25)
     * @param searchOptions Optional search and date filters
     * @returns List of email messages (with optional bodies)
     */
    async listEmails(folderIdOrPath, userEmail, limit = 25, searchOptions) {
        try {
            if (!userEmail) {
                throw new errors_1.ValidationError('User email is required for application permissions flow');
            }
            if (!folderIdOrPath) {
                throw new errors_1.ValidationError('Folder ID or path is required');
            }
            // Resolve folder path to ID if it's a path
            let folderId;
            try {
                folderId = await this.folderService.resolveFolderPath(folderIdOrPath, userEmail);
            }
            catch (error) {
                throw new errors_1.NotFoundError(`Folder not found: ${folderIdOrPath}`);
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/mailFolders/${folderId}/messages`;
            // When initializing query parameters, don't include orderby if we're going to search
            // Microsoft Graph API doesn't support using $search and $orderby together
            const willUseSearch = searchOptions && searchOptions.searchQuery && searchOptions.searchQuery.trim().length > 0;
            // Determine sort field and order
            const sortField = (searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.sortBy) || 'receivedDateTime';
            const sortOrder = (searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.sortOrder) || 'desc';
            const sortString = `${sortField} ${sortOrder}`;
            // Get base query parameters
            let queryParams = graphConfig_1.graphConfig.emailQueryParams(limit, (searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.includeBodies) || false);
            // Replace default sort with custom sort if specified
            if (sortField !== 'receivedDateTime' || sortOrder !== 'desc') {
                queryParams = queryParams.replace(/&\$orderby=receivedDateTime desc/, `&$orderby=${sortString}`);
            }
            // If we're searching, don't include orderby
            if (willUseSearch) {
                queryParams = queryParams.replace(/&\$orderby=[^&]+/, '');
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
            let emails = response.value;
            // Process message bodies if requested to hide quoted content
            if ((searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.includeBodies) && searchOptions.hideQuotedContent && emails.length > 0) {
                // Process each email to hide quoted content
                emails = emails.map((email) => {
                    if (email.body) {
                        if (email.body.contentType === 'html') {
                            // Convert HTML to text to identify quoted content
                            const plainText = (0, htmlToText_1.htmlToText)(email.body.content);
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
            console.error('Error listing emails:', error);
            return (0, errors_1.handleGraphError)(error);
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
                throw new errors_1.ValidationError('User email is required for application permissions flow');
            }
            if (!emailId) {
                throw new errors_1.ValidationError('Email ID is required');
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${emailId}`;
            // Query parameters to include body and attachments
            const queryParams = graphConfig_1.graphConfig.emailDetailsQueryParams;
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
                if (response.body.contentType === 'html') {
                    // Convert HTML to text to identify quoted content
                    const plainText = (0, htmlToText_1.htmlToText)(response.body.content);
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
            return (0, errors_1.handleGraphError)(error);
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
            const destinationFolderId = await this.folderService.resolveFolderPath(destinationFolderIdOrPath, userEmail);
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
            const destinationFolderId = await this.folderService.resolveFolderPath(destinationFolderIdOrPath, userEmail);
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
     * List attachments for a specific email
     * @param emailId ID of the email
     * @param userEmail Email address of the user
     * @returns List of attachments
     */
    async listAttachments(emailId, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${emailId}/attachments`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .get();
            return response.value;
        }
        catch (error) {
            console.error('Error listing attachments:', error);
            throw error;
        }
    }
    /**
     * Download an attachment from an email
     * @param emailId ID of the email containing the attachment
     * @param attachmentId ID of the attachment to download
     * @param userEmail Email address of the user
     * @returns Attachment with content
     */
    async downloadAttachment(emailId, attachmentId, userEmail) {
        try {
            if (!userEmail) {
                throw new errors_1.ValidationError('User email is required for application permissions flow');
            }
            if (!emailId) {
                throw new errors_1.ValidationError('Email ID is required');
            }
            if (!attachmentId) {
                throw new errors_1.ValidationError('Attachment ID is required');
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${emailId}/attachments/${attachmentId}`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .get();
            return response;
        }
        catch (error) {
            console.error('Error downloading attachment:', error);
            return (0, errors_1.handleGraphError)(error);
        }
    }
}
exports.EmailService = EmailService;
