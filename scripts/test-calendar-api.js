/**
 * Calendar API Test Script
 * 
 * This script tests Microsoft Graph API calendar endpoints to help diagnose
 * permission issues and API access problems.
 * 
 * Usage:
 *   1. Make sure your environment variables are set:
 *      TENANT_ID, CLIENT_ID, CLIENT_SECRET
 *   2. Run with: node test-calendar-api.js user@example.com
 */

const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
require('isomorphic-fetch');
require('dotenv').config();

// Get user email from command line
const userEmail = process.argv[2];
if (!userEmail) {
  console.error('Usage: node test-calendar-api.js user@example.com');
  process.exit(1);
}

async function main() {
  // Get credentials from env vars
  const tenantId = process.env.TENANT_ID;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  
  if (!tenantId || !clientId || !clientSecret) {
    console.error('Missing required environment variables: TENANT_ID, CLIENT_ID, CLIENT_SECRET');
    process.exit(1);
  }
  
  console.log(`Testing calendar access for user: ${userEmail}`);
  console.log('Credentials loaded from environment variables');
  
  // Create credential
  const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret
  );
  
  // Auth provider with default scope
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
  });
  
  // Graph client
  const client = Client.initWithMiddleware({
    authProvider: authProvider
  });
  
  // Function to test an API endpoint
  async function testEndpoint(description, endpoint, query = '') {
    try {
      console.log(`\nTesting: ${description}`);
      console.log(`Endpoint: ${endpoint}${query}`);
      
      const result = await client.api(endpoint).get();
      
      console.log('✅ SUCCESS!');
      console.log(`Result: Found ${result.value ? result.value.length : 1} item(s)`);
      return true;
    } catch (error) {
      console.log('❌ ERROR:');
      console.log(`Status: ${error.statusCode || 'Unknown'}`);
      console.log(`Code: ${error.code || 'Unknown'}`);
      console.log(`Message: ${error.message || 'Unknown error'}`);
      return false;
    }
  }
  
  // Function to test calendar endpoints with different variations
  async function testCalendarEndpoints() {
    console.log('\n=== COMPARING MAIL vs CALENDAR ACCESS ===');
    
    // First test something we know works (mail folders)
    const mailWorks = await testEndpoint(
      'Mail Folders (baseline test)',
      `/users/${userEmail}/mailFolders`
    );
    
    if (!mailWorks) {
      console.error('\n❌ Baseline mail test failed. Auth issue likely.');
      return;
    }
    
    // Standard calendar endpoints
    await testEndpoint(
      'Calendar (singular)',
      `/users/${userEmail}/calendar`
    );
    
    await testEndpoint(
      'Calendars (plural)',
      `/users/${userEmail}/calendars`
    );
    
    await testEndpoint(
      'Calendar Events',
      `/users/${userEmail}/calendar/events`
    );
    
    await testEndpoint(
      'Calendar View',
      `/users/${userEmail}/calendarView`,
      '?startDateTime=2025-01-01T00:00:00Z&endDateTime=2025-12-31T00:00:00Z'
    );
    
    // Try beta endpoint
    console.log('\n=== TESTING BETA ENDPOINTS ===');
    
    const betaClient = Client.initWithMiddleware({
      authProvider: authProvider,
      baseUrl: 'https://graph.microsoft.com/beta'
    });
    
    try {
      console.log('\nTesting: Beta Calendars Endpoint');
      console.log(`Endpoint: /users/${userEmail}/calendars`);
      
      const result = await betaClient.api(`/users/${userEmail}/calendars`).get();
      
      console.log('✅ SUCCESS with beta endpoint!');
      console.log(`Result: Found ${result.value ? result.value.length : 1} item(s)`);
    } catch (error) {
      console.log('❌ ERROR with beta endpoint:');
      console.log(`Status: ${error.statusCode || 'Unknown'}`);
      console.log(`Code: ${error.code || 'Unknown'}`);
      console.log(`Message: ${error.message || 'Unknown error'}`);
    }
  }
  
  // Run tests
  await testCalendarEndpoints();
  
  console.log('\n=== TESTING SCOPES ===');
  
  // Try with explicit calendar scopes
  const authProviderWithCalendarScopes = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/Calendars.Read']
  });
  
  const clientWithCalendarScopes = Client.initWithMiddleware({
    authProvider: authProviderWithCalendarScopes
  });
  
  try {
    console.log('\nTesting with explicit Calendar.Read scope');
    console.log(`Endpoint: /users/${userEmail}/calendars`);
    
    const result = await clientWithCalendarScopes.api(`/users/${userEmail}/calendars`).get();
    
    console.log('✅ SUCCESS with explicit scope!');
    console.log(`Result: Found ${result.value ? result.value.length : 1} item(s)`);
  } catch (error) {
    console.log('❌ ERROR with explicit scope:');
    console.log(`Status: ${error.statusCode || 'Unknown'}`);
    console.log(`Code: ${error.code || 'Unknown'}`);
    console.log(`Message: ${error.message || 'Unknown error'}`);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Compare the success/failure of different endpoints to diagnose the issue.');
  console.log('If mail endpoints work but calendar endpoints fail, it\'s likely a permission issue.');
  console.log('If beta endpoints work but v1.0 endpoints fail, it might be an API version issue.');
  console.log('If explicit scopes work but .default doesn\'t, you might need to adjust the auth provider.');
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});