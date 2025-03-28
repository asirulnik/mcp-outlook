# MCP Outlook TODO List

This document outlines the immediate next steps for the MCP Outlook project. Developers should focus on these tasks in the given order.

## High Priority

1. **Fix Search Functionality**
   - [ ] Resolve the issue with the `--fields` parameter in search queries
   - [ ] Improve error handling for search edge cases
   - [ ] Add support for more complex search queries

2. **Complete MCP Integration**
   - [ ] Integrate CLI functionality with MCP server
   - [ ] Ensure all CLI commands have equivalent MCP tools
   - [ ] Test MCP integration with Claude Desktop

3. **Begin Code Modularization**
   - [ ] Define interfaces for core services (see MODULARIZATION_PLAN.md)
   - [ ] Extract models into separate files
   - [ ] Break down mailService.ts into smaller, focused modules

## Medium Priority

4. **Improve Error Handling**
   - [ ] Add more descriptive error messages
   - [ ] Implement proper error classification
   - [ ] Add error recovery strategies where possible

5. **Add Testing**
   - [ ] Set up a testing framework (Jest recommended)
   - [ ] Write unit tests for core functionality
   - [ ] Add integration tests for end-to-end flows

6. **Enhance Documentation**
   - [ ] Add JSDoc comments to all functions and classes
   - [ ] Create API reference documentation
   - [ ] Document common usage patterns

## Low Priority

7. **Performance Optimization**
   - [ ] Implement caching for frequently accessed data
   - [ ] Optimize folder path resolution
   - [ ] Reduce API calls where possible

8. **Add New Features**
   - [ ] Support for attachments (upload/download)
   - [ ] Calendar integration
   - [ ] Contact management

9. **User Experience Improvements**
   - [ ] Colorize CLI output
   - [ ] Add progress indicators for long-running operations
   - [ ] Implement interactive mode

## Getting Started

If you're new to the project, consider starting with:

1. Familiarize yourself with the codebase by reading the developer documentation
2. Run the tests to ensure everything is working properly
3. Pick a small, well-defined task from the high-priority list
4. Make incremental changes and test frequently

## Resources

- See DEVELOPER_GUIDE.md for an overview of the codebase
- Check MODULARIZATION_PLAN.md for the long-term architecture vision
- Refer to TROUBLESHOOTING.md for common issues and solutions
