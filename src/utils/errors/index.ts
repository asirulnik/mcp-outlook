import { promptConfig } from '../../config/prompts';

/**
 * Custom error class for Microsoft Graph API errors
 */
export class GraphError extends Error {
  statusCode: number;
  graphError?: any;

  constructor(statusCode: number, message: string, graphError?: any) {
    super(message);
    this.name = 'GraphError';
    this.statusCode = statusCode;
    this.graphError = graphError;
  }
}

/**
 * Custom error class for authentication errors
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error class for resource not found errors
 */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`);
    this.name = 'NotFoundError';
  }
}

/**
 * Process and handle Microsoft Graph API errors
 * @param error Raw error from the Graph API
 * @returns A more specific error with details
 */
export function handleGraphError(error: any): never {
  if (error.statusCode && error.body) {
    try {
      const parsedBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
      const errorMessage = parsedBody.error?.message || 'Unknown Graph API error';
      throw new GraphError(error.statusCode, errorMessage, parsedBody.error);
    } catch (parseError) {
      // If parsing fails, use the original error
      throw new GraphError(error.statusCode, error.message || 'Unknown Graph API error');
    }
  }
  
  // For other types of errors, map based on common patterns
  if (typeof error === 'object' && error !== null) {
    // Authentication errors
    if (error.name === 'AuthError' || 
        (error.message && error.message.includes('auth')) || 
        (error.code && (error.code === 401 || error.code === 403))) {
      throw new AuthenticationError(error.message || 'Authentication failed');
    }
    
    // Not found errors
    if (error.statusCode === 404 || (error.code && error.code === 404)) {
      throw new NotFoundError(error.message || 'Resource not found');
    }
  }
  
  // Re-throw the original error if we couldn't categorize it
  throw error;
}

/**
 * Format error for user display
 * @param error The error to format
 * @returns User-friendly error message
 */
export function formatErrorForUser(error: any): string {
  const { errors } = promptConfig;
  
  if (error instanceof GraphError) {
    return `Error (${error.statusCode}): ${error.message}`;
  }
  
  if (error instanceof AuthenticationError) {
    return errors.authentication.failed.replace('{message}', error.message);
  }
  
  if (error instanceof NotFoundError) {
    return errors.resource.notFound.replace('{resource}', error.message.replace('Resource not found: ', ''));
  }
  
  if (error instanceof ValidationError) {
    // Attempt to determine the validation error type
    if (error.message.includes('email')) {
      return errors.validation.invalidEmail.replace('{email}', extractValueFromErrorMessage(error.message) || '');
    }
    
    if (error.message.includes('ID') || error.message.includes('id')) {
      return errors.validation.invalidId.replace('{id}', extractValueFromErrorMessage(error.message) || '');
    }
    
    if (error.message.includes('date')) {
      return errors.validation.invalidDate.replace('{date}', extractValueFromErrorMessage(error.message) || '');
    }
    
    if (error.message.includes('required')) {
      return errors.validation.missingParameter.replace('{parameter}', extractParameterFromErrorMessage(error.message) || 'unknown');
    }
    
    // Default validation error
    return `Validation error: ${error.message}`;
  }
  
  // Generic error handling
  return `Error: ${error.message || 'Unknown error occurred'}`;
}

/**
 * Extract a parameter name from an error message
 * @param message Error message
 * @returns Parameter name if found, undefined otherwise
 */
function extractParameterFromErrorMessage(message: string): string | undefined {
  // Try to match patterns like "Parameter 'xyz' is required"
  const paramMatch = message.match(/[Pp]arameter ['"]?([^'"]+)['"]? is/);
  if (paramMatch && paramMatch[1]) {
    return paramMatch[1];
  }
  
  // Match "Missing required parameter: xyz"
  const missingMatch = message.match(/[Mm]issing required (?:parameter|field): ['"]?([^'"]+)['"]?/);
  if (missingMatch && missingMatch[1]) {
    return missingMatch[1];
  }
  
  return undefined;
}

/**
 * Extract a value from an error message
 * @param message Error message
 * @returns Value if found, undefined otherwise
 */
function extractValueFromErrorMessage(message: string): string | undefined {
  // Try to match patterns like "Invalid value 'xyz' for parameter"
  const valueMatch = message.match(/[Ii]nvalid (?:value|format) ['"]?([^'"]+)['"]?/);
  if (valueMatch && valueMatch[1]) {
    return valueMatch[1];
  }
  
  return undefined;
}
