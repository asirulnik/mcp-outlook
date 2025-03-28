import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerFolderTools } from './tools/folderTools';
import { registerEmailTools } from './tools/emailTools';
import { registerDraftTools } from './tools/draftTools';
import { registerCalendarTools } from './tools/calendarTools';

/**
 * Outlook MCP Server
 * Provides tools for interacting with Microsoft Outlook mail via the MCP protocol
 */
export async function startServer(): Promise<void> {
  console.log('Starting Outlook MCP Server...');
  
  // Create the MCP server
  const server = new McpServer({
    name: 'Outlook MCP Server',
    version: '1.0.1'
  });

  // Register tools with the server
  registerFolderTools(server);
  registerEmailTools(server);
  registerDraftTools(server);
  registerCalendarTools(server);

  // Connect to the transport and start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log('MCP server running. Use Ctrl+C to exit.');
}

// Run the server if this file is executed directly
if (require.main === module) {
  startServer().catch(error => {
    console.error('Error running MCP server:', error);
    process.exit(1);
  });
}
