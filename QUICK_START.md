# Quick Start Guide for MCP Outlook

Get up and running with MCP Outlook in a few simple steps.

## Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd mcp-outlook
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.sample .env
   # Edit .env with your Azure credentials
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

## Basic Usage Examples

### Test Authentication
```bash
npm run test-auth -- -u user@example.com
```

### List Mail Folders
```bash
npm run list-folders -- -u user@example.com
```

### List Inbox Emails
```bash
node dist/index.js list-emails "/Inbox" -u user@example.com --limit 10
```

### Read Email Details
```bash
node dist/index.js read-email EMAIL_ID -u user@example.com
```

### Create a Draft Email
```bash
node dist/index.js create-draft -u user@example.com -s "Hello" -t "recipient@example.com" -m "This is a test email."
```

### Create a Folder
```bash
node dist/index.js create-folder "New Folder" -u user@example.com
```

## Using as MCP Server

Start the MCP server:
```bash
npm start
```

The MCP server will start and listen for commands through standard I/O, allowing integration with Language Models like Claude.

## Next Steps

- Refer to the [README.md](README.md) for comprehensive documentation
- Check out [AZURE_SETUP.md](AZURE_SETUP.md) for detailed Azure configuration instructions
