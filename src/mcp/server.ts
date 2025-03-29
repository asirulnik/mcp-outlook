import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerFolderTools } from './tools/folderTools';
import { registerEmailTools } from './tools/emailTools';
import { registerDraftTools } from './tools/draftTools';
import { registerCalendarTools } from './tools/calendarTools';
import { registerPrompts } from './prompts';
import { defaultAccount, hasDefaultAccount, ensureSampleEnvFile } from '../config/env/defaultAccount';

/**
 * Outlook MCP Server
 * Provides tools for interacting with Microsoft Outlook mail via the MCP protocol
 */
export async function startServer(): Promise<void> {
  console.log('Starting Outlook MCP Server...');
  
  // Ensure sample .env file exists
  ensureSampleEnvFile();
  
  // Log default account status
  if (hasDefaultAccount()) {
    console.log(`Default Microsoft account configured: ${defaultAccount}`);
  } else {
    console.log('No default Microsoft account configured. All tools will require explicit userEmail parameter.');
  }
  
  // Create the MCP server
  const server = new McpServer({
    name: 'Outlook MCP Server',
    version: '1.0.1'
  });

  // Register tools with the server
  try {
    console.log('Registering folder tools...');
    registerFolderTools(server);
    
    console.log('Registering email tools...');
    registerEmailTools(server);
    
    console.log('Registering draft tools...');
    registerDraftTools(server);
    
    console.log('Registering calendar tools...');
    registerCalendarTools(server);
    
    console.log('Registering prompts...');
    registerPrompts(server);
    
    console.log('All capabilities registered successfully.');
  } catch (error) {
    console.error('Error registering tools:', error);
    throw error;
  }

  // Connect to the transport and start the server
  try {
    console.log('Connecting to transport...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('Server connected to transport.');
  } catch (error) {
    console.error('Error connecting to transport:', error);
    throw error;
  }
  
  console.log('MCP server running. Use Ctrl+C to exit.');
}

// Run the server if this file is executed directly
if (require.main === module) {
  startServer().catch(error => {
    console.error('Error running MCP server:', error);
    process.exit(1);
  });
}