# MCP Outlook - Microsoft Outlook Integration for Claude

## Project Overview

MCP Outlook is a Model Context Protocol (MCP) server that provides Microsoft Outlook mail, draft, folder, and calendar functionality to AI assistants like Claude. It features both a command-line interface (CLI) for direct interaction and an MCP server component that integrates with Claude Desktop.

### Key Features

- **Mail Operations**: List, read, move, and copy emails with filtering capabilities
- **Folder Management**: List, create, move, and rename mail folders
- **Draft Handling**: Create, update, and manage email drafts
- **Calendar Integration**: Manage calendars and events (in development)
- **Path-based Navigation**: Work with folders using human-readable paths
- **HTML Conversion**: Convert HTML emails to readable plain text

## Project Structure

```
mcp-outlook/
├── dist/                # Compiled JavaScript files
├── src/
│   ├── cli/            # CLI command implementation
│   │   ├── commands/   # Individual command modules
│   │   ├── formatters/ # Output formatting utilities
│   │   └── index.ts    # CLI entry point
│   ├── config/
│   │   └── prompts/    # Configuration for templates and messages
│   ├── mcp/            # MCP server implementation
│   │   ├── resources/  # Resource definitions
│   │   ├── tools/      # Tool implementations
│   │   └── server.ts   # MCP server entry point
│   ├── models/         # Data models and interfaces
│   ├── services/       # Core service implementation
│   │   ├── mailService/ # Email and folder services
│   │   ├── interfaces.ts # Service interfaces
│   │   └── authService.ts # Authentication handling
│   ├── utils/          # Utility functions
│   │   └── errors/     # Error handling
│   ├── index.ts        # CLI application entry point
│   └── server.ts       # MCP server entry point
├── scripts/            # Build and utility scripts
├── .env                # Environment configuration (not in repo)
└── package.json        # Project metadata
```

## Current Development Status

### Completed Features

- ✅ **Authentication**: Client credentials flow with Microsoft Graph API
- ✅ **Folder Operations**: List, create, move, rename folders
- ✅ **Email Operations**: List, read, search, filter, copy, move emails
- ✅ **Draft Management**: Create, list, update, and send draft emails
- ✅ **Path-based Navigation**: Human-readable folder paths
- ✅ **CLI Interface**: Comprehensive command-line interface
- ✅ **MCP Server**: Basic MCP server implementation
- ✅ **MCP Logging Fix**: Fixed stderr/stdout issue for proper MCP communication

### In Progress Features

- ⚠️ **Calendar Integration**: Currently experiencing permission issues
- ⚠️ **Attachment Handling**: Downloading and uploading attachments
- ⚠️ **Error Handling Refinement**: Improve error handling and reporting

### Known Issues

1. **Calendar Permission Error**: Despite having correct application permissions in Azure AD, calendar operations return a 403 Forbidden error. The import paths have been fixed, but the issue persists.

2. **Path Resolution Caching**: In some edge cases with deeply nested folder structures, path resolution can be slow or fail.

3. **HTML Content Handling**: Complex HTML emails with deeply nested content may not be properly converted to plain text.

## Development Environment Setup

1. **Prerequisites**:
   - Node.js 18.0.0 or higher
   - npm or yarn
   - Microsoft Exchange Online account
   - Azure AD application with proper permissions

2. **Installation**:
   ```bash
   # Clone the repository
   git clone https://github.com/asirulnik/mcp-outlook.git
   cd mcp-outlook
   
   # Install dependencies
   npm install
   
   # Build the project
   npm run build
   ```

3. **Environment Configuration**:
   Create a `.env` file with Microsoft Graph API credentials:
   ```
   TENANT_ID=your-tenant-id
   CLIENT_ID=your-client-id
   CLIENT_SECRET=your-client-secret
   ```

## Using the Application

### CLI Mode

Test authentication:
```bash
npm run cli -- test-auth --user user@example.com
```

List mail folders:
```bash
npm run cli -- list-folders --user user@example.com
```

Read emails from Inbox:
```bash
npm run cli -- list-emails "/Inbox" --user user@example.com
```

### MCP Server Mode

Configure Claude Desktop by editing:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

Add the following configuration:
```json
{
  "mcpServers": {
    "outlook": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-outlook/dist/server.js"
      ],
      "env": {
        "TENANT_ID": "your-tenant-id",
        "CLIENT_ID": "your-client-id", 
        "CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## Important MCP Server Notes

When developing MCP servers, remember that:

1. **Logging**: All debug/status messages must use `console.error()` instead of `console.log()` when using stdio transport, as stdout is reserved for JSON-RPC protocol messages
2. **Configuration**: The MCP server uses the Model Context Protocol's stdio transport by default
3. **Authentication**: The server inherits environment variables from Claude Desktop, which must be configured in the `env` section of the config

For more details on the MCP logging fix, see [MCP_LOGGING_FIX.md](MCP_LOGGING_FIX.md).

## Current Issues and Debugging

### Calendar Functionality

Despite having the correct permissions in Azure AD (both delegated and application permissions for Calendars.Read and Calendars.ReadWrite), calendar operations return a 403 Forbidden error. We have:

1. Fixed the import path in `serviceFactory.ts` from:
   ```typescript
   import { CalendarService } from './mailService/calendar';
   ```
   to:
   ```typescript
   import { CalendarService } from './mailService/calendar/calendarService';
   ```

2. Verified all calendar-related code implementation
3. Confirmed that the Azure AD permissions are correctly configured with admin consent granted
4. Tested all other functionality to verify that only calendar operations are failing

This suggests a potential issue with how the Microsoft Graph API is being accessed specifically for calendar operations.

### Possible Solutions

1. Create a separate test application specifically for calendar operations
2. Try using the Graph API beta endpoint for calendar operations
3. Check Microsoft 365 policies that might be blocking calendar access
4. Verify the scopes being requested in `authService.ts`

## Next Steps

### Immediate Tasks (Next Session)

1. **Fix Calendar Functionality**:
   - Create a standalone test script to isolate the calendar access issue
   - Check if Graph API version or endpoints need modification for calendar access
   - Test with different authentication methods or scopes

2. **Improve Error Handling**:
   - Enhance error feedback for calendar operations
   - Implement more descriptive error messages for path resolution issues

3. **Enhance MCP Server Integration**:
   - Complete the implementation of remaining MCP tools for calendar operations
   - Test all capabilities with Claude Desktop

### Medium-Term Tasks

1. **Implement Attachment Handling**:
   - Add functionality to download email attachments
   - Enable uploading attachments to draft emails

2. **Extend Calendar Functionality**:
   - Implement recurring meetings
   - Add meeting invitation management

3. **Code Refactoring**:
   - Modularize large files for better maintainability
   - Improve type safety and documentation

### Long-Term Goals

1. **Advanced Features**:
   - Contact management integration
   - Categories and rules implementation
   - Full-text search across all folders

2. **Performance Optimization**:
   - Implement caching strategies for frequent operations
   - Optimize batch operations for folder and email management

3. **Authentication Enhancements**:
   - Support for different authentication methods
   - Multi-tenant support

## Resources

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/overview)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Azure Application Registration Guide](AZURE_SETUP.md)
- [Project Developer Guide](DEVELOPER_GUIDE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)