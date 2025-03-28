import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import 'isomorphic-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

// Get auth details from environment variables
const tenantId = process.env.TENANT_ID || '';
const clientId = process.env.CLIENT_ID || '';
const clientSecret = process.env.CLIENT_SECRET || '';

// Make sure all required parameters are present
if (!tenantId || !clientId || !clientSecret) {
  throw new Error('Missing required environment variables. Check your .env file.');
}

// Create a Microsoft Graph client using client credentials
export function getGraphClient(): Client {
  // Create the ClientSecretCredential
  const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret
  );

  // Create an authentication provider using the credential
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
  });

  // Initialize the Graph client
  const graphClient = Client.initWithMiddleware({
    authProvider: authProvider,
  });

  return graphClient;
}
