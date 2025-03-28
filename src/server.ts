import { startServer } from './mcp/server';

// Run the server
startServer().catch(error => {
  console.error('Error running MCP server:', error);
  process.exit(1);
});
