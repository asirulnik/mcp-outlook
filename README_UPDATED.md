# MCP Outlook CLI & Server

A comprehensive toolset for interacting with Microsoft Outlook mail and calendar, featuring both a command-line interface and a Model Context Protocol (MCP) server for integration with AI assistants like Claude.

## Features

- **Mail Folder Management**: List, create, rename, move, and copy folders
- **Email Operations**: List, read, move, copy, and search emails
- **Attachment Handling**: List and download email attachments
- **Draft Management**: Create, read, update, send, and delete draft emails
- **Calendar Integration**: Manage calendars, list events, create and update appointments
- **Advanced Filtering**: Filter emails by date range, content, and sort by various fields
- **HTML Conversion**: Convert HTML emails to readable plain text format
- **Path-based Navigation**: Work with folders using either IDs or human-readable paths
- **Customizable Configuration**: Easily configure tool descriptions and responses

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

1. **CLI Mode**: Direct command-line interface for mail and calendar operations
2. **MCP Server Mode**: Integration with AI assistants like Claude

### CLI Mode Quick Start

Test authentication:
```
node dist/index.js test-auth -u your-email@example.com
```

List mail folders:
```
node dist/index.js list-folders -u your-email@example.com
```

## Command Reference

### Folder Operations

#### List Folders
List all top-level mail folders:
```
node dist/index.js list-folders -u your-email@example.com
```

Example output:
```
Mail Folders for your-email@example.com:
├── Inbox (Path: /Inbox, Unread: 5, Total: 125)
├── Sent Items (Path: /Sent Items, Unread: 0, Total: 75)
├── Drafts (Path: /Drafts, Unread: 0, Total: 3)
└── ...
```

#### List Child Folders
View subfolders within a specific folder:
```
node dist/index.js list-child-folders "/Inbox" -u your-email@example.com
```

#### Create Folder
Create a new mail folder:
```
node dist/index.js create-folder "Project X" -u your-email@example.com
```

### Email Operations

#### List Emails
List emails in a folder (default: 25 most recent):
```
node dist/index.js list-emails "/Inbox" -u your-email@example.com
```

List with filtering options:
```
# Emails from the last 7 days
node dist/index.js list-emails "/Inbox" -u your-email@example.com --previous 7 --unit days

# Emails with a specific search term
node dist/index.js list-emails "/Inbox" -u your-email@example.com --search "meeting"
```

List with sort options:
```
# Sort by subject
node dist/index.js list-emails "/Inbox" -u your-email@example.com --sort-by subject --sort-order asc
```

Include full bodies in listing:
```
node dist/index.js list-emails "/Inbox" -u your-email@example.com --include-bodies
```

#### Read Email
Read a specific email with full details:
```
node dist/index.js read-email EMAIL_ID -u your-email@example.com
```

### Attachment Operations

#### List Attachments
List all attachments in an email:
```
node dist/index.js list-attachments EMAIL_ID -u your-email@example.com
```

Example output:
```
Attachments for Email AAMkAD... (User: your-email@example.com):

1. Report.pdf (application/pdf, 1458 KB)
   ID: ABcDEfGhiJkLMn...

2. Meeting-Notes.docx (application/vnd.openxmlformats-officedocument.wordprocessingml.document, 254 KB)
   ID: OpQrStUvwXyZ...

Found 2 attachment(s).
```

#### Download Attachment
Download an attachment from an email:
```
node dist/index.js download-attachment EMAIL_ID ATTACHMENT_ID -u your-email@example.com
```

Download with custom output path:
```
node dist/index.js download-attachment EMAIL_ID ATTACHMENT_ID -u your-email@example.com -o /path/to/save/file.pdf
```

### Draft Operations

#### Create Draft
Create a simple plain text draft:
```
node dist/index.js create-draft -u your-email@example.com -s "Meeting Tomorrow" -t "colleague@example.com" -m "Let's meet tomorrow at 10 AM."
```

#### List Drafts
List draft emails:
```
node dist/index.js list-drafts -u your-email@example.com
```

