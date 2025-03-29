import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerFolderTools } from './tools/folderTools';
import { registerEmailTools } from './tools/emailTools';
import { registerDraftTools } from './tools/draftTools';
import { registerCalendarTools } from './tools/calendarTools';

/**
 * Outlook MCP Server
 * Provides tools for interacting with Microsoft Outlook mail via the MCP protocol
 * 
 * IMPORTANT: When using stdio transport, all logging MUST use console.error()
 * since stdout is reserved for the JSON-RPC protocol messages.
 */
export async function startServer(): Promise<void> {
  console.error('Initializing server...');
  
  // Create the MCP server
  const server = new McpServer({
    name: 'Outlook MCP Server',
    version: '1.0.1'
  });

  // Register tools with the server
  try {
    // Using console.error for all logging since we're using stdio transport
    // This keeps debug messages separate from the JSON-RPC protocol on stdout
    console.error('Registering folder tools...');
    registerFolderTools(server);
    
    console.error('Registering email tools...');
    registerEmailTools(server);
    
    console.error('Registering draft tools...');
    registerDraftTools(server);
    
    console.error('Registering calendar tools...');
    registerCalendarTools(server);
    
    console.error('All tools registered successfully.');
  } catch (error) {
    console.error('Error registering tools:', error);
    throw error;
  }

  // Connect to the transport and start the server
  try {
    console.error('Connecting to transport...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Server started and connected successfully');
  } catch (error) {
    console.error('Error connecting to transport:', error);
    throw error;
  }
}

// Run the server if this file is executed directly
if (require.main === module) {
  startServer().catch(error => {
    console.error('Error running MCP server:', error);
    process.exit(1);
  });
}
