#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const folder_1 = require("./commands/folder");
const email_1 = require("./commands/email");
const draft_1 = require("./commands/draft");
const calendar_1 = require("./commands/calendar");
const utils_1 = require("./commands/utils");
// Create a new instance of the Command class
const program = new commander_1.Command();
// Set up the program metadata
program
    .name('outlook-mail-cli')
    .description('CLI to interact with Microsoft Outlook mail')
    .version('1.0.1');
// Command to test authentication and display a success message
program
    .command('test-auth')
    .description('Test authentication with Microsoft Graph')
    .requiredOption('-u, --user <email>', 'Email address of the user (required for app-only authentication)')
    .action(options => (0, utils_1.testAuthCommand)(options));
// Command to list mail folders
program
    .command('list-folders')
    .description('List all top-level mail folders')
    .requiredOption('-u, --user <email>', 'Email address of the user (required for app-only authentication)')
    .action(options => (0, folder_1.listFoldersCommand)(options));
// Command to list child folders
program
    .command('list-child-folders <folderIdOrPath>')
    .description('List child folders of a specific mail folder')
    .requiredOption('-u, --user <email>', 'Email address of the user (required for app-only authentication)')
    .action((folderIdOrPath, options) => (0, folder_1.listChildFoldersCommand)(folderIdOrPath, options));
// Command to list emails in a folder
program
    .command('list-emails <folderIdOrPath>')
    .description('List emails in a specific mail folder')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('-l, --limit <number>', 'Number of emails to retrieve', '25')
    .option('--before <date>', 'Only show emails before this date (YYYY-MM-DD)')
    .option('--after <date>', 'Only show emails after this date (YYYY-MM-DD)')
    .option('--previous <value>', 'Show emails from previous period (e.g., 7)')
    .option('--unit <unit>', 'Time unit for --previous (days, weeks, months, years)', 'days')
    .option('--search <query>', 'Search for emails containing the specified text')
    .option('--fields <fields>', 'Comma-separated list of fields to search (subject,body,from,recipients,all)', 'all')
    .option('--include-bodies', 'Include full message bodies in results')
    .option('--hide-quoted', 'Hide quoted content in message bodies')
    .option('--sort-by <field>', 'Field to sort by (receivedDateTime, sentDateTime, subject, importance)', 'receivedDateTime')
    .option('--sort-order <order>', 'Sort order (asc, desc)', 'desc')
    .action((folderIdOrPath, options) => (0, email_1.listEmailsCommand)(folderIdOrPath, options));
// Command to read a specific email
program
    .command('read-email <emailId>')
    .description('Read a specific email with all details')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('--hide-quoted', 'Hide quoted content in message body')
    .action((emailId, options) => (0, email_1.readEmailCommand)(emailId, options));
// Command to move an email to another folder
program
    .command('move-email <emailId> <destinationFolderIdOrPath>')
    .description('Move an email to another folder')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((emailId, destinationFolderIdOrPath, options) => (0, email_1.moveEmailCommand)(emailId, destinationFolderIdOrPath, options));
// Command to copy an email to another folder
program
    .command('copy-email <emailId> <destinationFolderIdOrPath>')
    .description('Copy an email to another folder')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((emailId, destinationFolderIdOrPath, options) => (0, email_1.copyEmailCommand)(emailId, destinationFolderIdOrPath, options));
// Command to list attachments of an email
program
    .command('list-attachments <emailId>')
    .description('List all attachments of a specific email')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((emailId, options) => (0, email_1.listAttachmentsCommand)(emailId, options));
// Command to download an attachment
program
    .command('download-attachment <emailId> <attachmentId>')
    .description('Download an attachment from an email')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('-o, --output-path <path>', 'Path to save the attachment')
    .action((emailId, attachmentId, options) => (0, email_1.downloadAttachmentCommand)(emailId, attachmentId, options));
