# Outlook MCP Server Usage Guide

This document provides detailed instructions for using the Outlook MCP Server with Claude Desktop and other AI assistants.

## Overview

The Outlook MCP Server exposes Microsoft Outlook mail functionality through the Model Context Protocol (MCP), allowing AI assistants like Claude to interact with your email, folders, drafts, and calendar.

## Prerequisites

1. Microsoft account with Outlook (M365/Exchange)
2. Azure Application registration with appropriate Microsoft Graph permissions
3. Node.js 18 or higher
4. Claude Desktop or another MCP-compatible AI assistant

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/asirulnik/mcp-outlook
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
   
   See the [Azure Setup Guide](AZURE_SETUP.md) for detailed instructions on obtaining these credentials.

## Configuring with Claude Desktop

1. Open your Claude Desktop configuration file located at:
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. Add the Outlook MCP server configuration:
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

3. Replace `/absolute/path/to/mcp-outlook` with the full path to your mcp-outlook installation.

4. Save the file and restart Claude Desktop.

## Using the MCP Server with Claude

Once configured, Claude Desktop will automatically connect to the Outlook MCP server. You can use the following types of natural language requests:

### Email Management

- "Show me my recent emails from [sender]"
- "Find emails with [subject] in my inbox"
- "Read the email from [sender] about [subject]"
- "Create a draft email to [recipient] about [subject]"
- "Move the email from [sender] to my [folder] folder"

### Folder Management

- "Show me my mail folders"
- "Create a new folder called [folder name]"
- "Move [folder] to be a subfolder of [parent folder]"
- "Rename folder [old name] to [new name]"

### Draft Management

- "Show my draft emails"
- "Create a new draft to [recipient] with subject [subject]"
- "Update my draft to [recipient] to include [content]"

### Calendar Management (Preview)

- "Show my upcoming calendar events"
- "Create a new calendar event for [date] at [time]"
- "Get details about my [event name] meeting"

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify your Azure App credentials in the `.env` file
   - Ensure the required Microsoft Graph permissions are granted

2. **Connection Issues**:
   - Check that Claude Desktop is properly configured
   - Verify the path to the server.js file is correct
   - Check the Claude Desktop logs for connection errors

3. **MCP Protocol Errors**:
   - Update to the latest version of the MCP SDK
   - Verify compatible versions between Claude Desktop and the MCP server

### Logs

To view logs and debug issues:

1. MCP server logs (stderr output):
   ```
   ~/Library/Logs/Claude/mcp-server-outlook.log
   ```

2. Claude Desktop logs:
   ```
   ~/Library/Logs/Claude/claude.log
   ```

## Security Considerations

1. The MCP server uses your Microsoft Graph API credentials to access your Outlook data
2. Credentials in the `.env` file and claude_desktop_config.json should be kept secure
3. The tool follows Microsoft's permission model - only operations allowed by your granted permissions will work
4. All operations are performed using the credentials provided, not through user OAuth flow

## Additional Resources

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/overview)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Claude Desktop Documentation](https://claude.ai/docs)

## Support

For issues or questions:
1. Open an issue on the GitHub repository
2. Check the troubleshooting guides
3. Review the detailed logs

## License

ISC
