#!/bin/bash

# Master Test Script for MCP Outlook
# This script runs both CLI and MCP server tests

set -e # Exit on any error

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if email is provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Please provide a user email as the first argument${NC}"
  echo "Usage: ./run-tests.sh user@example.com"
  exit 1
fi

USER_EMAIL="$1"

echo -e "${YELLOW}====== MCP Outlook Test Suite ======${NC}"
echo "Testing with user: $USER_EMAIL"
echo

# Make sure the test scripts are executable
chmod +x test-cli.sh

# Ensure the required dependencies are installed
echo -e "${YELLOW}Checking dependencies...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js.${NC}"
  exit 1
fi

if ! npm list uuid &> /dev/null; then
  echo -e "${YELLOW}Installing uuid package for MCP server test...${NC}"
  npm install uuid
fi

# Build the application if not already built
echo -e "${YELLOW}Building the application...${NC}"
npm run build

# Run CLI tests
echo -e "\n${YELLOW}====== Running CLI Tests ======${NC}"
./test-cli.sh "$USER_EMAIL"

# Run MCP server tests
echo -e "\n${YELLOW}====== Running MCP Server Tests ======${NC}"
node test-mcp.js "$USER_EMAIL"

echo -e "\n${GREEN}====== All tests completed successfully ======${NC}"