// Command to create a new draft email
program
    .command('create-draft')
    .description('Create a new draft email')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .requiredOption('-s, --subject <text>', 'Email subject')
    .requiredOption('-t, --to <emails>', 'Recipient email addresses (comma-separated)')
    .option('-c, --cc <emails>', 'CC recipient email addresses (comma-separated)')
    .option('-b, --bcc <emails>', 'BCC recipient email addresses (comma-separated)')
    .option('--html', 'Use HTML format for the body (default is plain text)')
    .option('-f, --file <path>', 'Path to a file containing the email body')
    .option('-m, --message <text>', 'Email body text (use this or --file)')
    .action(options => (0, draft_1.createDraftCommand)(options));
// Command to create a new mail folder
program
    .command('create-folder <name>')
    .description('Create a new mail folder')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('-p, --parent <parentFolderIdOrPath>', 'Optional parent folder ID or path')
    .option('--hidden', 'Create the folder as hidden')
    .action((name, options) => (0, folder_1.createFolderCommand)(name, options));
// Command to rename a mail folder
program
    .command('rename-folder <folderIdOrPath> <newName>')
    .description('Rename a mail folder')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((folderIdOrPath, newName, options) => (0, folder_1.renameFolderCommand)(folderIdOrPath, newName, options));
// Command to move a folder to another parent folder
program
    .command('move-folder <folderIdOrPath> <destinationParentFolderIdOrPath>')
    .description('Move a folder to another parent folder')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((folderIdOrPath, destinationParentFolderIdOrPath, options) => (0, folder_1.moveFolderCommand)(folderIdOrPath, destinationParentFolderIdOrPath, options));
// Command to copy a folder to another parent folder
program
    .command('copy-folder <folderIdOrPath> <destinationParentFolderIdOrPath>')
    .description('Copy a folder to another parent folder (may not be supported by the API)')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((folderIdOrPath, destinationParentFolderIdOrPath, options) => (0, folder_1.copyFolderCommand)(folderIdOrPath, destinationParentFolderIdOrPath, options));
// Command to list drafts
program
    .command('list-drafts')
    .description('List all drafts')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('-l, --limit <number>', 'Number of drafts to retrieve', '25')
    .action((options) => (0, draft_1.listDraftsCommand)(options));
// Command to get a specific draft
program
    .command('get-draft <draftId>')
    .description('Get a specific draft')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((draftId, options) => (0, draft_1.getDraftCommand)(draftId, options));
// Command to update draft
program
    .command('update-draft <draftId>')
    .description('Update an existing draft')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('-s, --subject <text>', 'New email subject')
    .option('-t, --to <emails>', 'New recipient email addresses (comma-separated)')
    .option('-c, --cc <emails>', 'New CC recipient email addresses (comma-separated)')
    .option('-b, --bcc <emails>', 'New BCC recipient email addresses (comma-separated)')
    .option('--html', 'Use HTML format for the body (default is plain text)')
    .option('-f, --file <path>', 'Path to a file containing the new email body')
    .option('-m, --message <text>', 'New email body text (use this or --file)')
    .action((draftId, options) => (0, draft_1.updateDraftCommand)(draftId, options));
// Command to send draft
program
    .command('send-draft <draftId>')
    .description('Send an existing draft')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((draftId, options) => (0, draft_1.sendDraftCommand)(draftId, options));
// Command to delete draft
program
    .command('delete-draft <draftId>')
    .description('Delete a draft')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((draftId, options) => (0, draft_1.deleteDraftCommand)(draftId, options));
// Calendar Commands
// Command to list calendars
program
    .command('list-calendars')
    .description('List all calendars')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .action((options) => (0, calendar_1.listCalendarsCommand)(options));
// Command to list events
program
    .command('list-events')
    .description('List calendar events with optional filtering')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('--start <dateTime>', 'Start of the time range (ISO format)')
    .option('--end <dateTime>', 'End of the time range (ISO format)')
    .option('-l, --limit <number>', 'Maximum number of events to retrieve', '25')
    .option('-c, --calendar-id <id>', 'ID of the specific calendar (defaults to primary)')
    .action((options) => (0, calendar_1.listEventsCommand)(options));
// Command to get event
program
    .command('get-event <eventId>')
    .description('Get a specific calendar event')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('-c, --calendar-id <id>', 'ID of the specific calendar (defaults to primary)')
    .action((eventId, options) => (0, calendar_1.getEventCommand)(eventId, options));
