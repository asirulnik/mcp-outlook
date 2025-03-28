"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDraftTools = registerDraftTools;
const zod_1 = require("zod");
const serviceFactory_1 = require("../../services/serviceFactory");
const prompts_1 = require("../../config/prompts");
/**
 * Register draft-related MCP tools with the server
 * @param server MCP server instance
 */
function registerDraftTools(server) {
    const draftConfig = prompts_1.promptConfig.tools.draft;
    // 1. Create email draft tool
    server.tool('create-draft', {
        userEmail: zod_1.z.string().email().describe(draftConfig.createDraft.parameters.userEmail),
        subject: zod_1.z.string().describe(draftConfig.createDraft.parameters.subject),
        body: zod_1.z.string().describe(draftConfig.createDraft.parameters.body),
        isHtml: zod_1.z.boolean().optional().default(false).describe(draftConfig.createDraft.parameters.contentType),
        to: zod_1.z.array(zod_1.z.string().email()).describe(draftConfig.createDraft.parameters.toRecipients),
        cc: zod_1.z.array(zod_1.z.string().email()).optional().describe(draftConfig.createDraft.parameters.ccRecipients),
        bcc: zod_1.z.array(zod_1.z.string().email()).optional().describe(draftConfig.createDraft.parameters.bccRecipients)
    }, async ({ userEmail, subject, body, isHtml, to, cc, bcc }) => {
        try {
            const draftService = serviceFactory_1.ServiceFactory.getDraftService();
            const draft = {
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
                        text: (0, prompts_1.formatMessage)(draftConfig.createDraft.responses.success, { subject })
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(draftConfig.createDraft.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 2. List drafts tool
    server.tool('list-drafts', {
        userEmail: zod_1.z.string().email().describe(draftConfig.listDrafts.parameters.userEmail),
        limit: zod_1.z.number().min(1).max(100).optional().default(25).describe(draftConfig.listDrafts.parameters.limit)
    }, async ({ userEmail, limit }) => {
        try {
            const draftService = serviceFactory_1.ServiceFactory.getDraftService();
            const drafts = await draftService.listDrafts(userEmail, limit);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(drafts, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(draftConfig.listDrafts.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 3. Get draft tool
    server.tool('get-draft', {
        userEmail: zod_1.z.string().email().describe(draftConfig.getDraft.parameters.userEmail),
        draftId: zod_1.z.string().describe(draftConfig.getDraft.parameters.draftId)
    }, async ({ userEmail, draftId }) => {
        try {
            const draftService = serviceFactory_1.ServiceFactory.getDraftService();
            const draft = await draftService.getDraft(draftId, userEmail);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(draft, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(draftConfig.getDraft.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 4. Update draft tool
    server.tool('update-draft', {
        userEmail: zod_1.z.string().email().describe(draftConfig.updateDraft.parameters.userEmail),
        draftId: zod_1.z.string().describe(draftConfig.updateDraft.parameters.draftId),
        subject: zod_1.z.string().optional().describe(draftConfig.updateDraft.parameters.subject),
        body: zod_1.z.string().optional().describe(draftConfig.updateDraft.parameters.body),
        isHtml: zod_1.z.boolean().optional().describe(draftConfig.updateDraft.parameters.contentType),
        to: zod_1.z.array(zod_1.z.string().email()).optional().describe(draftConfig.updateDraft.parameters.toRecipients),
        cc: zod_1.z.array(zod_1.z.string().email()).optional().describe(draftConfig.updateDraft.parameters.ccRecipients),
        bcc: zod_1.z.array(zod_1.z.string().email()).optional().describe(draftConfig.updateDraft.parameters.bccRecipients)
    }, async ({ userEmail, draftId, subject, body, isHtml, to, cc, bcc }) => {
        try {
            const draftService = serviceFactory_1.ServiceFactory.getDraftService();
            // Create an empty updates object
            const draftUpdates = {};
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
                        text: (0, prompts_1.formatMessage)(draftConfig.updateDraft.responses.success, {})
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(draftConfig.updateDraft.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 5. Send draft tool
    server.tool('send-draft', {
        userEmail: zod_1.z.string().email().describe(draftConfig.sendDraft.parameters.userEmail),
        draftId: zod_1.z.string().describe(draftConfig.sendDraft.parameters.draftId)
    }, async ({ userEmail, draftId }) => {
        try {
            const draftService = serviceFactory_1.ServiceFactory.getDraftService();
            await draftService.sendDraft(draftId, userEmail);
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(draftConfig.sendDraft.responses.success, {})
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(draftConfig.sendDraft.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 6. Delete draft tool
    server.tool('delete-draft', {
        userEmail: zod_1.z.string().email().describe(draftConfig.deleteDraft.parameters.userEmail),
        draftId: zod_1.z.string().describe(draftConfig.deleteDraft.parameters.draftId)
    }, async ({ userEmail, draftId }) => {
        try {
            const draftService = serviceFactory_1.ServiceFactory.getDraftService();
            await draftService.deleteDraft(draftId, userEmail);
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(draftConfig.deleteDraft.responses.success, {})
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(draftConfig.deleteDraft.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
}
