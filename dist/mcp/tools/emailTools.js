"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEmailTools = registerEmailTools;
const zod_1 = require("zod");
const serviceFactory_1 = require("../../services/serviceFactory");
const htmlToText_1 = require("../../utils/htmlToText");
/**
 * Register email-related MCP tools with the server
 * @param server MCP server instance
 */
function registerEmailTools(server) {
    // 1. List emails tool with options for full bodies and hiding quoted content
    server.tool('list-emails', {
        userEmail: zod_1.z.string().email(),
        folderId: zod_1.z.string(),
        limit: zod_1.z.number().min(1).max(100).optional().default(25),
        includeBodies: zod_1.z.boolean().optional().default(false),
        hideQuotedContent: zod_1.z.boolean().optional().default(false),
        searchOptions: zod_1.z.object({
            beforeDate: zod_1.z.string().optional(),
            afterDate: zod_1.z.string().optional(),
            previousPeriod: zod_1.z.object({
                value: zod_1.z.number(),
                unit: zod_1.z.enum(['days', 'weeks', 'months', 'years'])
            }).optional(),
            searchQuery: zod_1.z.string().optional(),
            searchFields: zod_1.z.array(zod_1.z.enum(['subject', 'body', 'from', 'recipients', 'all'])).optional(),
            sortBy: zod_1.z.enum(['receivedDateTime', 'sentDateTime', 'subject', 'importance']).optional(),
            sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
        }).optional()
    }, async ({ userEmail, folderId, limit, includeBodies, hideQuotedContent, searchOptions }) => {
        try {
            const emailService = serviceFactory_1.ServiceFactory.getEmailService();
            // Process search options
            const searchParams = {
                includeBodies,
                hideQuotedContent
            };
            if (searchOptions) {
                // Process date options
                if (searchOptions.beforeDate) {
                    searchParams.beforeDate = new Date(searchOptions.beforeDate);
                }
                if (searchOptions.afterDate) {
                    searchParams.afterDate = new Date(searchOptions.afterDate);
                }
                // Process previous period
                if (searchOptions.previousPeriod) {
                    searchParams.previousPeriod = searchOptions.previousPeriod;
                }
                // Process search query and fields
                if (searchOptions.searchQuery) {
                    searchParams.searchQuery = searchOptions.searchQuery;
                    searchParams.searchFields = searchOptions.searchFields;
                }
                // Process sort options
                if (searchOptions.sortBy) {
                    searchParams.sortBy = searchOptions.sortBy;
                }
                if (searchOptions.sortOrder) {
                    searchParams.sortOrder = searchOptions.sortOrder;
                }
            }
            const emails = await emailService.listEmails(folderId, userEmail, limit, searchParams);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(emails, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error listing emails: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 2. Read email tool with option to hide quoted content
    server.tool('read-email', {
        userEmail: zod_1.z.string().email(),
        emailId: zod_1.z.string(),
        convertHtmlToText: zod_1.z.boolean().optional().default(true),
        hideQuotedContent: zod_1.z.boolean().optional().default(false),
        htmlToTextOptions: zod_1.z.object({
            wordwrap: zod_1.z.union([zod_1.z.number(), zod_1.z.boolean()]).optional(),
            preserveNewlines: zod_1.z.boolean().optional(),
            tables: zod_1.z.boolean().optional(),
            preserveHrefLinks: zod_1.z.boolean().optional(),
            headingStyle: zod_1.z.enum(['underline', 'linebreak', 'hashify']).optional()
        }).optional()
    }, async ({ userEmail, emailId, convertHtmlToText, hideQuotedContent, htmlToTextOptions }) => {
        try {
            const emailService = serviceFactory_1.ServiceFactory.getEmailService();
            const email = await emailService.getEmail(emailId, userEmail, hideQuotedContent);
            // Process HTML content if needed
            if (convertHtmlToText &&
                email.body &&
                email.body.contentType === 'html') {
                // Apply HTML to text conversion
                const defaultOptions = {
                    wordwrap: 100,
                    preserveNewlines: true,
                    tables: true,
                    preserveHrefLinks: true,
                    headingStyle: 'linebreak'
                };
                const options = {
                    ...defaultOptions,
                    ...htmlToTextOptions,
                    wordwrap: typeof (htmlToTextOptions === null || htmlToTextOptions === void 0 ? void 0 : htmlToTextOptions.wordwrap) === 'boolean' && htmlToTextOptions.wordwrap ? 100 : htmlToTextOptions === null || htmlToTextOptions === void 0 ? void 0 : htmlToTextOptions.wordwrap
                };
                // Convert HTML to plain text
                email.body.plainTextContent = (0, htmlToText_1.htmlToText)(email.body.content, options);
                // If we have the original content (before removing quoted parts), convert that too
                if (hideQuotedContent && email.body.originalContent) {
                    email.body.originalPlainTextContent = (0, htmlToText_1.htmlToText)(email.body.originalContent, options);
                }
            }
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(email, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error reading email: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 3. Move email tool
    server.tool('move-email', {
        userEmail: zod_1.z.string().email(),
        emailId: zod_1.z.string(),
        destinationFolderId: zod_1.z.string()
    }, async ({ userEmail, emailId, destinationFolderId }) => {
        try {
            const emailService = serviceFactory_1.ServiceFactory.getEmailService();
            const result = await emailService.moveEmail(emailId, destinationFolderId, userEmail);
            return {
                content: [{
                        type: 'text',
                        text: `Email ${emailId} successfully moved to folder ${destinationFolderId}`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error moving email: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 4. Copy email tool
    server.tool('copy-email', {
        userEmail: zod_1.z.string().email(),
        emailId: zod_1.z.string(),
        destinationFolderId: zod_1.z.string()
    }, async ({ userEmail, emailId, destinationFolderId }) => {
        try {
            const emailService = serviceFactory_1.ServiceFactory.getEmailService();
            const result = await emailService.copyEmail(emailId, destinationFolderId, userEmail);
            return {
                content: [{
                        type: 'text',
                        text: `Email ${emailId} successfully copied to folder ${destinationFolderId}`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error copying email: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 6. List attachments tool
    server.tool('list-attachments', {
        userEmail: zod_1.z.string().email(),
        emailId: zod_1.z.string()
    }, async ({ userEmail, emailId }) => {
        try {
            const emailService = serviceFactory_1.ServiceFactory.getEmailService();
            const attachments = await emailService.listAttachments(emailId, userEmail);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(attachments, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error listing attachments: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 7. Download attachment tool
    server.tool('download-attachment', {
        userEmail: zod_1.z.string().email(),
        emailId: zod_1.z.string(),
        attachmentId: zod_1.z.string()
    }, async ({ userEmail, emailId, attachmentId }) => {
        try {
            const emailService = serviceFactory_1.ServiceFactory.getEmailService();
            const attachment = await emailService.downloadAttachment(emailId, attachmentId, userEmail);
            // For MCP server mode, we return the base64 content and metadata
            // The client is responsible for saving the file
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            name: attachment.name,
                            contentType: attachment.contentType,
                            size: attachment.size,
                            contentBytes: attachment.contentBytes
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error downloading attachment: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 5. Convert HTML to plain text tool
    server.tool('convert-html-to-text', {
        html: zod_1.z.string(),
        options: zod_1.z.object({
            wordwrap: zod_1.z.union([zod_1.z.number(), zod_1.z.boolean()]).optional(),
            preserveNewlines: zod_1.z.boolean().optional(),
            tables: zod_1.z.boolean().optional(),
            preserveHrefLinks: zod_1.z.boolean().optional(),
            headingStyle: zod_1.z.enum(['underline', 'linebreak', 'hashify']).optional(),
            bulletIndent: zod_1.z.number().optional(),
            listIndent: zod_1.z.number().optional(),
            maxLineLength: zod_1.z.number().optional(),
            hideQuotedContent: zod_1.z.boolean().optional()
        }).optional()
    }, async ({ html, options }) => {
        try {
            // Default options
            const defaultOptions = {
                wordwrap: 100,
                preserveNewlines: true,
                tables: true,
                preserveHrefLinks: true,
                headingStyle: 'linebreak',
                hideQuotedContent: false
            };
            // Ensure wordwrap is either number or false, not true
            const safeOptions = { ...options };
            if (typeof safeOptions.wordwrap === 'boolean' && safeOptions.wordwrap === true) {
                safeOptions.wordwrap = 100;
            }
            // Apply options if provided
            const convertOptions = {
                ...defaultOptions,
                ...options,
                wordwrap: typeof (options === null || options === void 0 ? void 0 : options.wordwrap) === 'boolean' && options.wordwrap ? 100 : options === null || options === void 0 ? void 0 : options.wordwrap
            };
            // Convert HTML to plain text
            let plainText = (0, htmlToText_1.htmlToText)(html, convertOptions);
            // If hideQuotedContent is enabled, extract only the main message
            if (convertOptions.hideQuotedContent) {
                const parts = plainText.split('\n---\n');
                if (parts.length > 1) {
                    plainText = parts[0] + '\n\n[Prior quoted messages removed]';
                }
            }
            return {
                content: [{
                        type: 'text',
                        text: plainText
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error converting HTML to text: ${error}`
                    }],
                isError: true
            };
        }
    });
}
