"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const identity_1 = require("@azure/identity");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const azureTokenCredentials_1 = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
require("isomorphic-fetch");
const dotenv = __importStar(require("dotenv"));
const errors_1 = require("../utils/errors");
// Load environment variables
dotenv.config();
/**
 * Service that handles authentication with Microsoft Graph API
 */
class AuthService {
    constructor() {
        this.client = null;
        // Get auth details from environment variables
        this.tenantId = process.env.TENANT_ID || '';
        this.clientId = process.env.CLIENT_ID || '';
        this.clientSecret = process.env.CLIENT_SECRET || '';
        // Make sure all required parameters are present
        if (!this.tenantId || !this.clientId || !this.clientSecret) {
            const missingVars = [];
            if (!this.tenantId)
                missingVars.push('TENANT_ID');
            if (!this.clientId)
                missingVars.push('CLIENT_ID');
            if (!this.clientSecret)
                missingVars.push('CLIENT_SECRET');
            throw new errors_1.ValidationError(`Missing required environment variables: ${missingVars.join(', ')}. Check your .env file.`);
        }
    }
    /**
     * Get an authenticated Microsoft Graph client
     * @returns Microsoft Graph client
     */
    getClient() {
        // Return cached client if it exists
        if (this.client) {
            return this.client;
        }
        try {
            // Create the ClientSecretCredential
            const credential = new identity_1.ClientSecretCredential(this.tenantId, this.clientId, this.clientSecret);
            // Create an authentication provider using the credential
            const authProvider = new azureTokenCredentials_1.TokenCredentialAuthenticationProvider(credential, {
                scopes: ['https://graph.microsoft.com/.default']
            });
            // Initialize the Graph client
            this.client = microsoft_graph_client_1.Client.initWithMiddleware({
                authProvider: authProvider,
            });
            return this.client;
        }
        catch (error) {
            console.error('Error initializing Microsoft Graph client:', error);
            throw new errors_1.AuthenticationError(`Failed to initialize Graph client: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.AuthService = AuthService;
// Export a singleton instance for convenience
exports.authService = new AuthService();
