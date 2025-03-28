# Code Modularization Plan

This document outlines the plan for modularizing the MCP Outlook codebase to improve maintainability, readability, and reduce resource usage when working with Claude. The goal is to break down large files into smaller, focused modules following object-oriented and separation of concerns principles.

## Current Structure

Currently, the codebase has these main components:

- `src/index.ts` - CLI application (large file with all commands)
- `src/server.ts` - MCP server (with all tool definitions)
- `src/mailService.ts` - Core mail functionality (large file with all mail operations)
- `src/authHelper.ts` - Authentication logic
- `src/htmlToText.ts` - HTML conversion utilities

The main issues with this structure:

1. **Large files** that are difficult to maintain and consume a lot of Claude's context window
2. **Tight coupling** between different functionalities
3. **Limited separation of concerns**
4. **Monolithic design** that makes it harder to test individual components

## Proposed Structure

### 1. Module-Based Organization

```
src/
├── cli/                     # CLI-specific code
│   ├── index.ts             # Entry point
│   ├── commands/            # Individual command modules
│   │   ├── folder.ts        # Folder-related commands
│   │   ├── email.ts         # Email-related commands
│   │   ├── draft.ts         # Draft-related commands
│   │   └── utils.ts         # CLI utilities
│   └── formatters/          # Output formatting
│       ├── folderFormatter.ts
│       └── emailFormatter.ts
├── mcp/                     # MCP server code
│   ├── server.ts            # Entry point
│   ├── tools/               # Individual tool modules
│   │   ├── folderTools.ts   # Folder-related tools
│   │   ├── emailTools.ts    # Email-related tools
│   │   └── draftTools.ts    # Draft-related tools
│   └── responses/           # Response formatting
├── services/                # Core business logic
│   ├── mailService/         # Core mail service
│   │   ├── index.ts         # Main export
│   │   ├── folderService.ts # Folder operations
│   │   ├── emailService.ts  # Email operations
│   │   └── draftService.ts  # Draft operations
│   └── authService.ts       # Authentication logic
├── models/                  # Data models and interfaces
│   ├── folder.ts            # Folder-related interfaces
│   ├── email.ts             # Email-related interfaces
│   └── draft.ts             # Draft-related interfaces
├── utils/                   # Utilities
│   ├── htmlToText.ts        # HTML conversion
│   └── paths.ts             # Path handling utilities
└── config/                  # Configuration
    └── graphConfig.ts       # Microsoft Graph config
```

### 2. Object-Oriented Approach

Replace the current mostly functional approach with a more object-oriented design:

```typescript
// Example of modular service classes
export class FolderService {
  private client: Client;
  
  constructor(client: Client) {
    this.client = client;
  }
  
  async getMailFolders(userEmail: string): Promise<MailFolder[]> {
    // Implementation
  }
  
  async createFolder(name: string, userEmail: string, parentPath?: string): Promise<MailFolder> {
    // Implementation
  }
  
  // Other folder operations
}

export class EmailService {
  private client: Client;
  
  constructor(client: Client) {
    this.client = client;
  }
  
  async listEmails(folderPath: string, userEmail: string, options?: ListEmailsOptions): Promise<Email[]> {
    // Implementation
  }
  
  // Other email operations
}

// Main service that composes other services
export class MailService {
  public folders: FolderService;
  public emails: EmailService;
  public drafts: DraftService;
  
  constructor() {
    const client = getGraphClient();
    this.folders = new FolderService(client);
    this.emails = new EmailService(client);
    this.drafts = new DraftService(client);
  }
}
```

### 3. Dependency Injection

Implement dependency injection to improve testability:

```typescript
export interface IAuthService {
  getClient(): Client;
}

export class AuthService implements IAuthService {
  getClient(): Client {
    return getGraphClient();
  }
}

export class FolderService {
  private client: Client;
  
  constructor(authService: IAuthService) {
    this.client = authService.getClient();
  }
  
  // Methods...
}

// For testing, we can create a mock implementation
export class MockAuthService implements IAuthService {
  getClient(): Client {
    // Return a mock client for testing
    return {} as Client;
  }
}

### 4. Interface-Based Design

Define clear interfaces for each service:

```typescript
export interface IFolderService {
  getMailFolders(userEmail: string): Promise<MailFolder[]>;
  getChildFolders(folderIdOrPath: string, userEmail: string): Promise<MailFolder[]>;
  createFolder(newFolder: NewMailFolder, userEmail: string, parentFolderIdOrPath?: string): Promise<MailFolder>;
  updateFolder(folderIdOrPath: string, updatedFolder: Partial<NewMailFolder>, userEmail: string): Promise<MailFolder>;
  moveFolder(folderIdOrPath: string, destinationParentFolderIdOrPath: string, userEmail: string): Promise<MailFolder>;
  copyFolder(folderIdOrPath: string, destinationParentFolderIdOrPath: string, userEmail: string): Promise<MailFolder>;
}

export interface IEmailService {
  listEmails(folderIdOrPath: string, userEmail: string, limit?: number, searchOptions?: EmailSearchOptions): Promise<EmailMessage[] | EmailDetails[]>;
  getEmail(emailId: string, userEmail: string, hideQuotedContent?: boolean): Promise<EmailDetails>;
  moveEmail(emailId: string, destinationFolderIdOrPath: string, userEmail: string): Promise<EmailMessage>;
  copyEmail(emailId: string, destinationFolderIdOrPath: string, userEmail: string): Promise<EmailMessage>;
}

export interface IDraftService {
  createDraft(draft: NewEmailDraft, userEmail: string): Promise<EmailMessage>;
}
```

### 5. Command Pattern for CLI

Implement the Command pattern for CLI commands:

```typescript
interface Command {
  execute(options: any): Promise<void>;
}

