#!/bin/bash

# Test script for MCP Outlook CLI
# This script tests all CLI commands including the new features

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the email from .env file or use default
if [ -f .env ]; then
  source .env
  USER_EMAIL=${USER_EMAIL:-$DEFAULT_USER_EMAIL}
else
  USER_EMAIL=${USER_EMAIL:-"your-email@example.com"}
  echo -e "${YELLOW}Warning: No .env file found. Using default email: $USER_EMAIL${NC}"
  echo -e "${YELLOW}Please set USER_EMAIL in your shell or create a .env file with USER_EMAIL for testing.${NC}"
fi

# Create a temporary directory for test outputs
TEST_DIR="./test-output"
mkdir -p $TEST_DIR

# Test function to run a command and check exit code
test_command() {
  local name=$1
  local cmd=$2
  
  echo -e "\n${BLUE}Testing: $name${NC}"
  echo -e "Command: $cmd\n"
  
  eval $cmd
  local exit_code=$?
  
  if [ $exit_code -eq 0 ]; then
    echo -e "\n${GREEN}✓ Test passed: $name${NC}"
  else
    echo -e "\n${RED}✗ Test failed: $name (Exit code: $exit_code)${NC}"
  fi
  
  # Add a separator
  echo -e "\n-----------------------------------------------------"
  
  return $exit_code
}

# Print section header
section() {
  echo -e "\n\n${BLUE}===================================================${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}===================================================${NC}\n"
}

# Start testing
echo -e "${BLUE}Starting MCP Outlook CLI Tests${NC}"
echo -e "${BLUE}User email: $USER_EMAIL${NC}"
echo -e "${BLUE}Test directory: $TEST_DIR${NC}"
echo -e "${BLUE}==================================================${NC}\n"

# Authentication Test
section "Authentication Tests"
test_command "Test Authentication" "node dist/index.js test-auth -u $USER_EMAIL"

# Folder Tests
section "Folder Tests"
test_command "List Folders" "node dist/index.js list-folders -u $USER_EMAIL"

# Create a test folder with timestamp to avoid conflicts
TEST_FOLDER="CLI-Test-$(date +%s)"
test_command "Create Folder" "node dist/index.js create-folder \"$TEST_FOLDER\" -u $USER_EMAIL"

# Get the folder ID for the test folder (this will be used in other tests)
echo "Getting folder ID for test folder..."
FOLDER_DATA=$(node dist/index.js list-folders -u $USER_EMAIL | grep -A 1 "$TEST_FOLDER")
FOLDER_ID=$(echo "$FOLDER_DATA" | grep "ID:" | awk '{print $2}')

if [ -z "$FOLDER_ID" ]; then
  echo -e "${RED}Failed to get folder ID for test folder. Some tests may fail.${NC}"
else
  echo -e "${GREEN}Using folder ID: $FOLDER_ID${NC}"
fi

test_command "List Child Folders" "node dist/index.js list-child-folders \"/Inbox\" -u $USER_EMAIL"
test_command "Rename Folder" "node dist/index.js rename-folder \"/$TEST_FOLDER\" \"$TEST_FOLDER-Renamed\" -u $USER_EMAIL"

# Email Tests
section "Email Tests"
test_command "List Emails" "node dist/index.js list-emails \"/Inbox\" -u $USER_EMAIL --limit 5"
test_command "List Emails with Date Filter" "node dist/index.js list-emails \"/Inbox\" -u $USER_EMAIL --limit 5 --previous 7 --unit days"
test_command "List Emails with Search" "node dist/index.js list-emails \"/Inbox\" -u $USER_EMAIL --limit 5 --search \"test\""
test_command "List Emails with Sort" "node dist/index.js list-emails \"/Inbox\" -u $USER_EMAIL --limit 5 --sort-by subject --sort-order asc"
test_command "List Emails with Bodies" "node dist/index.js list-emails \"/Inbox\" -u $USER_EMAIL --limit 2 --include-bodies"

# Get the first email ID for testing
echo "Getting email ID from inbox for testing..."
EMAIL_DATA=$(node dist/index.js list-emails "/Inbox" -u $USER_EMAIL --limit 1)
EMAIL_ID=$(echo "$EMAIL_DATA" | grep "ID:" | head -1 | awk '{print $2}')

if [ -z "$EMAIL_ID" ]; then
  echo -e "${RED}Failed to get email ID from inbox. Some tests may fail.${NC}"
else
  echo -e "${GREEN}Using email ID: $EMAIL_ID${NC}"
  
  test_command "Read Email" "node dist/index.js read-email $EMAIL_ID -u $USER_EMAIL"
  
  # Check if the email has attachments
  HAS_ATTACHMENTS=$(echo "$EMAIL_DATA" | grep "Has Attachments")
  
  if [[ ! -z "$HAS_ATTACHMENTS" ]]; then
    echo -e "${GREEN}Email has attachments. Testing attachment commands...${NC}"
    
    # Attachment Tests
    section "Attachment Tests"
    test_command "List Attachments" "node dist/index.js list-attachments $EMAIL_ID -u $USER_EMAIL"
    
    # Get the first attachment ID for testing
    ATTACHMENT_DATA=$(node dist/index.js list-attachments $EMAIL_ID -u $USER_EMAIL)
    ATTACHMENT_ID=$(echo "$ATTACHMENT_DATA" | grep "ID:" | head -1 | awk '{print $2}')
    
    if [ -z "$ATTACHMENT_ID" ]; then
      echo -e "${RED}Failed to get attachment ID. Download test will be skipped.${NC}"
    else
      echo -e "${GREEN}Using attachment ID: $ATTACHMENT_ID${NC}"
      test_command "Download Attachment" "node dist/index.js download-attachment $EMAIL_ID $ATTACHMENT_ID -u $USER_EMAIL -o $TEST_DIR/test-attachment"
    fi
  else
    echo -e "${YELLOW}Email has no attachments. Skipping attachment tests.${NC}"
  fi
  
  # Email movement tests
  if [ ! -z "$FOLDER_ID" ]; then
    echo "Testing email copy..."
    test_command "Copy Email" "node dist/index.js copy-email $EMAIL_ID \"/$TEST_FOLDER-Renamed\" -u $USER_EMAIL"
  fi
