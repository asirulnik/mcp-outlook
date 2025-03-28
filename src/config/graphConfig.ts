/**
 * Configuration settings for Microsoft Graph API
 */

/**
 * Microsoft Graph API configuration
 */
export const graphConfig = {
  /**
   * Base URL for Microsoft Graph API
   */
  apiBaseUrl: 'https://graph.microsoft.com/v1.0',
  
  /**
   * Default scope for Microsoft Graph API authentication
   */
  defaultScopes: ['https://graph.microsoft.com/.default'],
  
  /**
   * Default query parameters for folder requests
   */
  folderQueryParams: '?$top=100&$select=id,displayName,parentFolderId,childFolderCount,unreadItemCount,totalItemCount',
  
  /**
   * Default query parameters for email listing
   */
  emailQueryParams: (limit: number, includeBodies: boolean) => {
    let params = `?$top=${limit}&$select=id,subject,from,receivedDateTime,`;
    
    // Include full body content if requested
    if (includeBodies) {
      params += `body,toRecipients,ccRecipients,`;
    }
    
    params += `bodyPreview,hasAttachments,isRead&$orderby=receivedDateTime desc`;
    
    return params;
  },
  
  /**
   * Default query parameters for email details
   */
  emailDetailsQueryParams: '?$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,body,bodyPreview,hasAttachments,isRead',
  
  /**
   * Request timeout in milliseconds
   */
  requestTimeout: 30000,
  
  /**
   * Maximum batch size for batch requests
   */
  maxBatchSize: 20
};
