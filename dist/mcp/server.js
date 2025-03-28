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
    try {
        console.log('Registering folder tools...');
        (0, folderTools_1.registerFolderTools)(server);
        console.log('Registering email tools...');
        (0, emailTools_1.registerEmailTools)(server);
        console.log('Registering draft tools...');
        (0, draftTools_1.registerDraftTools)(server);
        console.log('Registering calendar tools...');
        (0, calendarTools_1.registerCalendarTools)(server);
        console.log('All tools registered successfully.');
    }
    catch (error) {
        console.error('Error registering tools:', error);
        throw error;
    }
    // Connect to the transport and start the server
    try {
        console.log('Connecting to transport...');
        const transport = new stdio_js_1.StdioServerTransport();
        await server.connect(transport);
        console.log('Server connected to transport.');
    }
    catch (error) {
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
