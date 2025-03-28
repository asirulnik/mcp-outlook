#!/bin/bash

# Test Script for MCP Outlook CLI
# This script tests various CLI commands for the MCP Outlook server
# Before running this script, ensure you have:
# 1. Built the application (npm run build)
# 2. Configured your .env file with Microsoft Graph API credentials

set -e # Exit on any error

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# User email to test with
if [ -z "$1" ]; then
  echo -e "${YELLOW}Please provide a user email as the first argument${NC}"
  echo "Usage: ./test-cli.sh user@example.com"
  exit 1
fi

USER_EMAIL="$1"
TEST_FOLDER_NAME="MCP-CLI-Test-$(date +%s)"

echo -e "${YELLOW}====== MCP Outlook CLI Test ======${NC}"
echo "Testing with user: $USER_EMAIL"
echo "Test folder name: $TEST_FOLDER_NAME"
echo

# Function to run a command and display its output
run_cmd() {
  local cmd="$1"
  local description="$2"
  
  echo -e "${YELLOW}Testing: ${description}${NC}"
  echo "> $cmd"
  
  if eval "$cmd"; then
    echo -e "${GREEN}✓ Test passed${NC}"
  else
    echo -e "${RED}✗ Test failed${NC}"
    exit 1
  fi
  echo
}

# 1. Test Authentication
run_cmd "node dist/index.js test-auth -u $USER_EMAIL" "Authentication"

# 2. List top-level folders
run_cmd "node dist/index.js list-folders -u $USER_EMAIL" "List top-level folders"

# 3. Create a test folder
run_cmd "node dist/index.js create-folder \"$TEST_FOLDER_NAME\" -u $USER_EMAIL" "Create a test folder"

# 4. Capture folder ID for the created folder (will be used in subsequent commands)
echo -e "${YELLOW}Getting folder ID for the test folder...${NC}"
FOLDER_INFO=$(node dist/index.js list-folders -u $USER_EMAIL | grep -B 2 -A 2 "$TEST_FOLDER_NAME")
echo "$FOLDER_INFO"

# Check if ID was found in the folder info
if [[ "$FOLDER_INFO" =~ ID:\ ([a-zA-Z0-9+=_-]+) ]]; then
  FOLDER_ID="${BASH_REMATCH[1]}"
  echo -e "${GREEN}Found folder ID: $FOLDER_ID${NC}"
else
  echo -e "${RED}Could not find folder ID${NC}"
  exit 1
fi
echo

# 5. Create a subfolder
run_cmd "node dist/index.js create-folder \"Subfolder\" -u $USER_EMAIL -p \"/$TEST_FOLDER_NAME\"" "Create a subfolder"

# 6. List child folders
run_cmd "node dist/index.js list-child-folders \"/$TEST_FOLDER_NAME\" -u $USER_EMAIL" "List child folders"

# 7. Rename the subfolder
run_cmd "node dist/index.js rename-folder \"/$TEST_FOLDER_NAME/Subfolder\" \"Renamed-Subfolder\" -u $USER_EMAIL" "Rename subfolder"

# 8. Create a draft email
echo -e "${YELLOW}Testing: Create a draft email${NC}"
CMD="node dist/index.js create-draft -u $USER_EMAIL -s \"Test Email from MCP CLI\" -t \"$USER_EMAIL\" -m \"This is a test email created by the MCP Outlook CLI test script.\""
echo "> $CMD"

# Execute the command and capture the output to extract the email ID
DRAFT_OUTPUT=$(eval "$CMD")
echo "$DRAFT_OUTPUT"

# Extract the email ID from the output
if [[ "$DRAFT_OUTPUT" =~ ID:\ ([a-zA-Z0-9+=_-]+) ]]; then
  EMAIL_ID="${BASH_REMATCH[1]}"
  echo -e "${GREEN}✓ Draft created with ID: $EMAIL_ID${NC}"
else
  echo -e "${RED}✗ Could not extract email ID${NC}"
  exit 1
fi
echo

# 9. List emails in Drafts folder
run_cmd "node dist/index.js list-emails \"/Drafts\" -u $USER_EMAIL --limit 5" "List emails in Drafts folder"

# 10. Read the created draft email
if [ -n "$EMAIL_ID" ]; then
  run_cmd "node dist/index.js read-email $EMAIL_ID -u $USER_EMAIL" "Read draft email"
fi

# 11. Test HTML to text conversion (using a simple HTML string)
echo -e "${YELLOW}Testing: Convert HTML to text${NC}"
HTML="<html><body><h1>Test Heading</h1><p>This is a <b>test</b> paragraph.</p><ul><li>Item 1</li><li>Item 2</li></ul></body></html>"
CMD="echo '$HTML' | node dist/index.js convert-html"
echo "> $CMD"

if eval "$CMD"; then
  echo -e "${GREEN}✓ Test passed${NC}"
else
  echo -e "${RED}✗ Test failed${NC}"
  exit 1
fi
echo

# 12. Test search functionality
run_cmd "node dist/index.js list-emails \"/Drafts\" -u $USER_EMAIL --search \"Test Email from MCP CLI\"" "Search for emails"

# Final report
echo -e "${GREEN}====== All tests completed successfully ======${NC}"
echo "Test folder created: $TEST_FOLDER_NAME"
echo "Draft email created with ID: $EMAIL_ID"
echo
echo -e "${YELLOW}Note: You may want to manually delete these test items.${NC}"
