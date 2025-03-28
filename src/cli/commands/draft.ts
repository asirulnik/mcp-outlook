import * as fs from 'fs';
import { ServiceFactory } from '../../services/serviceFactory';
import { NewEmailDraft, DraftWithOptionalRecipients } from '../../models/draft';
import { printEmailDetails } from '../formatters/emailFormatter';
import { formatErrorForUser } from '../../utils/errors';

/**
 * Command to create a new draft email
 */
export async function createDraftCommand(
  options: { 
    user: string, 
    subject: string, 
    to: string, 
    cc?: string, 
    bcc?: string, 
    html?: boolean, 
    file?: string, 
    message?: string 
  }
): Promise<void> {
  try {
    const draftService = ServiceFactory.getDraftService();
    
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
      } catch (error) {
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
    const draft: NewEmailDraft = {
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
  } catch (error) {
    console.error('Error creating draft:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to list draft emails
 */
export async function listDraftsCommand(
  options: { 
    user: string, 
    limit?: string 
  }
): Promise<void> {
  try {
    const draftService = ServiceFactory.getDraftService();
    const limit = parseInt(options.limit || '25');
    
    const drafts = await draftService.listDrafts(options.user, limit);
    
    console.log(`\nDrafts for User: ${options.user}\n`);
    
    if (drafts.length === 0) {
      console.log('No drafts found.');
      return;
    }
    
    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i];
      const recipients = (draft as any).toRecipients?.map((r: any) => r.emailAddress.address).join(', ') || 'No recipients';
      const lastModified = (draft as any).lastModifiedDateTime 
        ? new Date((draft as any).lastModifiedDateTime).toLocaleString() 
        : 'Unknown';
      
      console.log(`${i + 1}. ${draft.subject || '(No subject)'}`); 
      console.log(`   To: ${recipients}`);
      console.log(`   Last Modified: ${lastModified}`);
      console.log(`   ID: ${draft.id}`);
      console.log('');
    }
    
    console.log(`Found ${drafts.length} draft(s).`);
  } catch (error) {
    console.error('Error listing drafts:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to get a specific draft email
 */
export async function getDraftCommand(
  draftId: string,
  options: { 
    user: string 
  }
): Promise<void> {
  try {
    const draftService = ServiceFactory.getDraftService();
    const draft = await draftService.getDraft(draftId, options.user);
    
    console.log(`\nDraft Email Details (ID: ${draftId})\n`);
    printEmailDetails(draft);
  } catch (error) {
    console.error('Error getting draft:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to update an existing draft email
 */
export async function updateDraftCommand(
  draftId: string,
  options: { 
    user: string, 
    subject?: string, 
    to?: string, 
    cc?: string, 
    bcc?: string, 
    html?: boolean, 
    file?: string, 
    message?: string 
  }
): Promise<void> {
  try {
    const draftService = ServiceFactory.getDraftService();
    
    // Create update object
    const draftUpdates: Partial<DraftWithOptionalRecipients> = {};
    
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
        } catch (error) {
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
    if (draftUpdates.subject) updates.push(`Subject: ${draftUpdates.subject}`);
    if (draftUpdates.body) updates.push('Body content');
    if (draftUpdates.toRecipients) updates.push(`To: ${options.to}`);
    if (draftUpdates.ccRecipients) updates.push(`CC: ${options.cc}`);
    if (draftUpdates.bccRecipients) updates.push(`BCC: ${options.bcc}`);
    
    console.log(`Updated: ${updates.join(', ')}`);
  } catch (error) {
    console.error('Error updating draft:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to send a draft email
 */
export async function sendDraftCommand(
  draftId: string,
  options: { 
    user: string 
  }
): Promise<void> {
  try {
    const draftService = ServiceFactory.getDraftService();
    
    await draftService.sendDraft(draftId, options.user);
    
    console.log(`\nDraft email sent successfully.`);
  } catch (error) {
    console.error('Error sending draft:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to delete a draft email
 */
export async function deleteDraftCommand(
  draftId: string,
  options: { 
    user: string 
  }
): Promise<void> {
  try {
    const draftService = ServiceFactory.getDraftService();
    
    await draftService.deleteDraft(draftId, options.user);
    
    console.log(`\nDraft email deleted successfully.`);
  } catch (error) {
    console.error('Error deleting draft:', formatErrorForUser(error));
    process.exit(1);
  }
}
