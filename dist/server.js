"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./mcp/server");
// Run the server
(0, server_1.startServer)().catch(error => {
    console.error('Error running MCP server:', error);
    process.exit(1);
});
