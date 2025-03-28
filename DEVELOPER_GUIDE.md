# Developer Guide for MCP Outlook

This guide provides an overview of the codebase structure, development workflow, and key considerations for new developers joining the MCP Outlook project.

## Project Overview

MCP Outlook is a dual-purpose application:

1. A **CLI tool** for interacting with Microsoft Outlook mail through the command line
2. An **MCP server** that exposes mail functionality to AI assistants like Claude through the Model Context Protocol

The project uses TypeScript for type safety and better developer experience, with Node.js as the runtime environment.

## Architecture

The architecture follows a layered approach:

1. **Interface Layer**: CLI commands (index.ts) and MCP server endpoints (server.ts)
2. **Service Layer**: Core mail functionality (mailService.ts)
3. **Authentication Layer**: Microsoft Graph API authentication (authHelper.ts)
4. **Utility Layer**: Supporting functionality (htmlToText.ts)

## Key Components

### MailService

This is the core of the application, providing all mail-related functionality. It abstracts away the details of interacting with Microsoft Graph API and provides a clean interface for the CLI and MCP server.

Key features:
- Folder management (listing, creating, moving, etc.)
- Email operations (reading, listing, moving, etc.)
- Draft creation
- Search and filtering

### Authentication

The application uses the Microsoft identity platform for authentication with the following flow:
1. Client credentials (application permissions) authenticate with Azure AD
2. OAuth 2.0 token is obtained
3. Token is used for all Microsoft Graph API requests

### Command-Line Interface

The CLI is built using the Commander.js library, which provides a clean, declarative way to define commands, options, and arguments.

### MCP Server

The MCP server uses the Model Context Protocol to expose functionality to AI assistants. It defines tools that can be invoked by the assistant to perform mail operations.

## Development Environment Setup

1. **Prerequisites**:
   - Node.js (v16 or later)
   - npm or yarn
   - TypeScript understanding
   - Microsoft Graph API knowledge (helpful)

2. **Local Development**:
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd mcp-outlook
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.sample .env
   # Edit .env with your Azure credentials
   
   # Build the project
   npm run build
   
   # Run in development mode
   npm run dev  # For MCP server
   npm run cli  # For CLI commands
   ```

## Code Organization

```
mcp-outlook/
├── dist/                # Compiled TypeScript
├── node_modules/        # Dependencies
├── scripts/             # Build and utility scripts
├── src/
│   ├── index.ts         # CLI entry point
│   ├── server.ts        # MCP server entry point
│   ├── mailService.ts   # Core mail functionality
│   ├── authHelper.ts    # Authentication logic
│   └── htmlToText.ts    # HTML to text conversion
├── .env                 # Environment variables (not in repo)
├── .env.sample          # Sample environment file
├── package.json         # Project metadata and scripts
└── tsconfig.json        # TypeScript configuration
```

## Development Workflow

### Making Changes

1. Understand the existing code and how it fits together
2. Make changes to the appropriate files:
   - CLI functionality: Modify `index.ts`
   - MCP server tools: Modify `server.ts`
   - Core mail functionality: Modify `mailService.ts`
3. Build and test your changes:
   ```bash
   npm run build
   # Test appropriate commands
   ```

### Upcoming Refactoring

We're planning to modularize the codebase by:
1. Breaking down the mailService.ts into smaller, focused modules
2. Creating separate classes for each logical component
3. Adopting a more object-oriented approach
4. Reducing file sizes to improve maintainability and Claude resource usage

## Common Development Tasks

### Adding a New CLI Command

1. In `src/index.ts`, add a new command using the Commander.js syntax:
   ```typescript
   program
     .command('new-command <requiredArg>')
     .description('Description of the command')
     .option('-o, --option', 'Description of the option')
     .action(async (requiredArg, options) => {
       // Implement command logic here
     });
   ```

2. If needed, add supporting functionality to `mailService.ts`:
   ```typescript
   async newFunction(param1, param2): Promise<ReturnType> {
     // Implement functionality
   }
   ```

### Adding a New MCP Tool

1. In `src/server.ts`, add a new tool:
   ```typescript
   server.tool(
     'tool-name',
     { 
       param1: z.string(),
       param2: z.number()
     },
     async ({ param1, param2 }) => {
       try {
         const mailService = new MailService();
         const result = await mailService.someFunction(param1, param2);
         
         return {
           content: [{ 
             type: 'text', 
             text: JSON.stringify(result, null, 2)
           }]
         };
       } catch (error) {
         return {
           content: [{ 
             type: 'text', 
             text: `Error: ${error}`
           }],
           isError: true
         };
       }
     }
   );
   ```

2. Add corresponding functionality to `mailService.ts` if needed.

## Using the Microsoft Graph API

The application uses the Microsoft Graph JavaScript SDK to interact with Microsoft's mail services.

Key endpoints used:
- `/users/{userEmail}/mailFolders` - Mail folders
- `/users/{userEmail}/messages` - Emails
- `/users/{userEmail}/mailFolders/{folderId}/childFolders` - Child folders
- `/users/{userEmail}/mailFolders/{folderId}/messages` - Emails in a folder

Documentation: [Microsoft Graph API Reference](https://docs.microsoft.com/en-us/graph/api/overview)

## Testing

Currently, testing is manual. In the future, we plan to add:
- Unit tests for core functionality
- Integration tests for end-to-end flows
- Automated testing in CI/CD

## Best Practices

1. **Error Handling**: Always use try-catch blocks and provide meaningful error messages
2. **Type Safety**: Leverage TypeScript types and interfaces
3. **DRY Principle**: Don't repeat yourself - extract common functionality
4. **Documentation**: Document all functions, classes, and interfaces
5. **Small Functions**: Keep functions small and focused on a single task
6. **Consistent Style**: Follow the established code style and naming conventions

## Next Steps

1. **MCP Integration**: Complete the MCP server functionality for Claude integration
2. **Code Modularization**: Break down large files into smaller, focused modules
3. **Testing**: Add automated tests for key functionality
4. **Documentation**: Improve inline documentation and API references
5. **Error Handling**: Enhance error handling and user feedback

## Getting Help

If you have questions or run into issues:
1. Review the code and comments for context
2. Check the README.md and other documentation
3. Reach out to the main developer for clarification

Happy coding!
