# MCP Outlook CLI & Server

A comprehensive toolset for interacting with Microsoft Outlook mail, featuring both a command-line interface and a Model Context Protocol (MCP) server for integration with AI assistants like Claude.

## Features

- **Mail Folder Management**: List, create, rename, move, and copy folders
- **Email Operations**: List, read, move, copy, and search emails
- **Draft Creation**: Create new email drafts with HTML or plain text
- **Advanced Filtering**: Filter emails by date range and content
- **HTML Conversion**: Convert HTML emails to readable plain text format
- **Path-based Navigation**: Work with folders using either IDs or human-readable paths

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mcp-outlook
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the application:
   ```
   npm run build
   ```

4. Configure your environment by creating a `.env` file with your Microsoft Graph API credentials:
   ```
   TENANT_ID=your-tenant-id
   CLIENT_ID=your-client-id
   CLIENT_SECRET=your-client-secret
   ```
   
   See the [Azure Setup Guide](AZURE_SETUP.md) for detailed instructions.

## Usage

The application can be used in two modes:

1. **CLI Mode**: Direct command-line interface for mail operations
2. **MCP Server Mode**: Integration with AI assistants like Claude (in development)

### CLI Mode Quick Start

Test authentication:
```
node dist/index.js test-auth -u andrew@sirulnik-law.com
```

List mail folders:
```
node dist/index.js list-folders -u andrew@sirulnik-law.com
```

## Command Reference

### Folder Operations

#### List Folders
List all top-level mail folders:
```
node dist/index.js list-folders -u andrew@sirulnik-law.com
```

Example output:
```
Mail Folders for andrew@sirulnik-law.com:
├── Inbox (Path: /Inbox, Unread: 53, Total: 1456)
├── Sent Items (Path: /Sent Items, Unread: 0, Total: 1250)
├── Drafts (Path: /Drafts, Unread: 0, Total: 32)
└── ...
```

#### List Child Folders
View subfolders within a specific folder:
```
node dist/index.js list-child-folders "/Inbox" -u andrew@sirulnik-law.com
```

Example output:
```
Child Folders for Folder: /Inbox (User: andrew@sirulnik-law.com)
├── Temp (Path: /Inbox/Temp, Unread: 0, Total: 0)
└── Test-Folder (Path: /Inbox/Test-Folder, Unread: 0, Total: 0)
```

#### Create Folder
Create a new mail folder:
```
node dist/index.js create-folder "Project X" -u andrew@sirulnik-law.com
```

Create a subfolder:
```
node dist/index.js create-folder "Meetings" -u andrew@sirulnik-law.com -p "/Project X"
```

#### Rename Folder
Rename an existing folder:
```
node dist/index.js rename-folder "/Project X" "Client Project Alpha" -u andrew@sirulnik-law.com
```

#### Move Folder
Move a folder to become a subfolder of another folder:
```
node dist/index.js move-folder "/Client Project Alpha" "/Clients" -u andrew@sirulnik-law.com
```

#### Copy Folder
Copy a folder (Note: May not be supported by Microsoft Graph API):
```
node dist/index.js copy-folder "/Inbox/Templates" "/Archive" -u andrew@sirulnik-law.com
```

### Email Operations

#### List Emails
List emails in a folder (default: 25 most recent):
```
node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com
```

List with custom limit:
```
node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com --limit 10
```

List with date filters:
```
# Emails from the last 7 days
node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com --previous 7 --unit days

# Emails before a specific date
node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com --before "2025-03-15"

# Emails after a specific date
node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com --after "2025-03-01"
```

List with search:
```
# Search across all fields
node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com --search "meeting"
```

#### Read Email
Read a specific email with full details:
```
node dist/index.js read-email EMAIL_ID -u andrew@sirulnik-law.com
```

Read with hidden quoted content (for replies and forwards):
```
node dist/index.js read-email EMAIL_ID -u andrew@sirulnik-law.com --hide-quoted
```

#### Move Email
Move an email to another folder:
```
node dist/index.js move-email EMAIL_ID "/Archive" -u andrew@sirulnik-law.com
```

#### Copy Email
Copy an email to another folder:
```
node dist/index.js copy-email EMAIL_ID "/Backup" -u andrew@sirulnik-law.com
```

### Draft Creation

