"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessagesConfig = void 0;
/**
 * Configuration for common error messages
 */
exports.errorMessagesConfig = {
    // Authentication errors
    authentication: {
        failed: "Authentication failed: {message}",
        expired: "Authentication token expired. Please re-authenticate.",
        missingCredentials: "Missing credentials: {credentials}",
        missingScopes: "Missing required permission scopes: {scopes}"
    },
    // Resource errors
    resource: {
        notFound: "Resource not found: {resource}",
        alreadyExists: "Resource already exists: {resource}",
        permissionDenied: "Permission denied for resource: {resource}"
    },
    // Input validation errors
    validation: {
        invalidEmail: "Invalid email address: {email}",
        invalidId: "Invalid ID format: {id}",
        invalidDate: "Invalid date format: {date}. Expected ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)",
        missingParameter: "Missing required parameter: {parameter}",
        invalidParameter: "Invalid parameter value for {parameter}: {value}"
    },
    // Service errors
    service: {
        graphError: "Microsoft Graph API error: {message}",
        connectionError: "Connection error: {message}",
        timeout: "Request timed out: {operation}",
        rateLimited: "Rate limit exceeded. Please try again in {retryAfter} seconds."
    },
    // Attachment errors
    attachment: {
        downloadFailed: "Failed to download attachment: {message}",
        fileWriteFailed: "Failed to write attachment to file: {message}",
        invalidAttachment: "Invalid attachment: {message}"
    },
    // Path resolution errors
    path: {
        invalidPath: "Invalid folder path: {path}",
        cannotResolve: "Cannot resolve folder path: {path}",
        ambiguousPath: "Ambiguous folder path: {path} matches multiple folders"
    }
};
