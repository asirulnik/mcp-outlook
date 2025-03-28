"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const folderTools_1 = require("./tools/folderTools");
const emailTools_1 = require("./tools/emailTools");
const draftTools_1 = require("./tools/draftTools");
const calendarTools_1 = require("./tools/calendarTools");
/**
 * Outlook MCP Server
 * Provides tools for interacting with Microsoft Outlook mail via the MCP protocol
 */
async function startServer() {
    console.log('Starting Outlook MCP Server...');
    // Create the MCP server
    const server = new mcp_js_1.McpServer({
        name: 'Outlook MCP Server',
        version: '1.0.1'
    });
    // Register tools with the server
    (0, folderTools_1.registerFolderTools)(server);
    (0, emailTools_1.registerEmailTools)(server);
    (0, draftTools_1.registerDraftTools)(server);
    (0, calendarTools_1.registerCalendarTools)(server);
    // Connect to the transport and start the server
    const transport = new stdio_js_1.StdioServerTransport();
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