Create a simple plain text draft:
```
node dist/index.js create-draft -u andrew@sirulnik-law.com -s "Meeting Tomorrow" -t "colleague@example.com" -m "Let's meet tomorrow at 10 AM."
```

Create with multiple recipients:
```
node dist/index.js create-draft -u andrew@sirulnik-law.com -s "Team Update" -t "team@example.com,manager@example.com" -m "Please see attached report."
```

Create with CC and BCC:
```
node dist/index.js create-draft -u andrew@sirulnik-law.com -s "Project Status" -t "client@example.com" -c "manager@example.com" -b "records@example.com" -m "Project is on track for delivery."
```

Create HTML email:
```
node dist/index.js create-draft -u andrew@sirulnik-law.com -s "Quarterly Report" -t "board@example.com" -f report-template.html --html
```

### HTML Conversion

Convert HTML to plain text:
```
node dist/index.js convert-html -f email.html
```

With options:
```
node dist/index.js convert-html -f email.html --hide-quoted --word-wrap 80 --preserve-links
```

## All Commands Reference

Run `node dist/index.js --help` to see all available commands:

```
Usage: outlook-mail-cli [options] [command]

CLI to interact with Microsoft Outlook mail

Options:
  -V, --version                                output the version number
  -h, --help                                   display help for command

Commands:
  test-auth [options]                          Test authentication with Microsoft Graph
  list-folders [options]                       List all top-level mail folders
  list-child-folders [options] <folderIdOrPath> List child folders of a specific mail folder
  list-emails [options] <folderIdOrPath>       List emails in a specific mail folder
  read-email [options] <emailId>               Read a specific email with all details
  move-email [options] <emailId> <destinationFolderIdOrPath> Move an email to another folder
  copy-email [options] <emailId> <destinationFolderIdOrPath> Copy an email to another folder
  create-draft [options]                       Create a new draft email
  create-folder [options] <name>               Create a new mail folder
  rename-folder [options] <folderIdOrPath> <newName> Rename a mail folder
  move-folder [options] <folderIdOrPath> <destinationParentFolderIdOrPath> Move a folder to another parent folder
  copy-folder [options] <folderIdOrPath> <destinationParentFolderIdOrPath> Copy a folder to another parent folder
  convert-html [options]                       Convert HTML content to plain text
  help [command]                               display help for command
```

## MCP Server Mode (Coming Soon)

The MCP server mode is designed to integrate with AI assistants like Claude, providing mail functionality through the Model Context Protocol.

To start the MCP server:
```
npm start
```

## Development

### Project Structure

- `src/index.ts`: CLI application entry point
- `src/server.ts`: MCP server entry point
- `src/mailService.ts`: Core mail service implementation
- `src/authHelper.ts`: Authentication logic for Microsoft Graph API
- `src/htmlToText.ts`: HTML to plain text conversion utilities

### Running in Development Mode

For CLI:
```
npx ts-node src/index.js [command] [options]
```

For MCP server:
```
npx ts-node src/server.ts
```

### API Documentation

#### MailService Class

The core functionality resides in the MailService class, which provides the following methods:

- `getMailFolders(userEmail)`: List all top-level folders
- `getChildFolders(folderIdOrPath, userEmail)`: List child folders
- `listEmails(folderIdOrPath, userEmail, limit, searchOptions)`: List emails with filtering
- `getEmail(emailId, userEmail, hideQuotedContent)`: Get a specific email
- `moveEmail(emailId, destinationFolderIdOrPath, userEmail)`: Move an email
- `copyEmail(emailId, destinationFolderIdOrPath, userEmail)`: Copy an email
- `createDraft(draft, userEmail)`: Create a new draft email
- `createFolder(newFolder, userEmail, parentFolderIdOrPath)`: Create a folder
- `updateFolder(folderIdOrPath, updatedFolder, userEmail)`: Update folder properties
- `moveFolder(folderIdOrPath, destinationParentFolderIdOrPath, userEmail)`: Move a folder
- `copyFolder(folderIdOrPath, destinationParentFolderIdOrPath, userEmail)`: Copy a folder

## Roadmap

- Enhance MCP server integration for AI assistant compatibility
- Add attachment handling (upload/download)
- Add calendar integration
- Code modularization for better maintainability
- Advanced search and filtering capabilities

## Troubleshooting

See the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide for common issues and solutions.

## License

ISC
