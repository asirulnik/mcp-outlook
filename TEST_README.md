# MCP Outlook Test Scripts

This directory contains test scripts for validating the functionality of the MCP Outlook CLI and MCP server.

## Prerequisites

Before running the tests, ensure you have:

1. Configured your Azure credentials in the `.env` file:
   ```
   TENANT_ID=your_tenant_id
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   ```

2. Installed the required dependencies:
   ```
   npm install
   ```

3. Built the application:
   ```
   npm run build
   ```

## Test Scripts

### 1. Master Test Script

`run-tests.sh` - Runs both CLI and MCP server tests in sequence.

**Usage:**
```bash
chmod +x run-tests.sh
./run-tests.sh user@example.com
```

### 2. CLI Test Script

`test-cli.sh` - Tests the CLI commands for interacting with Microsoft Outlook mail.

**Usage:**
```bash
chmod +x test-cli.sh
./test-cli.sh user@example.com
```

**What it tests:**
- Authentication
- Listing mail folders
- Creating folders and subfolders
- Renaming folders
- Creating draft emails
- Listing emails in folders
- Reading email details
- Converting HTML to text
- Searching for emails

### 3. MCP Server Test Script

`test-mcp.js` - Tests the MCP server functionality by sending commands to the server and verifying the responses.

**Usage:**
```bash
node test-mcp.js user@example.com
```

**What it tests:**
- List mail folders
- Create folders and subfolders
- List child folders
- Create draft emails
- List emails in folders
- Read email details
- Convert HTML to text
- Update folder name

## Test Artifacts

The test scripts create the following artifacts in your Outlook account:

1. Test folders with names like:
   - `MCP-CLI-Test-<timestamp>`
   - `MCP-Server-Test-<timestamp>`

2. Draft emails with subjects like:
   - "Test Email from MCP CLI"
   - "Test Email from MCP Server"

**Note:** You may want to manually delete these test artifacts after testing is complete.

## Troubleshooting

If you encounter issues, check the following:

1. Verify that your `.env` file contains the correct credentials.
2. Ensure that the application is built (`npm run build`).
3. Make sure the specified user email has appropriate permissions.
4. Check the application logs for detailed error messages.

For more information, refer to the main [README.md](README.md) and [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