fi

# Draft Tests
section "Draft Tests"
test_command "List Drafts" "node dist/index.js list-drafts -u $USER_EMAIL"

# Create a test draft
echo "Creating test draft..."
DRAFT_RESULT=$(node dist/index.js create-draft -u $USER_EMAIL -s "Test Draft $(date +%s)" -t "$USER_EMAIL" -m "This is a test draft created by the test script.")
echo "$DRAFT_RESULT"
DRAFT_ID=$(echo "$DRAFT_RESULT" | grep -o "ID: [a-zA-Z0-9=]*" | awk '{print $2}')

if [ -z "$DRAFT_ID" ]; then
  echo -e "${RED}Failed to create test draft. Draft tests will be skipped.${NC}"
else
  echo -e "${GREEN}Created test draft with ID: $DRAFT_ID${NC}"
  
  test_command "Get Draft" "node dist/index.js get-draft $DRAFT_ID -u $USER_EMAIL"
  test_command "Update Draft" "node dist/index.js update-draft $DRAFT_ID -u $USER_EMAIL -s \"Updated Test Draft\""
  
  # Don't actually send the draft in automated testing
  echo -e "${YELLOW}Skipping 'send-draft' test to avoid sending actual emails${NC}"
  # test_command "Send Draft" "node dist/index.js send-draft $DRAFT_ID -u $USER_EMAIL"
  
  test_command "Delete Draft" "node dist/index.js delete-draft $DRAFT_ID -u $USER_EMAIL"
fi

# Calendar Tests
section "Calendar Tests"
test_command "List Calendars" "node dist/index.js list-calendars -u $USER_EMAIL"

# Get the current date and time in ISO format
START_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S")
# Add one hour to get the end date
END_DATE=$(date -u -v+1H +"%Y-%m-%dT%H:%M:%S" 2>/dev/null || date -u -d "+1 hour" +"%Y-%m-%dT%H:%M:%S")

test_command "List Events" "node dist/index.js list-events -u $USER_EMAIL"
test_command "List Events with Date Range" "node dist/index.js list-events -u $USER_EMAIL --start \"$START_DATE\" --end \"$END_DATE\""

# Create test event - one week in the future to avoid conflicts
FUTURE_START=$(date -u -v+7d +"%Y-%m-%dT10:00:00" 2>/dev/null || date -u -d "+7 days 10:00:00" +"%Y-%m-%dT%H:%M:%S")
FUTURE_END=$(date -u -v+7d +"%Y-%m-%dT11:00:00" 2>/dev/null || date -u -d "+7 days 11:00:00" +"%Y-%m-%dT%H:%M:%S")
EVENT_SUBJECT="Test Event $(date +%s)"

echo "Creating test event..."
EVENT_RESULT=$(node dist/index.js create-event -u $USER_EMAIL -s "$EVENT_SUBJECT" --start "$FUTURE_START" --end "$FUTURE_END" --time-zone "UTC" --location "Test Location" --body "This is a test event.")
echo "$EVENT_RESULT"
EVENT_ID=$(echo "$EVENT_RESULT" | grep -o "ID: [a-zA-Z0-9=]*" | awk '{print $2}')

if [ -z "$EVENT_ID" ]; then
  echo -e "${RED}Failed to create test event. Event tests will be skipped.${NC}"
else
  echo -e "${GREEN}Created test event with ID: $EVENT_ID${NC}"
  
  test_command "Get Event" "node dist/index.js get-event $EVENT_ID -u $USER_EMAIL"
  test_command "Update Event" "node dist/index.js update-event $EVENT_ID -u $USER_EMAIL -s \"Updated $EVENT_SUBJECT\""
  test_command "Delete Event" "node dist/index.js delete-event $EVENT_ID -u $USER_EMAIL"
fi

# Clean up
section "Cleanup"
# Delete test folder if it exists
if [ ! -z "$FOLDER_ID" ]; then
  test_command "Delete Test Folder" "node dist/index.js delete-folder \"/$TEST_FOLDER-Renamed\" -u $USER_EMAIL"
fi

# Final summary
section "Test Summary"
echo -e "${BLUE}MCP Outlook CLI Tests completed.${NC}"
echo -e "${BLUE}Test output is available in: $TEST_DIR${NC}"

# Clean up test directory if empty
if [ -z "$(ls -A $TEST_DIR)" ]; then
  rmdir $TEST_DIR
  echo -e "${BLUE}Removed empty test directory.${NC}"
fi

exit 0
