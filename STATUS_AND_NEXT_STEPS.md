# MCP Outlook Status and Next Steps

## Current Status (March 28, 2025)

The MCP Outlook project has made significant progress in implementing core mail functionality, but there are several outstanding issues and enhancements to be addressed.

### Development Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication | ✅ Complete | Client credentials flow with Graph API working |
| Folder Management | ✅ Complete | All operations working (list, create, move, rename) |
| Email Operations | ✅ Complete | List, read, filter, move, copy working |
| Drafts | ✅ Complete | Create, list, update, send working |
| CLI Interface | ✅ Complete | All commands implemented and functional |
| Calendar Integration | ⚠️ Issue | 403 error despite proper permissions |
| Attachment Handling | 🚧 Planned | Partially implemented |
| MCP Server | 🚧 In Progress | Basic implementation working |

## Recent Changes

- Fixed import path for `CalendarService` in `serviceFactory.ts` to correctly point to `./mailService/calendar/calendarService`
- Added comprehensive README documentation
- Updated CLI help messages with better examples
- Improved error handling for folder path resolution

## Debugging Calendar Issue

The calendar functionality is correctly implemented but returns a 403 Forbidden error. Our debugging has found:

1. **API Permissions**: The Azure application has the required permissions and admin consent:
   - Calendars.Read (Application)
   - Calendars.ReadWrite (Application)

2. **Code Implementation**: The calendar API endpoints are correctly structured:
   ```typescript
   // List calendars
   const endpoint = `/users/${userEmail}/calendars`;
   
   // List events
   const endpoint = calendarId
     ? `/users/${userEmail}/calendars/${calendarId}/events`
     : `/users/${userEmail}/calendar/events`;
   ```

3. **Authentication**: The authentication token is correctly generated and works for other operations.

4. **Scopes Requested**: The auth service is using the scope:
   ```typescript
   const authProvider = new TokenCredentialAuthenticationProvider(credential, {
     scopes: ['https://graph.microsoft.com/.default']
   });
   ```

## Isolation Testing Results

Testing the basic mail functionality confirms everything is working correctly:
- Authentication: ✅ Success
- List folders: ✅ Success
- List emails: ✅ Success
- Read emails: ✅ Success (with minor error display issue)
- Draft creation: ✅ Success

Only the calendar operations are failing.

## Recommended Next Steps

### 1. Calendar API Issue Resolution

**Priority: High**

- Create a standalone test script that isolates calendar operations:
  ```typescript
  // File: calendar-test.js
  const { ClientSecretCredential } = require('@azure/identity');
  const { Client } = require('@microsoft/microsoft-graph-client');
  const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
  require('isomorphic-fetch');
  
  async function main() {
    // Get credentials from env vars
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const userEmail = process.env.USER_EMAIL;
    
    // Create credential
    const credential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    );
    
    // Auth provider
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    });
    
    // Graph client
    const client = Client.initWithMiddleware({
      authProvider: authProvider
    });
    
    try {
      // Test mail endpoint (should work)
      console.log("Testing mail folders...");
      const folders = await client.api(`/users/${userEmail}/mailFolders`).get();
      console.log(`Found ${folders.value.length} mail folders`);
      
      // Test calendar endpoint
      console.log("Testing calendars...");
      const calendars = await client.api(`/users/${userEmail}/calendars`).get();
      console.log(`Found ${calendars.value.length} calendars`);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  main().catch(console.error);
  ```

- Try using different API endpoint variations:
  - `/users/${userEmail}/calendar` (singular)
  - `/users/${userEmail}/calendars` (plural)
  - `/users/${userEmail}/calendarView`

- Test with beta endpoint: `https://graph.microsoft.com/beta/users/${userEmail}/calendars`

### 2. Error Handling Improvements

**Priority: Medium**

- Add more graceful handling for calendar permission errors
- Enhance feedback for path resolution failures
- Check for email read errors and provide clearer error messages

### 3. Attachment Support

**Priority: Medium**

- Complete implementation of attachment download functionality
- Add attachment upload for draft emails
- Add proper MIME type detection and handling

### 4. MCP Server Enhancements

**Priority: Medium**

- Add descriptive tool definitions for Claude usage
- Implement remaining calendar tools once the permission issue is fixed
- Improve response formatting for better Claude integration

## Build and Test Plan

1. Fix the calendar permission issue
2. Run comprehensive CLI testing on all operations
3. Test MCP server with Claude Desktop
4. Add automated testing for critical functionality

## Questions for Microsoft Support (if needed)

1. Why would Calendar.Read application permissions be granted but still return 403?
2. Are there any tenant settings that could block application-level calendar access?
3. Is there a different endpoint or API version needed for calendar access?
4. Are there additional headers required for calendar operations?

## Resources

- [Microsoft Graph Calendar API Documentation](https://learn.microsoft.com/en-us/graph/api/resources/calendar?view=graph-rest-1.0)
- [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) - Useful for testing API calls
- [Microsoft Graph Permissions Reference](https://learn.microsoft.com/en-us/graph/permissions-reference)