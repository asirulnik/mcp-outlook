import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServiceFactory } from '../../services/serviceFactory';
import { DraftWithOptionalRecipients } from '../../models/draft';
import { promptConfig, formatMessage } from '../../config/prompts';

/**
 * Register draft-related MCP tools with the server
 * @param server MCP server instance
 */
export function registerDraftTools(server: McpServer): void {
  const draftConfig = promptConfig.tools.draft;

  // 1. Create email draft tool
  server.tool(
    'create-draft',
    { 
      userEmail: z.string().email().describe(draftConfig.createDraft.parameters.userEmail),
      subject: z.string().describe(draftConfig.createDraft.parameters.subject),
      body: z.string().describe(draftConfig.createDraft.parameters.body),
      isHtml: z.boolean().optional().default(false).describe(draftConfig.createDraft.parameters.contentType),
      to: z.array(z.string().email()).describe(draftConfig.createDraft.parameters.toRecipients),
      cc: z.array(z.string().email()).optional().describe(draftConfig.createDraft.parameters.ccRecipients),
      bcc: z.array(z.string().email()).optional().describe(draftConfig.createDraft.parameters.bccRecipients)
    },
    async ({ userEmail, subject, body, isHtml, to, cc, bcc }) => {
      try {
        const draftService = ServiceFactory.getDraftService();
        
        const draft: DraftWithOptionalRecipients = {
          subject,
          body: {
            contentType: isHtml ? 'HTML' : 'Text',
            content: body
          },
          toRecipients: to.map(email => ({
            emailAddress: { address: email }
          }))
        };
        
        // Add CC if provided
        if (cc && cc.length > 0) {
          draft.ccRecipients = cc.map(email => ({
            emailAddress: { address: email }
          }));
        }
        
        // Add BCC if provided
        if (bcc && bcc.length > 0) {
          draft.bccRecipients = bcc.map(email => ({
            emailAddress: { address: email }
          }));
        }
        
        const result = await draftService.createDraft(draft, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.createDraft.responses.success, { subject })
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.createDraft.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 2. List drafts tool
  server.tool(
    'list-drafts',
    { 
      userEmail: z.string().email().describe(draftConfig.listDrafts.parameters.userEmail),
      limit: z.number().min(1).max(100).optional().default(25).describe(draftConfig.listDrafts.parameters.limit)
    },
    async ({ userEmail, limit }) => {
      try {
        const draftService = ServiceFactory.getDraftService();
        const drafts = await draftService.listDrafts(userEmail, limit);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(drafts, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.listDrafts.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 3. Get draft tool
  server.tool(
    'get-draft',
    { 
      userEmail: z.string().email().describe(draftConfig.getDraft.parameters.userEmail),
      draftId: z.string().describe(draftConfig.getDraft.parameters.draftId)
    },
    async ({ userEmail, draftId }) => {
      try {
        const draftService = ServiceFactory.getDraftService();
        const draft = await draftService.getDraft(draftId, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(draft, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.getDraft.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 4. Update draft tool
  server.tool(
    'update-draft',
    { 
      userEmail: z.string().email().describe(draftConfig.updateDraft.parameters.userEmail),
      draftId: z.string().describe(draftConfig.updateDraft.parameters.draftId),
      subject: z.string().optional().describe(draftConfig.updateDraft.parameters.subject),
      body: z.string().optional().describe(draftConfig.updateDraft.parameters.body),
      isHtml: z.boolean().optional().describe(draftConfig.updateDraft.parameters.contentType),
      to: z.array(z.string().email()).optional().describe(draftConfig.updateDraft.parameters.toRecipients),
      cc: z.array(z.string().email()).optional().describe(draftConfig.updateDraft.parameters.ccRecipients),
      bcc: z.array(z.string().email()).optional().describe(draftConfig.updateDraft.parameters.bccRecipients)
    },
    async ({ userEmail, draftId, subject, body, isHtml, to, cc, bcc }) => {
      try {
        const draftService = ServiceFactory.getDraftService();
        
        // Create an empty updates object
        const draftUpdates: Partial<DraftWithOptionalRecipients> = {};
        
        // Add subject if provided
        if (subject !== undefined) {
          draftUpdates.subject = subject;
        }
        
        // Add body if provided
        if (body !== undefined) {
          draftUpdates.body = {
            contentType: isHtml ? 'HTML' : 'Text',
            content: body
          };
        }
        
        // Add recipients if provided
        if (to !== undefined) {
          draftUpdates.toRecipients = to.map(email => ({
            emailAddress: { address: email }
          }));
        }
        
        if (cc !== undefined) {
          draftUpdates.ccRecipients = cc.map(email => ({
            emailAddress: { address: email }
          }));
        }
        
        if (bcc !== undefined) {
          draftUpdates.bccRecipients = bcc.map(email => ({
            emailAddress: { address: email }
          }));
        }
        
        // Only update if there's at least one change
        if (Object.keys(draftUpdates).length === 0) {
          return {
            content: [{ 
              type: 'text', 
              text: 'No updates provided. Draft remains unchanged.'
            }]
          };
        }
        
        const result = await draftService.updateDraft(draftId, draftUpdates, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.updateDraft.responses.success, {})
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.updateDraft.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 5. Send draft tool
  server.tool(
    'send-draft',
    { 
      userEmail: z.string().email().describe(draftConfig.sendDraft.parameters.userEmail),
      draftId: z.string().describe(draftConfig.sendDraft.parameters.draftId)
    },
    async ({ userEmail, draftId }) => {
      try {
        const draftService = ServiceFactory.getDraftService();
        await draftService.sendDraft(draftId, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.sendDraft.responses.success, {})
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.sendDraft.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 6. Delete draft tool
  server.tool(
    'delete-draft',
    { 
      userEmail: z.string().email().describe(draftConfig.deleteDraft.parameters.userEmail),
      draftId: z.string().describe(draftConfig.deleteDraft.parameters.draftId)
    },
    async ({ userEmail, draftId }) => {
      try {
        const draftService = ServiceFactory.getDraftService();
        await draftService.deleteDraft(draftId, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.deleteDraft.responses.success, {})
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(draftConfig.deleteDraft.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );
}
