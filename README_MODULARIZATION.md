# MCP Outlook Server - Modularized Implementation

## Overview

This repository contains a modularized implementation of the MCP Outlook Server. It provides both a command-line interface (CLI) and Model Context Protocol (MCP) server for working with Microsoft Outlook email using the Microsoft Graph API.

## Modularization Structure

The codebase has been refactored following object-oriented and separation of concerns principles:

```
src/
├── cli/                     # CLI-specific code
│   ├── index.ts             # CLI entry point
│   ├── commands/            # Individual command modules
│   │   ├── folder.ts        # Folder-related commands
│   │   ├── email.ts         # Email-related commands
│   │   ├── draft.ts         # Draft-related commands
│   │   └── utils.ts         # CLI utilities
│   └── formatters/          # Output formatting
│       ├── folderFormatter.ts
│       └── emailFormatter.ts
├── mcp/                     # MCP server code
│   ├── server.ts            # MCP server entry point
│   └── tools/               # Individual tool modules
│       ├── folderTools.ts   # Folder-related tools
│       ├── emailTools.ts    # Email-related tools
│       └── draftTools.ts    # Draft-related tools
├── services/                # Core business logic
│   ├── interfaces.ts        # Service interfaces
│   ├── authService.ts       # Authentication logic
│   ├── serviceFactory.ts    # Factory for creating services
│   └── mailService/         # Core mail service
│       ├── index.ts         # Main export
│       ├── folderService.ts # Folder operations
│       ├── emailService.ts  # Email operations
│       └── draftService.ts  # Draft operations
├── models/                  # Data models and interfaces
│   ├── folder.ts            # Folder-related interfaces
│   ├── email.ts             # Email-related interfaces
│   └── draft.ts             # Draft-related interfaces
├── utils/                   # Utilities
│   ├── htmlToText.ts        # HTML conversion
│   └── paths.ts             # Path handling utilities
├── config/                  # Configuration
│   └── graphConfig.ts       # Microsoft Graph config
├── index.ts                 # CLI entry point
└── server.ts                # MCP server entry point
```

## Key Improvements

### 1. Separation of Concerns

- **Models**: Clear data models with interfaces
- **Services**: Business logic separated into domain-specific services
- **CLI**: Command-line interface with dedicated formatters
- **MCP**: MCP server tools separated by functionality
- **Utils**: Reusable utilities for common operations
- **Config**: Centralized configuration

### 2. Object-Oriented Approach

- Implemented interfaces for all services to enable dependency injection
- Used service classes with distinct responsibilities
- Created proper inheritance and composition patterns

### 3. Dependency Injection

- Services receive dependencies through constructors
- Factory pattern for creating services with proper dependencies
- Support for mocking services in testing

### 4. Interface-Based Design

- Well-defined interfaces for each service
- Clear contracts between components
- Improved testability and maintainability

### 5. Code Organization

- Small, focused files instead of large monolithic ones
- Consistent naming conventions
- Improved readability and maintainability

## Entry Points

- **CLI**: `src/index.ts` → `src/cli/index.ts`
- **MCP Server**: `src/server.ts` → `src/mcp/server.ts`

## Usage

### Building

```bash
npm run build
```

### Running the CLI

```bash
npm run cli <command> [options]
```

### Running the MCP Server

```bash
npm run start
```

## Benefits of Modularization

1. **Improved Maintainability**: Smaller, focused files that are easier to understand and modify
2. **Better Testability**: Isolated components that can be tested independently
3. **Enhanced Collaboration**: Multiple developers can work on different modules simultaneously
4. **Reduced Claude Resource Usage**: Working with smaller files consumes less of Claude's context window
5. **Code Reuse**: Shared functionality between CLI and MCP implementations
6. **Easier Feature Additions**: New features can be added by creating new modules without modifying existing code
