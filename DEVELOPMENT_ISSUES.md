# MCP Outlook Development Issues and Action Plan

This document outlines identified issues and incomplete functionality in the MCP Outlook project, along with a detailed action plan for implementing these features in future development sessions.

## 1. Email Body Display in CLI List View

### Issue
The CLI command `list-emails` accepts the `--include-bodies` flag, which correctly retrieves full email bodies from the Microsoft Graph API. However, the email formatter (`emailFormatter.ts`) only displays email previews in the list view, regardless of whether full bodies are retrieved.

### Action Plan
1. Update `emailFormatter.ts` to display full bodies when requested:
   ```typescript
   // In src/cli/formatters/emailFormatter.ts
   export function printEmails(emails: EmailMessage[], showFullBodies = false): void {
     // Existing code...
     
     for (let i = 0; i < emails.length; i++) {
       // Existing preview code...
       
       // Add condition to display full body when requested
       if (showFullBodies && email.body && email.body.content) {
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
   ```

2. Update the `listEmailsCommand` function to pass the flag to the formatter:
   ```typescript
   // In src/cli/commands/email.ts
   export async function listEmailsCommand(
     folderIdOrPath: string, 
     options: { 
       // Existing options...
     }
   ): Promise<void> {
     // Existing code...
     
     // Update this line to pass the includeBodies flag
     printEmails(emails, options.includeBodies === true);
     
     // Existing code...
   }
   ```

## 2. Attachment Handling Functionality

### Issue
The code references attachment properties and retrieves attachment data, but there's no CLI command or MCP tool to download attachments or to upload attachments when creating drafts.

### Action Plan
1. Implement attachment download functionality:
   - Create a new CLI command in `src/cli/commands/email.ts`:
   ```typescript
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
       fs.writeFileSync(outputPath, Buffer.from(attachment.contentBytes, 'base64'));
       
       console.log(`Attachment "${attachment.name}" downloaded to ${outputPath}`);
     } catch (error) {
       console.error('Error downloading attachment:', error);
       process.exit(1);
     }
   }
   ```

2. Implement service method in `EmailService`:
   ```typescript
   async downloadAttachment(
     emailId: string,
     attachmentId: string,
     userEmail: string
   ): Promise<any> {
     try {
       if (!userEmail) {
         throw new Error('User email is required for application permissions flow');
       }

       // Build the API endpoint
       const endpoint = `/users/${userEmail}/messages/${emailId}/attachments/${attachmentId}`;
       
       // Make the request to Microsoft Graph
       const response = await this.client
         .api(endpoint)
         .get();
       
       return response;
     } catch (error) {
       console.error('Error downloading attachment:', error);
       throw error;
     }
   }
   ```

3. Add the command to the CLI in `src/index.ts`:
   ```typescript
   program
     .command('download-attachment <emailId> <attachmentId>')
     .description('Download an attachment from an email')
     .requiredOption('-u, --user <email>', 'Email address of the user')
     .option('-o, --output-path <path>', 'Path to save the attachment')
     .action(downloadAttachmentCommand);
   ```

4. Implement corresponding MCP tool in `src/mcp/tools/emailTools.ts`:
   ```typescript
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
         
         return {
           content: [{ 
             type: 'text', 
             text: JSON.stringify(attachment, null, 2)
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
   ```

5. Add attachment upload functionality to draft creation in a similar pattern.

## 3. Calendar Integration Missing

### Issue
The README mentions calendar integration in the roadmap, but no implementation exists yet. The Microsoft Graph API supports calendar operations.