class ListFoldersCommand implements Command {
  constructor(private folderService: IFolderService) {}
  
  async execute(options: { user: string }): Promise<void> {
    try {
      const folders = await this.folderService.getMailFolders(options.user);
      // Format and display folders
    } catch (error) {
      console.error('Error listing folders:', error);
      process.exit(1);
    }
  }
}

class ReadEmailCommand implements Command {
  constructor(private emailService: IEmailService) {}
  
  async execute(options: { emailId: string, user: string, hideQuoted?: boolean }): Promise<void> {
    try {
      const email = await this.emailService.getEmail(options.emailId, options.user, options.hideQuoted);
      // Format and display email
    } catch (error) {
      console.error('Error reading email:', error);
      process.exit(1);
    }
  }
}
```

### 6. Factory Pattern for Services

Use factories to create services:

```typescript
class ServiceFactory {
  private static authService: IAuthService;
  
  static getAuthService(): IAuthService {
    if (!this.authService) {
      this.authService = new AuthService();
    }
    return this.authService;
  }
  
  static getFolderService(): IFolderService {
    return new FolderService(this.getAuthService());
  }
  
  static getEmailService(): IEmailService {
    return new EmailService(this.getAuthService());
  }
  
  static getDraftService(): IDraftService {
    return new DraftService(this.getAuthService());
  }
}
```

## Implementation Plan

### Phase 1: Define Interfaces and Models

1. Create interface definitions for all services
2. Define data models and separate from service code
3. Document the interfaces thoroughly

### Phase 2: Implement Core Services

1. Create modular service classes implementing the interfaces
2. Split `mailService.ts` into multiple service modules
3. Implement the dependency injection pattern
4. Create unit tests for each service module

### Phase 3: Refactor CLI Commands

1. Implement the Command pattern
2. Split CLI commands into separate modules
3. Create factories for command objects
4. Update CLI entry point to use the new command structure

### Phase 4: Refactor MCP Server

1. Split MCP tools into separate modules
2. Update server.ts to use the new modular structure
3. Share code between CLI and MCP implementations

## Benefits of Modularization

1. **Improved Maintainability**: Smaller, focused files that are easier to understand and modify
2. **Better Testability**: Isolated components that can be tested independently
3. **Enhanced Collaboration**: Multiple developers can work on different modules simultaneously
4. **Reduced Claude Resource Usage**: Working with smaller files consumes less of Claude's context window
5. **Code Reuse**: Shared functionality between CLI and MCP implementations
6. **Easier Feature Additions**: New features can be added by creating new modules without modifying existing code

## Claude Optimization

To optimize working with Claude:

1. Keep individual files under 500 lines of code when possible
2. Use descriptive file and function names to improve context understanding
3. Implement proper separation of concerns so Claude only needs to examine relevant files for specific tasks
4. Create dedicated modules for frequently modified functionality

## Example File: folderService.ts

Here's an example of how the `folderService.ts` file might look after modularization:

```typescript
import { Client } from '@microsoft/microsoft-graph-client';
import { IAuthService } from '../interfaces/authService';
import { IFolderService } from '../interfaces/folderService';
import { MailFolder, NewMailFolder } from '../models/folder';
import { PathResolver } from '../utils/pathResolver';

export class FolderService implements IFolderService {
  private client: Client;
  private pathResolver: PathResolver;
  private folderPathCache: Map<string, Map<string, string>> = new Map();
  private folderIdCache: Map<string, Map<string, string>> = new Map();

  constructor(authService: IAuthService) {
    this.client = authService.getClient();
    this.pathResolver = new PathResolver(this);
  }

  async getMailFolders(userEmail: string): Promise<MailFolder[]> {
    try {
      if (!userEmail) {
        throw new Error('User email is required');
      }
      
      const endpoint = `/users/${userEmail}/mailFolders`;
      const queryParams = '?$top=100&$select=id,displayName,parentFolderId,childFolderCount,unreadItemCount,totalItemCount';
      
      const response = await this.client
        .api(`${endpoint}${queryParams}`)
        .get();
      
      return response.value;
    } catch (error) {
      console.error('Error getting mail folders:', error);
      throw error;
    }
  }

  async getChildFolders(folderIdOrPath: string, userEmail: string): Promise<MailFolder[]> {
    try {
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const folderId = await this.pathResolver.resolveFolderPath(folderIdOrPath, userEmail);
      const endpoint = `/users/${userEmail}/mailFolders/${folderId}/childFolders`;
      const queryParams = '?$select=id,displayName,parentFolderId,childFolderCount,unreadItemCount,totalItemCount';
      
      const response = await this.client
        .api(`${endpoint}${queryParams}`)
        .get();
      
      return response.value;
    } catch (error) {
      console.error('Error getting child folders:', error);
      throw error;
    }
  }

  // Additional methods for creating, updating, moving, and copying folders...
}
```

## Example File: pathResolver.ts

```typescript
import { IFolderService } from '../interfaces/folderService';

export class PathResolver {
  constructor(private folderService: IFolderService) {}

  async resolveFolderPath(folderPathOrId: string, userEmail: string): Promise<string> {
    // Implementation moved from mailService.ts
  }

  async buildFolderPathMap(userEmail: string): Promise<Map<string, string>> {
    // Implementation moved from mailService.ts
  }
}
```

## Conclusion

Modularizing the codebase will significantly improve maintainability, testability, and Claude resource usage. By breaking down the monolithic structure into smaller, focused modules, we can make the code more manageable and extensible. This approach will also make it easier to implement new features and fix bugs in the future.
