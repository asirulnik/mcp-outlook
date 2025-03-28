import * as fs from 'fs';
import { htmlToText, HtmlToTextOptions } from '../../utils/htmlToText';
import { ServiceFactory } from '../../services/serviceFactory';

/**
 * Command to test authentication with Microsoft Graph
 */
export async function testAuthCommand(options: { user: string }): Promise<void> {
  try {
    const folderService = ServiceFactory.getFolderService();
    
    // Try to get the top-level folders to test authentication
    await folderService.getMailFolders(options.user);
    console.log('Authentication successful! You are connected to Microsoft Graph API.');
  } catch (error) {
    console.error('Authentication failed:', error);
    process.exit(1);
  }
}

/**
 * Command to convert HTML content to plain text
 */
export async function convertHtmlCommand(
  options: { 
    file: string, 
    hideQuoted?: boolean, 
    wordWrap?: string, 
    preserveLinks?: boolean
  }
): Promise<void> {
  try {
    // Read the HTML file
    const html = fs.readFileSync(options.file, 'utf8');
    
    // Convert options
    const convertOptions: HtmlToTextOptions = {
      wordwrap: parseInt(options.wordWrap || '100'),
      preserveNewlines: true,
      tables: true,
      preserveHrefLinks: options.preserveLinks || false,
      headingStyle: 'linebreak'
    };
    
    // Convert HTML to plain text
    let plainText = htmlToText(html, convertOptions);
    
    // If hideQuotedContent is enabled, extract only the main message
    if (options.hideQuoted) {
      const parts = plainText.split('\n---\n');
      if (parts.length > 1) {
        plainText = parts[0] + '\n\n[Prior quoted messages removed]';
      }
    }
    
    console.log(plainText);
  } catch (error) {
    console.error('Error converting HTML to text:', error);
    process.exit(1);
  }
}