### Action Plan
1. Create calendar models in `src/models/calendar.ts`:
   ```typescript
   export interface CalendarEvent {
     id: string;
     subject: string;
     start: {
       dateTime: string;
       timeZone: string;
     };
     end: {
       dateTime: string;
       timeZone: string;
     };
     location?: {
       displayName: string;
     };
     attendees?: {
       emailAddress: {
         address: string;
         name?: string;
       };
       type: 'required' | 'optional' | 'resource';
       status?: {
         response: 'none' | 'accepted' | 'tentative' | 'declined';
       };
     }[];
     body?: {
       contentType: 'text' | 'html';
       content: string;
     };
     isOnlineMeeting?: boolean;
     onlineMeetingUrl?: string;
   }

   export interface NewCalendarEvent {
     subject: string;
     start: {
       dateTime: string;
       timeZone: string;
     };
     end: {
       dateTime: string;
       timeZone: string;
     };
     location?: {
       displayName: string;
     };
     attendees?: {
       emailAddress: {
         address: string;
         name?: string;
       };
       type: 'required' | 'optional' | 'resource';
     }[];
     body?: {
       contentType: 'text' | 'html';
       content: string;
     };
     isOnlineMeeting?: boolean;
   }
   ```

2. Create calendar service interface in `src/services/interfaces.ts`:
   ```typescript
   export interface ICalendarService {
     listEvents(
       userEmail: string,
       startDateTime?: Date,
       endDateTime?: Date,
       limit?: number
     ): Promise<CalendarEvent[]>;
     
     getEvent(
       eventId: string,
       userEmail: string
     ): Promise<CalendarEvent>;
     
     createEvent(
       event: NewCalendarEvent,
       userEmail: string
     ): Promise<CalendarEvent>;
     
     updateEvent(
       eventId: string,
       event: Partial<NewCalendarEvent>,
       userEmail: string
     ): Promise<CalendarEvent>;
     
     deleteEvent(
       eventId: string,
       userEmail: string
     ): Promise<void>;
   }
   ```

3. Implement the service in `src/services/calendarService.ts`.

4. Add CLI commands and MCP tools for calendar operations.

## 4. Search Functionality Enhancement

### Issue
The current search functionality is limited and the `--fields` option doesn't work correctly for all search types. When using `$search` with Microsoft Graph API, the `$orderby` parameter is removed, but there's no option to specify an alternative sort order.

### Action Plan
1. Enhance the search options in `EmailSearchOptions`:
   ```typescript
   export interface EmailSearchOptions {
     // Existing properties...
     
     sortBy?: 'receivedDateTime' | 'sentDateTime' | 'subject' | 'importance';
     sortOrder?: 'asc' | 'desc';
   }
   ```

2. Update the CLI command to accept these options:
   ```typescript
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
     .option('--sort-by <field>', 'Field to sort by (receivedDateTime, sentDateTime, subject, importance)')
     .option('--sort-order <order>', 'Sort order (asc, desc)', 'desc')
     .action(listEmailsCommand);
   ```

3. Update the `emailService.ts` to use these options when building the query.

## 5. Error Handling Improvements

### Issue
Error handling is inconsistent across the application. Some errors include detailed information, while others only show generic messages.

### Action Plan
1. Create a centralized error handling utility in `src/utils/errorHandler.ts`:
   ```typescript
   export class GraphError extends Error {
     constructor(
       public readonly statusCode: number,
       message: string,
       public readonly graphError?: any
     ) {
       super(message);
       this.name = 'GraphError';
     }
   }

   export function handleGraphError(error: any): never {
     if (error.statusCode && error.body) {
       try {
         const parsedBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
         const errorMessage = parsedBody.error?.message || 'Unknown Graph API error';
         throw new GraphError(error.statusCode, errorMessage, parsedBody.error);
       } catch (parseError) {
         // If parsing fails, use the original error
         throw new GraphError(error.statusCode, error.message || 'Unknown Graph API error');
       }
     }
     
     // For other types of errors, re-throw
     throw error;
   }

   export function formatErrorForUser(error: any): string {
     if (error instanceof GraphError) {
       return `Error (${error.statusCode}): ${error.message}`;
     }
     
     return `Error: ${error.message || 'Unknown error occurred'}`;
   }
   ```

