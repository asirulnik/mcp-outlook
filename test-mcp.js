/**
 * Test Script for MCP Outlook Server
 * 
 * This script tests the MCP server functionality by sending commands to the server
 * and verifying the responses.
 * 
 * Prerequisites:
 * 1. Build the application: npm run build
 * 2. Configure .env file with Microsoft Graph API credentials
 * 
 * Usage:
 *   node test-mcp.js user@example.com
 * 
 * Where:
 *   user@example.com - The user email to test with
 */

const { spawn } = require('child_process');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

// Check if email is provided
if (process.argv.length < 3) {
  console.error('Please provide a user email as the first argument');
  console.error('Usage: node test-mcp.js user@example.com');
  process.exit(1);
}

const userEmail = process.argv[2];
const testFolderName = `MCP-Server-Test-${Math.floor(Date.now() / 1000)}`;
console.log(`Starting MCP server test with user: ${userEmail}`);
console.log(`Test folder name: ${testFolderName}`);

// Spawn the MCP server process
const serverProcess = spawn('node', ['dist/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

const stdinStream = serverProcess.stdin;
const stdoutStream = serverProcess.stdout;
const stderrStream = serverProcess.stderr;

// Create a readline interface to read the server output line by line
const rl = readline.createInterface({
  input: stdoutStream,
  terminal: false
});

// Handle server errors
serverProcess.on('error', (error) => {
  console.error(`Error starting server: ${error.message}`);
  process.exit(1);
});

// Handle server exit
serverProcess.on('exit', (code, signal) => {
  console.log(`Server process exited with code ${code} and signal ${signal}`);
});

// Handle stderr output
stderrStream.on('data', (data) => {
  console.error(`Server error: ${data.toString()}`);
});

// Store process IDs for tracking responses
const pendingRequests = new Map();
let folderId = null;
let emailId = null;

// Function to send an MCP request
function sendRequest(method, params) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    
    // Store the promise handlers to be resolved when response is received
    pendingRequests.set(id, { resolve, reject });
    
    // Send the request to the server
    stdinStream.write(JSON.stringify(request) + '\n');
    console.log(`Sent request: ${method} (ID: ${id})`);
  });
}

// Process server output
rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    
    // Handle response messages
    if (message.id && pendingRequests.has(message.id)) {
      const { resolve, reject } = pendingRequests.get(message.id);
      pendingRequests.delete(message.id);
      
      if (message.error) {
        console.error(`Error in response: ${JSON.stringify(message.error)}`);
        reject(message.error);
      } else {
        resolve(message.result);
      }
    }
    // Handle notification messages (log, progress, etc.)
    else if (message.method && message.method.startsWith('notifications/')) {
      console.log(`Notification received: ${message.method}`);
      if (message.params && message.params.data) {
        console.log(`Data: ${JSON.stringify(message.params.data)}`);
      }
    }
  } catch (error) {
    console.error(`Error processing server output: ${error.message}`);
    console.error(`Raw output: ${line}`);
  }
});