#### Get Draft
View a specific draft:
```
node dist/index.js get-draft DRAFT_ID -u your-email@example.com
```

#### Update Draft
Update an existing draft:
```
node dist/index.js update-draft DRAFT_ID -u your-email@example.com -s "Updated Subject"
```

#### Send Draft
Send an existing draft:
```
node dist/index.js send-draft DRAFT_ID -u your-email@example.com
```

#### Delete Draft
Delete a draft:
```
node dist/index.js delete-draft DRAFT_ID -u your-email@example.com
```

### Calendar Operations

#### List Calendars
List all calendars:
```
node dist/index.js list-calendars -u your-email@example.com
```

#### List Events
List calendar events:
```
node dist/index.js list-events -u your-email@example.com
```

List events with date range:
```
node dist/index.js list-events -u your-email@example.com --start "2023-04-01T00:00:00" --end "2023-04-30T23:59:59"
```

#### Create Event
Create a new calendar event:
```
node dist/index.js create-event -u your-email@example.com -s "Team Meeting" --start "2023-04-15T10:00:00" --end "2023-04-15T11:00:00" --time-zone "America/New_York" -l "Conference Room"
```

Add attendees:
```
node dist/index.js create-event -u your-email@example.com -s "Team Meeting" --start "2023-04-15T10:00:00" --end "2023-04-15T11:00:00" --time-zone "America/New_York" --attendees "colleague1@example.com,colleague2@example.com"
```

#### Update Event
Update an existing event:
```
node dist/index.js update-event EVENT_ID -u your-email@example.com -s "Updated Meeting Title"
```

#### Delete Event
Delete an event:
```
node dist/index.js delete-event EVENT_ID -u your-email@example.com
```

## MCP Server Mode

The MCP server mode integrates with AI assistants like Claude, providing mail and calendar functionality through the Model Context Protocol.

To start the MCP server:
```
npm start
```

### Configuration

You can customize the MCP server by creating an `outlook-mcp-config.json` file in the working directory. This allows you to change tool descriptions, parameter descriptions, and response messages without modifying the code.

Example configuration:
```json
{
  "tools": {
    "email": {
      "listEmails": {
        "description": "List emails from your Outlook inbox with filtering options",
        "responses": {
          "success": "Found {count} emails that match your criteria"
        }
      }
    }
  }
}
```

### Available MCP Tools

The MCP server exposes the following tools:

#### Email Tools
- `list-emails` - List emails with filtering options
- `read-email` - Read a specific email
- `move-email` - Move an email to another folder
- `copy-email` - Copy an email to another folder
- `list-attachments` - List attachments in an email
- `download-attachment` - Download an attachment
- `convert-html-to-text` - Convert HTML to plain text

#### Folder Tools
- `list-folders` - List mail folders
- `list-child-folders` - List child folders
- `create-folder` - Create a new folder
- `rename-folder` - Rename a folder
- `move-folder` - Move a folder
- `copy-folder` - Copy a folder

#### Draft Tools
- `create-draft` - Create a new draft email
- `list-drafts` - List draft emails
- `get-draft` - Get a specific draft
- `update-draft` - Update a draft
- `send-draft` - Send a draft
- `delete-draft` - Delete a draft

#### Calendar Tools
- `list-calendars` - List calendars
- `list-events` - List calendar events
- `get-event` - Get a specific event
- `create-event` - Create a new event
- `update-event` - Update an event
- `delete-event` - Delete an event

## Error Handling

The application includes comprehensive error handling:

- Custom error classes for different error types
- Detailed error messages with context
- Consistent error formatting across all components
- Graceful handling of common error scenarios

## Development

For information on developing and extending the application, see the [Developer Guide](DEVELOPER_GUIDE.md).

### Project Structure

- `src/cli/` - Command-line interface
- `src/config/` - Configuration and templates
- `src/mcp/` - MCP server and tools
- `src/models/` - Data models and interfaces
- `src/services/` - Core business logic
- `src/utils/` - Utility functions

## Troubleshooting

See the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide for common issues and solutions.

## License

ISC
