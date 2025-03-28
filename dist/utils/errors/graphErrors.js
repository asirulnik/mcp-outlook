"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphErrorMessages = void 0;
exports.getGraphErrorMessage = getGraphErrorMessage;
exports.getGraphErrorCode = getGraphErrorCode;
exports.createGraphError = createGraphError;
const index_1 = require("./index");
/**
 * Map of Microsoft Graph API error codes to user-friendly messages
 */
exports.graphErrorMessages = {
    // Authentication errors
    'InvalidAuthenticationToken': 'Authentication token is invalid or expired',
    'AuthenticationFailure': 'Authentication failed. Please check your credentials',
    'AccessDenied': 'Access denied. You do not have permission to perform this action',
    // Request errors
    'BadRequest': 'Invalid request. Please check your input parameters',
    'InvalidRequest': 'Invalid request format or parameters',
    'ItemNotFound': 'The requested item could not be found',
    'ResourceNotFound': 'The requested resource could not be found',
    'NameAlreadyExists': 'A resource with this name already exists',
    // Service errors
    'ServiceNotAvailable': 'Microsoft Graph service is temporarily unavailable',
    'QuotaLimitExceeded': 'API request quota exceeded. Please try again later',
    'TooManyRequests': 'Too many requests. Please try again later',
    'Timeout': 'Request timed out. Please try again',
    // Content errors
    'AttachmentSizeLimitExceeded': 'Attachment size exceeds the allowed limit',
    'MessageSizeLimitExceeded': 'Message size exceeds the allowed limit',
    // Generic
    'GeneralException': 'An error occurred while processing your request',
    'UnknownError': 'An unknown error occurred'
};
/**
 * Get user-friendly error message based on Graph API error code
 * @param errorCode The Graph API error code
 * @param defaultMessage Default message to return if code is not recognized
 * @returns User-friendly error message
 */
function getGraphErrorMessage(errorCode, defaultMessage = 'An error occurred') {
    return exports.graphErrorMessages[errorCode] || defaultMessage;
}
/**
 * Parse Graph API error response and extract the error code
 * @param response Error response from Graph API
 * @returns Error code if found, undefined otherwise
 */
function getGraphErrorCode(response) {
    if (!response)
        return undefined;
    // Try to get the error code from the error object
    if (response.error && response.error.code) {
        return response.error.code;
    }
    // Try to get the error code from the response body
    if (response.body) {
        try {
            const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
            if (body.error && body.error.code) {
                return body.error.code;
            }
        }
        catch (e) {
            // Ignore parsing errors
        }
    }
    return undefined;
}
/**
 * Create a GraphError from a Graph API error response
 * @param response Error response from Graph API
 * @returns GraphError instance
 */
function createGraphError(response) {
    const statusCode = response.statusCode || 500;
    const errorCode = getGraphErrorCode(response);
    const defaultMessage = response.message || 'Unknown Graph API error';
    const message = errorCode ? getGraphErrorMessage(errorCode, defaultMessage) : defaultMessage;
    return new index_1.GraphError(statusCode, message, response.error || response);
}
