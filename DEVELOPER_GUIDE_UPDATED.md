# MCP Outlook Developer Guide

This guide provides detailed information for developers working on the MCP Outlook integration. It covers the architecture, key components, and how to extend the functionality.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
3. [Configuration System](#configuration-system)
4. [Service Layer](#service-layer)
5. [MCP Tools](#mcp-tools)
6. [Error Handling](#error-handling)
7. [CLI Interface](#cli-interface)
8. [Adding New Features](#adding-new-features)
9. [Testing](#testing)

## Architecture Overview

The MCP Outlook application follows a modular architecture with clear separation of concerns:

```
src/
├── cli/               # Command-line interface
│   ├── commands/      # CLI command implementations
│   └── formatters/    # Output formatters for CLI
├── config/            # Configuration
│   └── prompts/       # Text templates and descriptions
├── mcp/               # MCP server and tools
│   ├── tools/         # Tool implementations
│   └── responses/     # Response formatting utilities
├── models/            # Data models and interfaces
├── services/          # Core business logic
│   └── mailService/   # Service implementations
└── utils/             # Utility functions
    └── errors/        # Error handling utilities
```

The application uses dependency injection through the ServiceFactory to create and manage service instances, making it easier to test and extend.

## Key Components

### Models

Domain models define the structure of data:

- `email.ts` - Email message models
- `folder.ts` - Mail folder models
- `draft.ts` - Email draft models
- `calendar.ts` - Calendar and event models

### Services

Services implement the core business logic:

- `IAuthService` - Authentication with Microsoft Graph
- `IFolderService` - Mail folder operations
- `IEmailService` - Email operations
- `IDraftService` - Draft email operations
- `ICalendarService` - Calendar operations

### MCP Tools

MCP tools expose service functionality to AI assistants:

- `folderTools.ts` - Tools for mail folder operations
- `emailTools.ts` - Tools for email operations
- `draftTools.ts` - Tools for draft operations
- `calendarTools.ts` - Tools for calendar operations

### CLI Commands

CLI commands provide a command-line interface to the services:

- `folder.ts` - Commands for mail folder operations
- `email.ts` - Commands for email operations
- `draft.ts` - Commands for draft operations
- `utils.ts` - Utility commands

## Configuration System

The configuration system allows customizing descriptions, parameters, and responses without modifying code.

### Structure

```
config/
└── prompts/
    ├── index.ts           # Main configuration loader
    ├── emailTools.ts      # Email tool configurations
    ├── folderTools.ts     # Folder tool configurations
    ├── draftTools.ts      # Draft tool configurations
    ├── calendarTools.ts   # Calendar tool configurations
    └── errorMessages.ts   # Error message templates
```

### External Configuration

The configuration system supports external configuration through a JSON file (`outlook-mcp-config.json`) placed in the working directory. This file can override any part of the default configuration:

```json
{
  "tools": {
    "email": {
      "listEmails": {
        "description": "Custom description for listing emails",
        "responses": {
          "success": "Found {count} emails that match your criteria"
        }
      }
    }
  }
}
```

### Usage

Configuration is used throughout the application:

```typescript
// In MCP tools
import { promptConfig, formatMessage } from '../../config/prompts';

// Access configuration
const emailConfig = promptConfig.tools.email;

// Format messages with variables
formatMessage(emailConfig.listEmails.responses.success, { count: emails.length });
```

## Service Layer

The service layer implements the core business logic and interfaces with the Microsoft Graph API.

### Authentication Service

Handles authentication with Microsoft Graph:

```typescript
const authService = new AuthService();
const client = authService.getClient();
```

### Service Factory

The ServiceFactory creates and manages service instances:

```typescript
// Get services
const folderService = ServiceFactory.getFolderService();
const emailService = ServiceFactory.getEmailService();
const draftService = ServiceFactory.getDraftService();
const calendarService = ServiceFactory.getCalendarService();
```

### Email Service

Handles email operations:

```typescript
// List emails
const emails = await emailService.listEmails('/Inbox', 'user@example.com', 25);

// Get email details
const email = await emailService.getEmail('emailId', 'user@example.com');

// Move an email
await emailService.moveEmail('emailId', '/Archive', 'user@example.com');
```

### Draft Service

Handles draft email operations:

```typescript
// Create a draft
const draft = await draftService.createDraft({
  subject: 'Hello',
  body: { contentType: 'Text', content: 'Hello, world!' },
  toRecipients: [{ emailAddress: { address: 'user@example.com' } }]
}, 'user@example.com');

// Update a draft
await draftService.updateDraft('draftId', {
  subject: 'Updated subject'
}, 'user@example.com');

// Send a draft
await draftService.sendDraft('draftId', 'user@example.com');
```

### Calendar Service

Handles calendar operations:

```typescript
// List calendars
const calendars = await calendarService.listCalendars('user@example.com');

// List events
const events = await calendarService.listEvents(
  'user@example.com',
  new Date('2023-01-01T00:00:00Z'),
  new Date('2023-01-31T23:59:59Z')
);

// Create an event
await calendarService.createEvent({
  subject: 'Meeting',
  start: { dateTime: '2023-01-15T10:00:00', timeZone: 'UTC' },
  end: { dateTime: '2023-01-15T11:00:00', timeZone: 'UTC' }
}, 'user@example.com');
```

## MCP Tools

MCP tools expose service functionality to AI assistants using the Model Context Protocol.

### Tool Structure

Each tool follows a common pattern:

1. Define parameters using Zod schemas
2. Implement tool function that calls the appropriate service
3. Format and return the result

Example:

```typescript
server.tool(
  'list-emails',
  { 
    userEmail: z.string().email().describe('Email address of the user'),
    folderId: z.string().describe('ID of the folder to list emails from')
  },
  async ({ userEmail, folderId }) => {
    try {
      const emailService = ServiceFactory.getEmailService();
      const emails = await emailService.listEmails(folderId, userEmail);
      
      return {
        content: [{ 
          type: 'text', 
          text: JSON.stringify(emails, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: 'text', 
          text: `Error listing emails: ${error}`
        }],
        isError: true
      };
    }
  }
);
```

### Tool Registration

Tools are registered with the MCP server in `src/mcp/server.ts`:

```typescript
// Register tools with the server
registerFolderTools(server);
registerEmailTools(server);
registerDraftTools(server);
registerCalendarTools(server);
```

## Error Handling

The application uses a comprehensive error handling system:

### Custom Error Classes

- `GraphError` - For Microsoft Graph API errors
- `AuthenticationError` - For authentication errors
- `ValidationError` - For input validation errors
- `NotFoundError` - For resource not found errors

### Error Handling Utilities

- `handleGraphError` - Processes Graph API errors
- `formatErrorForUser` - Formats errors for user display

### Usage

```typescript
try {
  // Operation that might fail
} catch (error) {
  // Process error
  return handleGraphError(error);
}
```

## CLI Interface

The CLI interface provides a command-line interface to the services.

### Command Registration

Commands are registered in `src/cli/index.ts`:

```typescript
program
  .command('list-emails <folderIdOrPath>')
  .description('List emails in a specific mail folder')
  .requiredOption('-u, --user <email>', 'Email address of the user')
  .option('-l, --limit <number>', 'Number of emails to retrieve', '25')
  .action(listEmailsCommand);
```

### Command Implementation

Commands are implemented in `src/cli/commands/`:

```typescript
export async function listEmailsCommand(
  folderIdOrPath: string, 
  options: { user: string, limit?: string }
): Promise<void> {
  try {
    const emailService = ServiceFactory.getEmailService();
    const emails = await emailService.listEmails(
      folderIdOrPath, 
      options.user, 
      parseInt(options.limit || '25')
    );
    
    printEmails(emails);
  } catch (error) {
    console.error('Error listing emails:', error);
    process.exit(1);
  }
}
```

## Adding New Features

Follow these steps to add a new feature:

1. Define models in `src/models/`
2. Add service interfaces in `src/services/interfaces.ts`
3. Implement services in `src/services/mailService/`
4. Update `ServiceFactory` to expose new services
5. Add MCP tools in `src/mcp/tools/`
6. Add CLI commands in `src/cli/commands/`
7. Add formatters in `src/cli/formatters/` if needed
8. Update configuration in `src/config/prompts/`
9. Register tools in `src/mcp/server.ts`
10. Register commands in `src/cli/index.ts`

## Testing

### Unit Testing

Unit tests should test individual components in isolation:

```typescript
describe('EmailService', () => {
  it('should list emails', async () => {
    // Arrange
    const mockClient = createMockClient();
    const mockAuthService = createMockAuthService(mockClient);
    const mockFolderService = createMockFolderService();
    const emailService = new EmailService(mockAuthService, mockFolderService);
    
    // Act
    const emails = await emailService.listEmails('/Inbox', 'user@example.com');
    
    // Assert
    expect(emails).toHaveLength(2);
    expect(emails[0].subject).toBe('Test Email');
  });
});
```

### Integration Testing

Integration tests should test interactions between components:

```typescript
describe('EmailService integration', () => {
  it('should list emails from the Graph API', async () => {
    // Arrange
    const authService = new AuthService();
    const folderService = new FolderService(authService);
    const emailService = new EmailService(authService, folderService);
    
    // Act
    const emails = await emailService.listEmails('/Inbox', 'test@example.com');
    
    // Assert
    expect(emails.length).toBeGreaterThan(0);
  });
});
```

### End-to-End Testing

End-to-end tests should test the entire application:

```typescript
describe('CLI', () => {
  it('should list emails', async () => {
    // Arrange
    const exec = promisify(child_process.exec);
    
    // Act
    const { stdout } = await exec(
      'node dist/index.js list-emails /Inbox -u test@example.com'
    );
    
    // Assert
    expect(stdout).toContain('Found');
    expect(stdout).toContain('emails');
  });
});
```

## Conclusion

This developer guide provides an overview of the MCP Outlook application architecture and how to extend it. For more detailed information, refer to the source code and API documentation.
