"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDraftCommand = createDraftCommand;
exports.listDraftsCommand = listDraftsCommand;
exports.getDraftCommand = getDraftCommand;
exports.updateDraftCommand = updateDraftCommand;
exports.sendDraftCommand = sendDraftCommand;
exports.deleteDraftCommand = deleteDraftCommand;
const fs = __importStar(require("fs"));
const serviceFactory_1 = require("../../services/serviceFactory");
const emailFormatter_1 = require("../formatters/emailFormatter");
const errors_1 = require("../../utils/errors");
/**
 * Command to create a new draft email
 */
async function createDraftCommand(options) {
    try {
        const draftService = serviceFactory_1.ServiceFactory.getDraftService();
        // Verify required parameters
        if (!options.subject) {
            console.error('Error: Subject is required');
            process.exit(1);
        }
        if (!options.to) {
            console.error('Error: At least one recipient (--to) is required');
            process.exit(1);
        }
        // Verify at least one body source is provided
        if (!options.file && !options.message) {
            console.error('Error: Either message (--message) or file (--file) is required');
            process.exit(1);
        }
        // Get message body
        let messageBody = options.message || '';
        if (options.file) {
            try {
                messageBody = fs.readFileSync(options.file, 'utf-8');
            }
            catch (error) {
                console.error(`Error reading file: ${error}`);
                process.exit(1);
            }
        }
        // Parse recipients
        const toRecipients = options.to.split(',').map(email => ({
            emailAddress: { address: email.trim() }
        }));
        const ccRecipients = options.cc ?
            options.cc.split(',').map(email => ({
                emailAddress: { address: email.trim() }
            })) : undefined;
        const bccRecipients = options.bcc ?
            options.bcc.split(',').map(email => ({
                emailAddress: { address: email.trim() }
            })) : undefined;
        // Create draft
        const draft = {
            subject: options.subject,
            body: {
                contentType: options.html ? 'HTML' : 'Text',
                content: messageBody
            },
            toRecipients,
            ccRecipients,
            bccRecipients
        };
        const result = await draftService.createDraft(draft, options.user);
        console.log(`\nDraft email created successfully.`);
        console.log(`Subject: ${options.subject}`);
        console.log(`To: ${options.to}`);
        if (options.cc) {
            console.log(`CC: ${options.cc}`);
        }
        if (options.bcc) {
            console.log(`BCC: ${options.bcc}`);
        }
        console.log(`ID: ${result.id}`);
    }
    catch (error) {
        console.error('Error creating draft:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to list draft emails
 */
async function listDraftsCommand(options) {
    var _a;
    try {
        const draftService = serviceFactory_1.ServiceFactory.getDraftService();
        const limit = parseInt(options.limit || '25');
        const drafts = await draftService.listDrafts(options.user, limit);
        console.log(`\nDrafts for User: ${options.user}\n`);
        if (drafts.length === 0) {
            console.log('No drafts found.');
            return;
        }
        for (let i = 0; i < drafts.length; i++) {
            const draft = drafts[i];
            const recipients = ((_a = draft.toRecipients) === null || _a === void 0 ? void 0 : _a.map((r) => r.emailAddress.address).join(', ')) || 'No recipients';
            const lastModified = draft.lastModifiedDateTime
                ? new Date(draft.lastModifiedDateTime).toLocaleString()
                : 'Unknown';
            console.log(`${i + 1}. ${draft.subject || '(No subject)'}`);
            console.log(`   To: ${recipients}`);
            console.log(`   Last Modified: ${lastModified}`);
            console.log(`   ID: ${draft.id}`);
            console.log('');
        }
        console.log(`Found ${drafts.length} draft(s).`);
    }
    catch (error) {
        console.error('Error listing drafts:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to get a specific draft email
 */
async function getDraftCommand(draftId, options) {
    try {
        const draftService = serviceFactory_1.ServiceFactory.getDraftService();
        const draft = await draftService.getDraft(draftId, options.user);
        console.log(`\nDraft Email Details (ID: ${draftId})\n`);
        (0, emailFormatter_1.printEmailDetails)(draft);
    }
    catch (error) {
        console.error('Error getting draft:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to update an existing draft email
 */
async function updateDraftCommand(draftId, options) {
    try {
        const draftService = serviceFactory_1.ServiceFactory.getDraftService();
        // Create update object
        const draftUpdates = {};
        // Update subject if provided
        if (options.subject) {
            draftUpdates.subject = options.subject;
        }
        // Update body if provided
        if (options.file || options.message) {
            let messageBody = options.message || '';
            if (options.file) {
                try {
                    messageBody = fs.readFileSync(options.file, 'utf-8');
                }
                catch (error) {
                    console.error(`Error reading file: ${error}`);
                    process.exit(1);
                }
            }
            draftUpdates.body = {
                contentType: options.html ? 'HTML' : 'Text',
                content: messageBody
            };
        }
        // Update recipients if provided
        if (options.to) {
            draftUpdates.toRecipients = options.to.split(',').map(email => ({
                emailAddress: { address: email.trim() }
            }));
        }
        if (options.cc) {
            draftUpdates.ccRecipients = options.cc.split(',').map(email => ({
                emailAddress: { address: email.trim() }
            }));
        }
        if (options.bcc) {
            draftUpdates.bccRecipients = options.bcc.split(',').map(email => ({
                emailAddress: { address: email.trim() }
            }));
        }
        // Only update if there's at least one change
        if (Object.keys(draftUpdates).length === 0) {
            console.log('\nNo updates provided. Draft remains unchanged.');
            return;
        }
        // Update draft
        await draftService.updateDraft(draftId, draftUpdates, options.user);
        console.log(`\nDraft email updated successfully.`);
        // Show what was updated
        const updates = [];
        if (draftUpdates.subject)
            updates.push(`Subject: ${draftUpdates.subject}`);
        if (draftUpdates.body)
            updates.push('Body content');
        if (draftUpdates.toRecipients)
            updates.push(`To: ${options.to}`);
        if (draftUpdates.ccRecipients)
            updates.push(`CC: ${options.cc}`);
        if (draftUpdates.bccRecipients)
            updates.push(`BCC: ${options.bcc}`);
        console.log(`Updated: ${updates.join(', ')}`);
    }
    catch (error) {
        console.error('Error updating draft:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to send a draft email
 */
async function sendDraftCommand(draftId, options) {
    try {
        const draftService = serviceFactory_1.ServiceFactory.getDraftService();
        await draftService.sendDraft(draftId, options.user);
        console.log(`\nDraft email sent successfully.`);
    }
    catch (error) {
        console.error('Error sending draft:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to delete a draft email
 */
async function deleteDraftCommand(draftId, options) {
    try {
        const draftService = serviceFactory_1.ServiceFactory.getDraftService();
        await draftService.deleteDraft(draftId, options.user);
        console.log(`\nDraft email deleted successfully.`);
    }
    catch (error) {
        console.error('Error deleting draft:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
