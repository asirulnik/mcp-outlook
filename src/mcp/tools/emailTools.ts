import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServiceFactory } from '../../services/serviceFactory';
import { EmailSearchOptions } from '../../models/email';
import { htmlToText } from '../../utils/htmlToText';

/**
 * Register email-related MCP tools with the server
 * @param server MCP server instance
 */
export function registerEmailTools(server: McpServer): void {
  // 1. List emails tool with options for full bodies and hiding quoted content
  server.tool(
    'list-emails',
    { 
      userEmail: z.string().email(),
      folderId: z.string(),
      limit: z.number().min(1).max(100).optional().default(25),
      includeBodies: z.boolean().optional().default(false),
      hideQuotedContent: z.boolean().optional().default(false),
      searchOptions: z.object({
      beforeDate: z.string().optional(),
      afterDate: z.string().optional(),
      previousPeriod: z.object({
      value: z.number(),
      unit: z.enum(['days', 'weeks', 'months', 'years'])
      }).optional(),
      searchQuery: z.string().optional(),
      searchFields: z.array(z.enum(['subject', 'body', 'from', 'recipients', 'all'])).optional(),
        sortBy: z.enum(['receivedDateTime', 'sentDateTime', 'subject', 'importance']).optional(),
          sortOrder: z.enum(['asc', 'desc']).optional()
        }).optional()
    },
    async ({ userEmail, folderId, limit, includeBodies, hideQuotedContent, searchOptions }) => {
      try {
        const emailService = ServiceFactory.getEmailService();
        
        // Process search options
        const searchParams: EmailSearchOptions = {
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
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error listing emails: ${error}`
          }],
          isError: true
        };
      }
    }
  );

  // 2. Read email tool with option to hide quoted content
  server.tool(
    'read-email',
    { 
      userEmail: z.string().email(),
      emailId: z.string(),
      convertHtmlToText: z.boolean().optional().default(true),
      hideQuotedContent: z.boolean().optional().default(false),
      htmlToTextOptions: z.object({
        wordwrap: z.union([z.number(), z.boolean()]).optional(),
        preserveNewlines: z.boolean().optional(),
        tables: z.boolean().optional(),
        preserveHrefLinks: z.boolean().optional(),
        headingStyle: z.enum(['underline', 'linebreak', 'hashify']).optional()
      }).optional()
    },
    async ({ userEmail, emailId, convertHtmlToText, hideQuotedContent, htmlToTextOptions }) => {
      try {
        const emailService = ServiceFactory.getEmailService();
        const email = await emailService.getEmail(emailId, userEmail, hideQuotedContent);
        
        // Process HTML content if needed
        if (convertHtmlToText && 
            email.body && 
            email.body.contentType === 'html') {
          
          // Apply HTML to text conversion
          const defaultOptions = {
            wordwrap: 100 as number | false,
            preserveNewlines: true,
            tables: true,
            preserveHrefLinks: true,
            headingStyle: 'linebreak' as const
          };
          
          const options = {
            ...defaultOptions,
            ...htmlToTextOptions,
            wordwrap: typeof htmlToTextOptions?.wordwrap === 'boolean' && htmlToTextOptions.wordwrap ? 100 : htmlToTextOptions?.wordwrap
          };
          
          // Convert HTML to plain text
          email.body.plainTextContent = htmlToText(email.body.content, options);
          
          // If we have the original content (before removing quoted parts), convert that too
          if (hideQuotedContent && email.body.originalContent) {
            email.body.originalPlainTextContent = htmlToText(email.body.originalContent, options);
          }
        }
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(email, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error reading email: ${error}`
          }],
          isError: true
        };
      }
    }
  );

  // 3. Move email tool
  server.tool(
    'move-email',
    { 
      userEmail: z.string().email(),
      emailId: z.string(),
      destinationFolderId: z.string()
    },
    async ({ userEmail, emailId, destinationFolderId }) => {
      try {
        const emailService = ServiceFactory.getEmailService();
        const result = await emailService.moveEmail(emailId, destinationFolderId, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: `Email ${emailId} successfully moved to folder ${destinationFolderId}`
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error moving email: ${error}`
          }],
          isError: true
        };
      }
    }
  );

  // 4. Copy email tool
  server.tool(
    'copy-email',
    { 
      userEmail: z.string().email(),
      emailId: z.string(),
      destinationFolderId: z.string()
    },
    async ({ userEmail, emailId, destinationFolderId }) => {
      try {
        const emailService = ServiceFactory.getEmailService();
        const result = await emailService.copyEmail(emailId, destinationFolderId, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: `Email ${emailId} successfully copied to folder ${destinationFolderId}`
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error copying email: ${error}`
          }],
          isError: true
        };
      }
    }
  );

  // 6. List attachments tool
  server.tool(
    'list-attachments',
    { 
      userEmail: z.string().email(),
      emailId: z.string()
    },
    async ({ userEmail, emailId }) => {
      try {
        const emailService = ServiceFactory.getEmailService();
        const attachments = await emailService.listAttachments(emailId, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(attachments, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error listing attachments: ${error}`
          }],
          isError: true
        };
      }
    }
  );

  // 7. Download attachment tool
  server.tool(
    'download-attachment',
    { 
      userEmail: z.string().email(),
      emailId: z.string(),
      attachmentId: z.string()
    },
    async ({ userEmail, emailId, attachmentId }) => {
      try {
        const emailService = ServiceFactory.getEmailService();
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
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error downloading attachment: ${error}`
          }],
          isError: true
        };
      }
    }
  );

  // 5. Convert HTML to plain text tool
  server.tool(
    'convert-html-to-text',
    { 
      html: z.string(),
      options: z.object({
        wordwrap: z.union([z.number(), z.boolean()]).optional(),
        preserveNewlines: z.boolean().optional(),
        tables: z.boolean().optional(),
        preserveHrefLinks: z.boolean().optional(),
        headingStyle: z.enum(['underline', 'linebreak', 'hashify']).optional(),
        bulletIndent: z.number().optional(),
        listIndent: z.number().optional(),
        maxLineLength: z.number().optional(),
        hideQuotedContent: z.boolean().optional()
      }).optional()
    },
    async ({ html, options }) => {
      try {
        // Default options
        const defaultOptions = {
          wordwrap: 100 as number | false,
          preserveNewlines: true,
          tables: true,
          preserveHrefLinks: true,
          headingStyle: 'linebreak' as const,
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
          wordwrap: typeof options?.wordwrap === 'boolean' && options.wordwrap ? 100 : options?.wordwrap
        };
        
        // Convert HTML to plain text
        let plainText = htmlToText(html, convertOptions);
        
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
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error converting HTML to text: ${error}`
          }],
          isError: true
        };
      }
    }
  );
}
