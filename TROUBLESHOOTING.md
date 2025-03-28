# MCP Outlook Troubleshooting Guide

This guide covers common issues you might encounter when using the MCP Outlook CLI and server.

## Authentication Issues

### Issue: "Authentication failed" error

**Possible causes**:
- Invalid tenant ID, client ID, or client secret in `.env` file
- Expired client secret
- Missing permissions in Azure AD
- Network connectivity issues

**Solutions**:
1. Verify your credentials in the `.env` file:
   ```
   TENANT_ID=your-tenant-id
   CLIENT_ID=your-client-id
   CLIENT_SECRET=your-client-secret
   ```

2. Check if your client secret has expired in the Azure Portal:
   - Go to Azure Portal → Azure Active Directory → App registrations
   - Select your app → Certificates & secrets
   - Check expiration dates of client secrets

3. Verify required permissions:
   - Go to Azure Portal → Azure Active Directory → App registrations
   - Select your app → API permissions
   - Ensure you have the following permissions:
     - `Mail.Read`
     - `Mail.ReadWrite`
     - `Mail.Send`
     - `MailboxSettings.Read`
     - `User.Read.All`
   - Make sure admin consent has been granted (should show green checkmarks)

4. Test your network connectivity:
   ```
   ping login.microsoftonline.com
   ping graph.microsoft.com
   ```

### Issue: "User email is required for application permissions flow"

**Cause**: Missing user email parameter in command

**Solution**: Always include the `-u` or `--user` parameter with a valid email address:
```
node dist/index.js command-name -u andrew@sirulnik-law.com
```

## Folder Operations Issues

### Issue: "Folder not found" error

**Possible causes**:
- Incorrect folder ID or path
- Folder exists but under a different parent
- Case sensitivity in folder path

**Solutions**:
1. Use `list-folders` to see all top-level folders:
   ```
   node dist/index.js list-folders -u andrew@sirulnik-law.com
   ```

2. Use folder paths with exact case matching:
   ```
   # Correct
   "/Inbox/Important"
   
   # Incorrect
   "/inbox/important"
   ```

3. For deeply nested folders, check each level:
   ```
   node dist/index.js list-child-folders "/Clients" -u andrew@sirulnik-law.com
   node dist/index.js list-child-folders "/Clients/ProjectA" -u andrew@sirulnik-law.com
   ```

### Issue: "Folder copying is not supported by the Microsoft Graph API"

**Cause**: Microsoft Graph API limitation

**Solution**: Instead of copying, create a new folder and copy emails individually:
1. Create a new folder:
   ```
   node dist/index.js create-folder "NewFolder" -u andrew@sirulnik-law.com -p "/ParentFolder"
   ```

2. List and copy emails from the source folder:
   ```
   node dist/index.js list-emails "/SourceFolder" -u andrew@sirulnik-law.com
   # For each email ID, run:
   node dist/index.js copy-email EMAIL_ID "/ParentFolder/NewFolder" -u andrew@sirulnik-law.com
   ```

## Email Operations Issues

### Issue: Search query errors

**Possible causes**:
- Invalid search syntax
- Special characters in search query
- Using fields option with incompatible search terms

**Solutions**:
1. Use simple search terms without special characters:
   ```
   # Good
   node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com --search "meeting"
   
   # Problematic
   node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com --search "meeting: Q1 2025"
   ```

2. Omit the `--fields` option for complex searches:
   ```
   node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com --search "quarterly report"
   ```

3. For date-based filtering, use the dedicated options instead of search:
   ```
   node dist/index.js list-emails "/Inbox" -u andrew@sirulnik-law.com --after "2025-03-01" --before "2025-03-31"
   ```

### Issue: HTML content not displaying correctly

**Cause**: Complex HTML rendering in terminal

**Solution**: Use the HTML to text converter:
```
# Read email with HTML conversion
node dist/index.js read-email EMAIL_ID -u andrew@sirulnik-law.com

# Save HTML content to file and convert
node dist/index.js convert-html -f email.html
```

## Draft Creation Issues

### Issue: "Error creating draft email"

**Possible causes**:
- Invalid recipient email format
- Missing required parameters
- File not found when using `-f` option

**Solutions**:
1. Check recipient email formats:
   ```
   # Correct
   -t "user@example.com"
   
   # Incorrect
   -t "User Name" # Missing email address
   ```

2. Ensure all required parameters are provided:
   ```
   node dist/index.js create-draft -u andrew@sirulnik-law.com -s "Subject" -t "recipient@example.com" -m "Message"
   ```

3. When using a file for message body, verify the file exists:
   ```
   # Check if file exists
   ls -l message.html
   
   # Use with absolute path if needed
   node dist/index.js create-draft -u andrew@sirulnik-law.com -s "Subject" -t "recipient@example.com" -f "/absolute/path/to/message.html" --html
   ```

## Building and Installation Issues

### Issue: TypeScript compilation errors

**Cause**: Type mismatches or missing dependencies

**Solution**:
1. Install dependencies:
   ```
   npm install
   ```

2. Fix type issues in code

3. Run build with verbose output:
   ```
   npm run build -- --verbose
   ```

### Issue: "Command not found" when using the CLI

**Cause**: Executable permissions or path issues

**Solutions**:
1. Make sure the output file is executable:
   ```
   chmod +x dist/index.js
   ```

2. Use the full path:
   ```
   node /path/to/mcp-outlook/dist/index.js command
   ```

3. Install globally (if needed):
   ```
   npm install -g .
   outlook-mail-cli command
   ```

## MCP Server Issues

### Issue: MCP server not responding

**Possible causes**:
- Server not running
- Configuration issues
- Connection problems

**Solutions**:
1. Start the server:
   ```
   npm start
   ```

2. Check for errors in the console output

3. Verify MCP configuration

## Microsoft Graph API Rate Limiting

### Issue: "Too many requests" error

**Cause**: Exceeding Microsoft Graph API rate limits

**Solution**:
1. Add delays between requests:
   ```
   # Instead of running many commands in a loop, add delays
   sleep 1 # On Unix-like systems
   ```

2. Use batch requests for multiple operations (requires code changes)

3. Implement exponential backoff for retries (requires code changes)

## Common Error Messages and Solutions

### "Invalid filter clause"

**Solution**: Simplify your search query, remove special characters, or use a different filtering approach.

### "Resource not found"

**Solution**: Verify that the folder or email ID exists using list commands.

### "The specified object was not found in the store"

**Solution**: The email may have been moved or deleted. Refresh your email list.

### "Access denied"

**Solution**: Check your application permissions in Azure AD and ensure admin consent is granted.

## Getting Advanced Help

If you continue to encounter issues:

1. Run commands with debug logging:
   ```
   NODE_DEBUG=graph,request node dist/index.js command
   ```

2. Check the Microsoft Graph API documentation:
   [Microsoft Graph Mail API Reference](https://docs.microsoft.com/en-us/graph/api/resources/mail-api-overview)

3. Examine network requests (requires code changes to log requests and responses)

4. Reach out to the main developer with:
   - Exact command you ran
   - Full error message
   - Steps to reproduce
   - Any environment details

## Reporting Bugs

When reporting bugs, please include:

1. Command that triggered the issue
2. Complete error message and stack trace
3. Expected behavior vs. actual behavior
4. Version of the application (`npm run cli -- --version`)
5. Operating system and Node.js version