// Command to create event
program
    .command('create-event')
    .description('Create a new calendar event')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .requiredOption('-s, --subject <text>', 'Event subject')
    .requiredOption('--start <dateTime>', 'Start date and time (ISO format)')
    .requiredOption('--end <dateTime>', 'End date and time (ISO format)')
    .requiredOption('--time-zone <zone>', 'Time zone (e.g., "America/New_York")')
    .option('-l, --location <text>', 'Event location')
    .option('-b, --body <text>', 'Event description')
    .option('--html', 'Use HTML format for the body (default is plain text)')
    .option('--online-meeting', 'Create as online meeting')
    .option('--all-day', 'Create as an all-day event')
    .option('--attendees <emails>', 'Attendee email addresses (comma-separated)')
    .option('-c, --calendar-id <id>', 'ID of the specific calendar (defaults to primary)')
    .action((options) => (0, calendar_1.createEventCommand)(options));
// Command to update event
program
    .command('update-event <eventId>')
    .description('Update an existing calendar event')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('-s, --subject <text>', 'New event subject')
    .option('--start <dateTime>', 'New start date and time (ISO format)')
    .option('--end <dateTime>', 'New end date and time (ISO format)')
    .option('--time-zone <zone>', 'New time zone')
    .option('-l, --location <text>', 'New event location')
    .option('-b, --body <text>', 'New event description')
    .option('--html', 'Use HTML format for the body (default is plain text)')
    .option('--online-meeting', 'Set as online meeting')
    .option('--all-day', 'Set as an all-day event')
    .option('--attendees <emails>', 'New attendee email addresses (comma-separated)')
    .option('-c, --calendar-id <id>', 'ID of the specific calendar (defaults to primary)')
    .action((eventId, options) => (0, calendar_1.updateEventCommand)(eventId, options));
// Command to delete event
program
    .command('delete-event <eventId>')
    .description('Delete a calendar event')
    .requiredOption('-u, --user <email>', 'Email address of the user')
    .option('-c, --calendar-id <id>', 'ID of the specific calendar (defaults to primary)')
    .action((eventId, options) => (0, calendar_1.deleteEventCommand)(eventId, options));
// Command to convert HTML email to text
program
    .command('convert-html')
    .description('Convert HTML content to plain text')
    .requiredOption('-f, --file <path>', 'Path to HTML file to convert')
    .option('--hide-quoted', 'Hide quoted content in the output')
    .option('--word-wrap <number>', 'Word wrap at specified column width', '100')
    .option('--preserve-links', 'Preserve href links in the output', false)
    .action(options => (0, utils_1.convertHtmlCommand)(options));
// Add documentation commands
program
    .command('docs:list')
    .description('List available documentation files')
    .action(() => {
    console.log('Available documentation:\n- README.md\n- AZURE_SETUP.md\n- QUICK_START.md\n- DEVELOPER_GUIDE.md\n- TROUBLESHOOTING.md\n- MODULARIZATION_PLAN.md');
});
['readme', 'azure', 'quickstart', 'dev', 'troubleshoot', 'modularization'].forEach(doc => {
    program
        .command(`docs:${doc}`)
        .description(`View ${doc} documentation`)
        .action(() => {
        const filenames = {
            readme: 'README.md',
            azure: 'AZURE_SETUP.md',
            quickstart: 'QUICK_START.md',
            dev: 'DEVELOPER_GUIDE.md',
            troubleshoot: 'TROUBLESHOOTING.md',
            modularization: 'MODULARIZATION_PLAN.md'
        };
        console.log(`Viewing ${filenames[doc]}...`);
        try {
            const child_process = require('child_process');
            child_process.execSync(`cat ${filenames[doc]} | less`, { stdio: 'inherit' });
        }
        catch (error) {
            console.error(`Error displaying documentation: ${error}`);
        }
    });
});
// Parse the command line arguments
program.parse();
// If no arguments provided, display help
if (process.argv.length < 3) {
    program.help();
}
