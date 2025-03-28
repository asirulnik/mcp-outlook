import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import 'isomorphic-fetch';
import * as dotenv from 'dotenv';
import { IAuthService } from './interfaces';
import { AuthenticationError, ValidationError } from '../utils/errors';

// Load environment variables
dotenv.config();

/**
 * Service that handles authentication with Microsoft Graph API
 */
export class AuthService implements IAuthService {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;
  private client: Client | null = null;

  constructor() {
    // Get auth details from environment variables
    this.tenantId = process.env.TENANT_ID || '';
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';

    // Make sure all required parameters are present
    if (!this.tenantId || !this.clientId || !this.clientSecret) {
      const missingVars = [];
      if (!this.tenantId) missingVars.push('TENANT_ID');
      if (!this.clientId) missingVars.push('CLIENT_ID');
      if (!this.clientSecret) missingVars.push('CLIENT_SECRET');
      
      throw new ValidationError(`Missing required environment variables: ${missingVars.join(', ')}. Check your .env file.`);
    }
  }

  /**
   * Get an authenticated Microsoft Graph client
   * @returns Microsoft Graph client
   */
  getClient(): Client {
    // Return cached client if it exists
    if (this.client) {
      return this.client;
    }

    try {
      // Create the ClientSecretCredential
      const credential = new ClientSecretCredential(
        this.tenantId,
        this.clientId,
        this.clientSecret
      );

      // Create an authentication provider using the credential
      const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default']
      });

      // Initialize the Graph client
      this.client = Client.initWithMiddleware({
        authProvider: authProvider,
      });

      return this.client;
    } catch (error) {
      console.error('Error initializing Microsoft Graph client:', error);
      throw new AuthenticationError(
        `Failed to initialize Graph client: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Export a singleton instance for convenience
export const authService = new AuthService();
