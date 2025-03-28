import { IEmailService } from '../../services/interfaces';
import { EmailSearchOptions } from '../../models/email';
import { ServiceFactory } from '../../services/serviceFactory';
import { printEmails, printEmailDetails } from '../formatters/emailFormatter';
import { formatErrorForUser } from '../../utils/errors';
import * as fs from 'fs';

/**
 * Command to list emails in a folder
 */
export async function listEmailsCommand(
  folderIdOrPath: string, 
  options: { 
    user: string, 
    limit?: string, 
    before?: string, 
    after?: string, 
    previous?: string, 
    unit?: string, 
    search?: string, 
    fields?: string, 
    includeBodies?: boolean, 
    hideQuoted?: boolean,
    sortBy?: string,
    sortOrder?: string
  }
): Promise<void> {
  try {
    const emailService = ServiceFactory.getEmailService();
    const folderService = ServiceFactory.getFolderService();
    
    // Resolve path if needed
    let folderPath = folderIdOrPath;
    if (!folderIdOrPath.startsWith('/')) {
      folderPath = await folderService.getFolderPath(folderIdOrPath, options.user);
    }
    
    // Process search and date filters
    const searchOptions: EmailSearchOptions = {
      includeBodies: options.includeBodies === true,
      hideQuotedContent: options.hideQuoted === true
    };
    
    // Process sort options
    if (options.sortBy) {
      const validSortFields = ['receivedDateTime', 'sentDateTime', 'subject', 'importance'];
      if (validSortFields.includes(options.sortBy)) {
        searchOptions.sortBy = options.sortBy as 'receivedDateTime' | 'sentDateTime' | 'subject' | 'importance';
      } else {
        console.warn(`Warning: Invalid sort field '${options.sortBy}'. Using default 'receivedDateTime'.`);
      }
    }
    
    if (options.sortOrder) {
      if (['asc', 'desc'].includes(options.sortOrder.toLowerCase())) {
        searchOptions.sortOrder = options.sortOrder.toLowerCase() as 'asc' | 'desc';
      } else {
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
      const unit = options.unit as 'days' | 'weeks' | 'months' | 'years';
      
      if (['days', 'weeks', 'months', 'years'].includes(unit)) {
        searchOptions.previousPeriod = { value, unit };
      } else {
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
        const requestedFields = options.fields.split(',').map((f: string) => f.trim().toLowerCase());
        
        // Filter to only valid field values
        searchOptions.searchFields = requestedFields.filter((f: string) => 
          validFields.includes(f)
        ) as ('subject' | 'body' | 'from' | 'recipients' | 'all')[];
        
        // If no valid fields specified, default to 'all'
        if (searchOptions.searchFields.length === 0) {
          searchOptions.searchFields = ['all'];
        }
      } else {
        // Default to all fields
        searchOptions.searchFields = ['all'];
      }
    }
    
    const emails = await emailService.listEmails(
      folderIdOrPath, 
      options.user, 
      parseInt(options.limit || '25'), 
      Object.keys(searchOptions).length > 0 ? searchOptions : undefined
    );
    
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
      const searchDesc = searchOptions.searchFields?.includes('all') ? 
        `all fields` : 
        searchOptions.searchFields?.join(', ');
      
      filterDesc += `${filterDesc ? ' ' : ''} matching "${searchOptions.searchQuery}" in ${searchDesc}`;
    }
    
    console.log(`\nEmails in Folder: ${folderPath}${filterDesc} (User: ${options.user})`);
    printEmails(emails, options.includeBodies === true);

    // Print summary of results
    console.log(`\nFound ${emails.length} email(s) matching your criteria.`);
  } catch (error) {
    console.error('Error listing emails:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to read a specific email
 */
export async function readEmailCommand(
  emailId: string, 
  options: { 
    user: string, 
    hideQuoted?: boolean 
  }
): Promise<void> {
  try {
    const emailService = ServiceFactory.getEmailService();
    const email = await emailService.getEmail(emailId, options.user, options.hideQuoted === true);
    
    printEmailDetails(email);
  } catch (error) {
    console.error('Error reading email:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to move an email to another folder
 */
export async function moveEmailCommand(
  emailId: string, 
  destinationFolderIdOrPath: string, 
  options: { 
    user: string 
  }
): Promise<void> {
  try {
    const emailService = ServiceFactory.getEmailService();
    const folderService = ServiceFactory.getFolderService();
    
    // Resolve path if needed
    let folderPath = destinationFolderIdOrPath;
    if (!destinationFolderIdOrPath.startsWith('/')) {
      folderPath = await folderService.getFolderPath(destinationFolderIdOrPath, options.user);
    }
    
    await emailService.moveEmail(emailId, destinationFolderIdOrPath, options.user);
    
    console.log(`Email ${emailId} successfully moved to folder ${folderPath}`);
  } catch (error) {
    console.error('Error moving email:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to copy an email to another folder
 */
export async function copyEmailCommand(
  emailId: string, 
  destinationFolderIdOrPath: string, 
  options: { 
    user: string 
  }
): Promise<void> {
  try {
    const emailService = ServiceFactory.getEmailService();
    const folderService = ServiceFactory.getFolderService();
    
    // Resolve path if needed
    let folderPath = destinationFolderIdOrPath;
    if (!destinationFolderIdOrPath.startsWith('/')) {
      folderPath = await folderService.getFolderPath(destinationFolderIdOrPath, options.user);
    }
    
    await emailService.copyEmail(emailId, destinationFolderIdOrPath, options.user);
    
    console.log(`Email ${emailId} successfully copied to folder ${folderPath}`);
  } catch (error) {
    console.error('Error copying email:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to list attachments of an email
 */
export async function listAttachmentsCommand(
  emailId: string,
  options: {
    user: string
  }
): Promise<void> {
  try {
    const emailService = ServiceFactory.getEmailService();
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
  } catch (error) {
    console.error('Error listing attachments:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to download an attachment
 */
export async function downloadAttachmentCommand(
  emailId: string,
  attachmentId: string,
  options: {
    user: string,
    outputPath?: string
  }
): Promise<void> {
  try {
    const emailService = ServiceFactory.getEmailService();
    const attachment = await emailService.downloadAttachment(emailId, attachmentId, options.user);
    
    // Determine output path
    const outputPath = options.outputPath || attachment.name;
    
    // Write to file
    fs.writeFileSync(outputPath, Buffer.from(attachment.contentBytes || '', 'base64'));
    
    console.log(`Attachment "${attachment.name}" downloaded to ${outputPath}`);
  } catch (error) {
    console.error('Error downloading attachment:', formatErrorForUser(error));
    process.exit(1);
  }
}
