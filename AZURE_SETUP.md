# Azure Setup Guide for MCP Outlook

This guide walks you through the process of setting up the necessary Azure resources to use the MCP Outlook application.

## Prerequisites

- An Azure account with an active subscription
- Administrative access to your Azure Active Directory (AAD)

## Step 1: Register an Application in Azure Active Directory

1. Sign in to the [Azure Portal](https://portal.azure.com/).
2. Search for and select **Azure Active Directory**.
3. In the left navigation menu, select **App registrations**.
4. Click **+ New registration**.
5. Enter a name for your application (e.g., "MCP Outlook").
6. For **Supported account types**, select **Accounts in this organizational directory only**.
7. Leave the **Redirect URI** blank (we won't be using it for this application).
8. Click **Register**.

Make note of the following values shown on the overview page:
- **Application (client) ID**
- **Directory (tenant) ID**

These will be needed for your `.env` file.

## Step 2: Create a Client Secret

1. In your newly registered app, go to **Certificates & secrets** in the left menu.
2. Under **Client secrets**, click **+ New client secret**.
3. Add a description and select an expiration period.
4. Click **Add**.
5. **IMPORTANT**: Make sure to copy the **Value** of the secret immediately. You won't be able to see it again after leaving this page.

This is your **CLIENT_SECRET** for the `.env` file.

## Step 3: Configure API Permissions

1. In your app registration, go to **API permissions** in the left menu.
2. Click **+ Add a permission**.
3. Select **Microsoft Graph**.
4. Select **Application permissions** (not Delegated permissions).
5. Add the following permissions:
   - `Mail.Read` (Read mail in all mailboxes)
   - `Mail.ReadWrite` (Read and write mail in all mailboxes)
   - `Mail.Send` (Send mail as any user)
   - `MailboxSettings.Read` (Read all user mailbox settings)
   - `User.Read.All` (Read all users' full profiles)

6. Click **Add permissions**.
7. Click **Grant admin consent for [Your Organization]**. You need to be an administrator to complete this step.

## Step 4: Configure the Application

Create a `.env` file in the root directory of the project with the following content:

```
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```

Replace the placeholders with the values you noted earlier.

## Step 5: Test the Connection

Run the authentication test command to verify your setup:

```
npm run test-auth -- -u user@yourdomain.com
```

You should see a message indicating successful authentication.

## Troubleshooting

### Authentication Failed Error

If you receive an authentication error, check the following:

1. Verify that your `.env` file contains the correct values for TENANT_ID, CLIENT_ID, and CLIENT_SECRET.
2. Ensure that admin consent has been granted for the API permissions.
3. Confirm that the user email you're using belongs to your Azure AD tenant.
4. Check that your client secret hasn't expired.

### Permission Issues

If you encounter permission-related errors:

1. Verify that all required API permissions have been added.
2. Ensure that admin consent has been granted for all permissions.
3. Try restarting the application after changing permissions, as changes may take some time to propagate.

### Certificate Errors

If you encounter certificate validation errors:

1. Ensure your system's time is correct.
2. Check that your system's root certificates are up to date.

## Additional Resources

- [Microsoft Graph Auth Overview](https://docs.microsoft.com/en-us/graph/auth/auth-concepts)
- [Microsoft Graph Mail API Reference](https://docs.microsoft.com/en-us/graph/api/resources/mail-api-overview)
- [Azure AD Application Authentication](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-authentication)