2. Use this utility throughout the application.

## 6. Configuration and Authentication Enhancements

### Issue
The authentication system doesn't handle token refresh gracefully and doesn't support different authentication methods (e.g., device code flow for user authentication without a secret).

### Action Plan
1. Enhance the authentication helper to support both app-only and delegated permissions:
   ```typescript
   export class AuthHelper {
     // Existing code...
     
     async getClientWithDelegatedPermissions(userEmail: string): Promise<Client> {
       // Implement device code flow or other interactive auth
     }
     
     async getClientWithAppPermissions(userEmail: string): Promise<Client> {
       // Current implementation using client credentials
     }
     
     getClient(userEmail: string, authType: 'delegated' | 'app' = 'app'): Promise<Client> {
       if (authType === 'delegated') {
         return this.getClientWithDelegatedPermissions(userEmail);
       }
       return this.getClientWithAppPermissions(userEmail);
     }
   }
   ```

2. Update the CLI to accept an auth type parameter.

## 7. Draft Management Enhancements

### Issue
The draft management functionality is limited, with no ability to update existing drafts or send them.

### Action Plan
1. Add methods to the `IDraftService` interface:
   ```typescript
   export interface IDraftService {
     // Existing methods...
     
     updateDraft(
       draftId: string,
       draftUpdates: Partial<DraftWithOptionalRecipients>,
       userEmail: string
     ): Promise<Draft>;
     
     sendDraft(
       draftId: string,
       userEmail: string
     ): Promise<void>;
   }
   ```

2. Implement these methods in the `DraftService` class.

3. Add corresponding CLI commands and MCP tools.

## 8. HTML to Text Conversion Limitations

### Issue
The HTML to text conversion has limited options and doesn't handle certain complex HTML structures well.

### Action Plan
1. Enhance the HTML to text conversion utility with more options and better handling of complex structures:
   ```typescript
   export interface ExtendedHtmlToTextOptions extends HtmlToTextOptions {
     removeStyles?: boolean;
     removeCssClasses?: boolean;
     ignoreHref?: boolean;
     maxLineLength?: number;
     ignoreImages?: boolean;
   }

   export function enhancedHtmlToText(html: string, options?: ExtendedHtmlToTextOptions): string {
     // Enhanced implementation
   }
   ```

2. Update the CLI and MCP tools to use this enhanced conversion.

## 9. Testing Infrastructure

### Issue
The project lacks comprehensive tests, which makes it difficult to ensure the functionality works as expected.

### Action Plan
1. Set up a testing framework using Jest or Mocha.
2. Create unit tests for the service and utility classes.
3. Create integration tests for the CLI commands.
4. Create mocks for the Microsoft Graph API to enable testing without real credentials.

## 10. Documentation Updates

### Issue
The documentation is incomplete, particularly for the MCP server functionality.

### Action Plan
1. Create a comprehensive API documentation file.
2. Update the README with examples for all CLI commands.
3. Create a separate MCP_SERVER.md document with details on the MCP server functionality.
4. Add inline documentation to all classes and methods.

## Priority Recommendations

For the next development session, the recommended order of implementation is:

1. Fix the email body display in CLI list view (Issue #1) - This is a straightforward fix that will immediately improve usability.
2. Implement attachment handling (Issue #2) - This is a key missing feature that users would expect.
3. Enhance search functionality (Issue #4) - This will make the existing features more usable.
4. Implement draft management enhancements (Issue #7) - This will complete the email workflow.
5. Improve error handling (Issue #5) - This will make the application more robust.

The calendar integration (Issue #3) should be considered a separate feature milestone to be addressed after the email functionality is complete.

## Implementation Strategy

1. Make small, incremental changes with regular testing.
2. Update the documentation as features are implemented.
3. Add tests for new features.
4. Consider refactoring common code into shared utilities.

By addressing these issues methodically, the MCP Outlook project will become more robust, feature-complete, and user-friendly.