// Main test sequence
async function runTests() {
  try {
    console.log('========== Starting MCP Server Tests ==========');
    
    // Test 1: List mail folders
    console.log('\n--- Test 1: List mail folders ---');
    const folders = await sendRequest('tools/invoke', {
      name: 'list-mail-folders',
      arguments: { userEmail }
    });
    console.log(`Folders fetched: ${folders.content[0].text.substring(0, 100)}...`);
    
    // Test 2: Create a test folder
    console.log('\n--- Test 2: Create a test folder ---');
    const createFolderResult = await sendRequest('tools/invoke', {
      name: 'create-folder',
      arguments: {
        userEmail,
        displayName: testFolderName,
        isHidden: false
      }
    });
    const createdFolder = JSON.parse(createFolderResult.content[0].text);
    folderId = createdFolder.id;
    console.log(`Test folder created with ID: ${folderId}`);
    
    // Test 3: Create a subfolder
    console.log('\n--- Test 3: Create a subfolder ---');
    const createSubfolderResult = await sendRequest('tools/invoke', {
      name: 'create-folder',
      arguments: {
        userEmail,
        displayName: 'MCP-Subfolder',
        isHidden: false,
        parentFolderId: folderId
      }
    });
    const createdSubfolder = JSON.parse(createSubfolderResult.content[0].text);
    const subfolderId = createdSubfolder.id;
    console.log(`Subfolder created with ID: ${subfolderId}`);
    
    // Test 4: List child folders
    console.log('\n--- Test 4: List child folders ---');
    const childFolders = await sendRequest('tools/invoke', {
      name: 'list-child-folders',
      arguments: {
        userEmail,
        folderId
      }
    });
    console.log(`Child folders: ${childFolders.content[0].text}`);
    
    // Test 5: Create a draft email
    console.log('\n--- Test 5: Create a draft email ---');
    const createDraftResult = await sendRequest('tools/invoke', {
      name: 'create-draft',
      arguments: {
        userEmail,
        subject: 'Test Email from MCP Server',
        body: 'This is a test email created by the MCP Server test script.',
        isHtml: false,
        to: [userEmail]
      }
    });
    const draftResultText = createDraftResult.content[0].text;
    const draftIdMatch = draftResultText.match(/ID: ([a-zA-Z0-9+=_-]+)/);
    if (draftIdMatch) {
      emailId = draftIdMatch[1];
      console.log(`Draft email created with ID: ${emailId}`);
    } else {
      console.log(`Draft created: ${draftResultText}`);
    }
    
    // Test 6: List emails in Drafts folder
    console.log('\n--- Test 6: List emails in Drafts folder ---');
    // We need to find the Drafts folder ID first
    const allFolders = JSON.parse(folders.content[0].text);
    const draftsFolderId = allFolders.find(f => f.displayName === 'Drafts')?.id;
    
    if (draftsFolderId) {
      const drafts = await sendRequest('tools/invoke', {
        name: 'list-emails',
        arguments: {
          userEmail,
          folderId: draftsFolderId,
          limit: 5
        }
      });
      console.log(`Drafts fetched: ${drafts.content[0].text.substring(0, 100)}...`);
    } else {
      console.log('Could not find Drafts folder ID');
    }
    
    // Test 7: Read a specific email
    if (emailId) {
      console.log('\n--- Test 7: Read a specific email ---');
      const email = await sendRequest('tools/invoke', {
        name: 'read-email',
        arguments: {
          userEmail,
          emailId,
          convertHtmlToText: true,
          hideQuotedContent: false
        }
      });
      console.log(`Email content: ${email.content[0].text.substring(0, 100)}...`);
    }
    
    // Test 8: Convert HTML to text
    console.log('\n--- Test 8: Convert HTML to text ---');
    const htmlContent = `<html><body><h1>Test Heading</h1><p>This is a <b>test</b> paragraph.</p><ul><li>Item 1</li><li>Item 2</li></ul></body></html>`;
    const htmlToText = await sendRequest('tools/invoke', {
      name: 'convert-html-to-text',
      arguments: {
        html: htmlContent,
        options: {
          wordwrap: 80,
          preserveNewlines: true,
          preserveHrefLinks: true
        }
      }
    });
    console.log(`Converted text: ${htmlToText.content[0].text}`);
    
    // Test 9: Update folder name
    console.log('\n--- Test 9: Update folder name ---');
    const updateFolderResult = await sendRequest('tools/invoke', {
      name: 'update-folder',
      arguments: {
        userEmail,
        folderId,
        displayName: `${testFolderName}-Updated`
      }
    });
    console.log(`Folder updated: ${updateFolderResult.content[0].text.substring(0, 100)}...`);
    
    console.log('\n========== All tests completed successfully ==========');
    console.log(`Test folder created: ${testFolderName}-Updated`);
    if (emailId) {
      console.log(`Draft email created with ID: ${emailId}`);
    }
    console.log('\nNote: You may want to manually delete these test items.');
    
  } catch (error) {
    console.error(`Test failed: ${error}`);
  } finally {
    // Clean up
    console.log('\nClosing MCP server...');
    serverProcess.kill();
    process.exit(0);
  }
}

// Wait for server initialization before running tests
setTimeout(() => {
  runTests().catch(error => {
    console.error(`Error in test sequence: ${error.message}`);
    serverProcess.kill();
    process.exit(1);
  });
}, 2000);
