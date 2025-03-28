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
exports.listEmailsCommand = listEmailsCommand;
exports.readEmailCommand = readEmailCommand;
exports.moveEmailCommand = moveEmailCommand;
exports.copyEmailCommand = copyEmailCommand;
exports.listAttachmentsCommand = listAttachmentsCommand;
exports.downloadAttachmentCommand = downloadAttachmentCommand;
const serviceFactory_1 = require("../../services/serviceFactory");
const emailFormatter_1 = require("../formatters/emailFormatter");
const errors_1 = require("../../utils/errors");
const fs = __importStar(require("fs"));
/**
 * Command to list emails in a folder
 */
async function listEmailsCommand(folderIdOrPath, options) {
    var _a, _b;
    try {
        const emailService = serviceFactory_1.ServiceFactory.getEmailService();
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        // Resolve path if needed
        let folderPath = folderIdOrPath;
        if (!folderIdOrPath.startsWith('/')) {
            folderPath = await folderService.getFolderPath(folderIdOrPath, options.user);
        }
        // Process search and date filters
        const searchOptions = {
            includeBodies: options.includeBodies === true,
            hideQuotedContent: options.hideQuoted === true
        };
        // Process sort options
        if (options.sortBy) {
            const validSortFields = ['receivedDateTime', 'sentDateTime', 'subject', 'importance'];
            if (validSortFields.includes(options.sortBy)) {
                searchOptions.sortBy = options.sortBy;
            }
            else {
                console.warn(`Warning: Invalid sort field '${options.sortBy}'. Using default 'receivedDateTime'.`);
            }
        }
        if (options.sortOrder) {
            if (['asc', 'desc'].includes(options.sortOrder.toLowerCase())) {
                searchOptions.sortOrder = options.sortOrder.toLowerCase();
            }
            else {
                console.warn(`Warning: Invalid sort order '${options.sortOrder}'. Using default 'desc'.`);
            }
        }
        if (options.before) {
            searchOptions.beforeDate = new Date(options.before);
            // Set time to end of day
            searchOptions.beforeDate.setHours(23, 59, 59, 999);
        }
        if (options.after) {
            searchOptions.afterDate = new Date(options.after);
            // Set time to start of day
            searchOptions.afterDate.setHours(0, 0, 0, 0);
        }
        if (options.previous && !isNaN(parseInt(options.previous))) {
            const value = parseInt(options.previous);
            const unit = options.unit;
            if (['days', 'weeks', 'months', 'years'].includes(unit)) {
                searchOptions.previousPeriod = { value, unit };
            }
            else {
                console.warn(`Warning: Invalid time unit '${unit}'. Using 'days' instead.`);
                searchOptions.previousPeriod = { value, unit: 'days' };
            }
        }
        // Process search options
        if (options.search) {
            searchOptions.searchQuery = options.search;
            // Process search fields
            if (options.fields) {
                const validFields = ['subject', 'body', 'from', 'recipients', 'all'];
                const requestedFields = options.fields.split(',').map((f) => f.trim().toLowerCase());
                // Filter to only valid field values
                searchOptions.searchFields = requestedFields.filter((f) => validFields.includes(f));
                // If no valid fields specified, default to 'all'
                if (searchOptions.searchFields.length === 0) {
                    searchOptions.searchFields = ['all'];
                }
            }
            else {
                // Default to all fields
                searchOptions.searchFields = ['all'];
            }
        }
        const emails = await emailService.listEmails(folderIdOrPath, options.user, parseInt(options.limit || '25'), Object.keys(searchOptions).length > 0 ? searchOptions : undefined);
        // Prepare filter description for output
        let filterDesc = '';
        if (searchOptions.beforeDate) {
            filterDesc += ` before ${searchOptions.beforeDate.toLocaleDateString()}`;
        }
        if (searchOptions.afterDate) {
            filterDesc += `${filterDesc ? ' and' : ''} after ${searchOptions.afterDate.toLocaleDateString()}`;
        }
        if (searchOptions.previousPeriod) {
            filterDesc = ` from previous ${searchOptions.previousPeriod.value} ${searchOptions.previousPeriod.unit}`;
        }
        if (searchOptions.searchQuery) {
            const searchDesc = ((_a = searchOptions.searchFields) === null || _a === void 0 ? void 0 : _a.includes('all')) ?
                `all fields` :
                (_b = searchOptions.searchFields) === null || _b === void 0 ? void 0 : _b.join(', ');
            filterDesc += `${filterDesc ? ' ' : ''} matching "${searchOptions.searchQuery}" in ${searchDesc}`;
        }
        console.log(`\nEmails in Folder: ${folderPath}${filterDesc} (User: ${options.user})`);
        (0, emailFormatter_1.printEmails)(emails, options.includeBodies === true);
        // Print summary of results
        console.log(`\nFound ${emails.length} email(s) matching your criteria.`);
    }
    catch (error) {
        console.error('Error listing emails:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to read a specific email
 */
async function readEmailCommand(emailId, options) {
    try {
        const emailService = serviceFactory_1.ServiceFactory.getEmailService();
        const email = await emailService.getEmail(emailId, options.user, options.hideQuoted === true);
        (0, emailFormatter_1.printEmailDetails)(email);
    }
    catch (error) {
        console.error('Error reading email:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to move an email to another folder
 */
async function moveEmailCommand(emailId, destinationFolderIdOrPath, options) {
    try {
        const emailService = serviceFactory_1.ServiceFactory.getEmailService();
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        // Resolve path if needed
        let folderPath = destinationFolderIdOrPath;
        if (!destinationFolderIdOrPath.startsWith('/')) {
            folderPath = await folderService.getFolderPath(destinationFolderIdOrPath, options.user);
        }
        await emailService.moveEmail(emailId, destinationFolderIdOrPath, options.user);
        console.log(`Email ${emailId} successfully moved to folder ${folderPath}`);
    }
    catch (error) {
        console.error('Error moving email:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to copy an email to another folder
 */
async function copyEmailCommand(emailId, destinationFolderIdOrPath, options) {
    try {
        const emailService = serviceFactory_1.ServiceFactory.getEmailService();
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        // Resolve path if needed
        let folderPath = destinationFolderIdOrPath;
        if (!destinationFolderIdOrPath.startsWith('/')) {
            folderPath = await folderService.getFolderPath(destinationFolderIdOrPath, options.user);
        }
        await emailService.copyEmail(emailId, destinationFolderIdOrPath, options.user);
        console.log(`Email ${emailId} successfully copied to folder ${folderPath}`);
    }
    catch (error) {
        console.error('Error copying email:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to list attachments of an email
 */
async function listAttachmentsCommand(emailId, options) {
    try {
        const emailService = serviceFactory_1.ServiceFactory.getEmailService();
        const attachments = await emailService.listAttachments(emailId, options.user);
        console.log(`\nAttachments for Email ${emailId} (User: ${options.user}):\n`);
        if (attachments.length === 0) {
            console.log('No attachments found.');
            return;
        }
        attachments.forEach((attachment, i) => {
            const sizeInKB = Math.round(attachment.size / 1024);
            console.log(`${i + 1}. ${attachment.name} (${attachment.contentType}, ${sizeInKB} KB)`);
            console.log(`   ID: ${attachment.id}`);
        });
        console.log(`\nFound ${attachments.length} attachment(s).`);
    }
    catch (error) {
        console.error('Error listing attachments:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
/**
 * Command to download an attachment
 */
async function downloadAttachmentCommand(emailId, attachmentId, options) {
    try {
        const emailService = serviceFactory_1.ServiceFactory.getEmailService();
        const attachment = await emailService.downloadAttachment(emailId, attachmentId, options.user);
        // Determine output path
        const outputPath = options.outputPath || attachment.name;
        // Write to file
        fs.writeFileSync(outputPath, Buffer.from(attachment.contentBytes || '', 'base64'));
        console.log(`Attachment "${attachment.name}" downloaded to ${outputPath}`);
    }
    catch (error) {
        console.error('Error downloading attachment:', (0, errors_1.formatErrorForUser)(error));
        process.exit(1);
    }
}
