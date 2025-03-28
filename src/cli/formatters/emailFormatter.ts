import { EmailMessage, EmailDetails } from '../../models/email';
import { htmlToText, HtmlToTextOptions } from '../../utils/htmlToText';

/**
 * Print a list of emails to the console
 * @param emails List of email messages
 * @param showFullBodies Flag to display full message bodies instead of previews
 */
export function printEmails(emails: EmailMessage[] | EmailDetails[], showFullBodies = false): void {
  console.log(`\nFound ${emails.length} emails:\n`);
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const readStatus = email.isRead ? '' : '[UNREAD] ';
    const fromName = email.from?.emailAddress.name || email.from?.emailAddress.address || 'Unknown Sender';
    const receivedDate = email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleString() : 'Unknown Date';
    const hasAttachment = email.hasAttachments ? ' [Has Attachments]' : '';
    
    console.log(`${i + 1}. ${readStatus}${email.subject} - From: ${fromName} - ${receivedDate}${hasAttachment}`);
    console.log(`   ID: ${email.id}`);
    // Add condition to display full body when requested
    if (showFullBodies && 'body' in email && email.body && email.body.content) {
      console.log('\n   Body:');
      console.log('   --------------------------------------------------');
      
      if (email.body.contentType === 'html') {
        // Use existing HTML to text conversion
        const textContent = htmlToText(email.body.content);
        console.log(`   ${textContent.replace(/\n/g, '\n   ')}`);
      } else {
        console.log(`   ${email.body.content.replace(/\n/g, '\n   ')}`);
      }
      console.log('   --------------------------------------------------\n');
    } else if (email.bodyPreview) {
      console.log(`   Preview: ${email.bodyPreview.substring(0, 100)}${email.bodyPreview.length > 100 ? '...' : ''}`);
    }
    console.log('');
  }
}

/**
 * Print detailed email information to the console
 * @param email Email details to print
 * @param options HTML to text conversion options
 */
export function printEmailDetails(email: EmailDetails, options?: HtmlToTextOptions): void {
  console.log('\n==================================================');
  console.log(`Subject: ${email.subject}`);
  console.log(`From: ${email.from?.emailAddress.name || ''} <${email.from?.emailAddress.address || 'Unknown'}>`);
  
  if (email.toRecipients && email.toRecipients.length > 0) {
    console.log('To: ' + email.toRecipients.map(r => 
      `${r.emailAddress.name || ''} <${r.emailAddress.address}>`).join(', '));
  }
  
  if (email.ccRecipients && email.ccRecipients.length > 0) {
    console.log('CC: ' + email.ccRecipients.map(r => 
      `${r.emailAddress.name || ''} <${r.emailAddress.address}>`).join(', '));
  }
  
  if (email.receivedDateTime) {
    console.log(`Date: ${new Date(email.receivedDateTime).toLocaleString()}`);
  }
  
  if (email.attachments && email.attachments.length > 0) {
    console.log('\nAttachments:');
    email.attachments.forEach((attachment, i) => {
      const sizeInKB = Math.round(attachment.size / 1024);
      console.log(`${i + 1}. ${attachment.name} (${attachment.contentType}, ${sizeInKB} KB) - ID: ${attachment.id}`);
    });
  }
  
  console.log('\n--------------------------------------------------');
  if (email.body) {
    if (email.body.contentType === 'html') {
      console.log('Note: This is an HTML email. Plain text conversion shown:');
      
      // If plain text content was already created, use it
      if (email.body.plainTextContent) {
        console.log(email.body.plainTextContent);
      } else {
        // Otherwise, convert HTML to text
        const defaultOptions: HtmlToTextOptions = {
          wordwrap: 100,
          preserveNewlines: true,
          tables: true,
          preserveHrefLinks: true,
          headingStyle: 'linebreak'
        };
        
        // Merge with provided options
        const textOptions = { ...defaultOptions, ...options };
        
        // Convert the HTML to text
        const textContent = htmlToText(email.body.content, textOptions);
        console.log(textContent);
      }
    } else {
      console.log(email.body.content);
    }
  } else {
    console.log(email.bodyPreview || 'No content');
  }
  console.log('==================================================\n');
}
