# MCP Server Logging Issue and Fix

## Issue Description

The Outlook MCP server was experiencing communication errors with Claude Desktop due to improper logging practices. Specifically, the server was using `console.log()` for status and debug messages, which sent output to stdout.

In MCP servers using stdio transport, stdout is reserved exclusively for JSON-RPC protocol messages between the client and server. Any debug messages, status updates, or logging should go to stderr.

### Error Symptoms

The following errors were observed in the logs:

```
Unexpected token 'S', "Starting O"... is not valid JSON
Unexpected token 'R', "Registerin"... is not valid JSON
Unexpected token 'A', "All tools "... is not valid JSON
```

These errors occurred because debugging text was being mixed with JSON-RPC messages on stdout, breaking the JSON parsing in the MCP client.

## Solution

Change all `console.log()` calls to `console.error()` in the MCP server implementation. This ensures that:

1. Debug messages go to stderr
2. Stdout is used exclusively for the JSON-RPC protocol
3. The MCP client can correctly parse all messages on stdout

### Example Fix

```typescript
// INCORRECT - Using console.log() with stdio transport
console.log('Starting Outlook MCP Server...');

// CORRECT - Using console.error() with stdio transport
console.error('Starting Outlook MCP Server...');
```

## Implementation

A fixed version has been created at `src/mcp/server-fixed.ts`. To use this version:

1. Rename or backup the original `src/mcp/server.ts`
2. Copy `server-fixed.ts` to `server.ts`
3. Rebuild the project with `npm run build`
4. Restart Claude Desktop

## Additional Recommendations

1. Add proper logging levels (info, warn, error, debug) that all output to stderr
2. Consider using a proper logging library that can handle different transport types
3. Add clear guidelines in the code to prevent future issues
4. Consider adding tests that verify all output to stdout is valid JSON-RPC

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
