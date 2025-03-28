import { Client } from '@microsoft/microsoft-graph-client';
import { MailFolder, NewMailFolder } from '../../models/folder';
import { IAuthService, IFolderService } from '../interfaces';
import { graphConfig } from '../../config/graphConfig';
import { normalizeFolderPath } from '../../utils/paths';

/**
 * Interface for API errors
 */
interface GraphApiError {
  statusCode?: number;
  message?: string;
}

/**
 * Service for handling mail folder operations
 */
export class FolderService implements IFolderService {
  private client: Client;
  private folderPathCache: Map<string, Map<string, string>> = new Map(); // Cache for folder paths to IDs
  private folderIdCache: Map<string, Map<string, string>> = new Map(); // Cache for folder IDs to paths

  constructor(authService: IAuthService) {
    this.client = authService.getClient();
  }

  /**
   * Resolves a folder path to its ID
   * @param folderPathOrId Folder path (e.g., "/Inbox") or ID
   * @param userEmail Email address of the user
   * @returns The resolved folder ID
   */
  async resolveFolderPath(folderPathOrId: string, userEmail: string): Promise<string> {
    // If it doesn't start with "/", assume it's already an ID
    if (!folderPathOrId.startsWith('/')) {
      return folderPathOrId;
    }

    // Normalize path - remove trailing slash and ensure starting slash
    const normalizedPath = normalizeFolderPath(folderPathOrId);
    
    // Check cache first
    if (!this.folderPathCache.has(userEmail)) {
      this.folderPathCache.set(userEmail, new Map());
    }
    
    if (this.folderPathCache.get(userEmail)!.has(normalizedPath.toLowerCase())) {
      return this.folderPathCache.get(userEmail)!.get(normalizedPath.toLowerCase())!;
    }

    // Special case for root folder "/"
    if (normalizedPath === '/') {
      throw new Error('Root folder does not have an ID. Please specify a specific folder.');
    }

    // Split path parts
    const parts = normalizedPath.split('/').filter(p => p.length > 0);
    
    // Start with top level folders
    let folders = await this.getMailFolders(userEmail);
    let currentFolder: MailFolder | undefined;
    let currentPath = '';
    
    // Navigate down the path
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].toLowerCase();
      currentPath += `/${parts[i]}`;
      
      // Find matching folder (case insensitive)
      currentFolder = folders.find(f => f.displayName.toLowerCase() === part);
      
      if (!currentFolder) {
        throw new Error(`Folder not found: ${currentPath}`);
      }
      
      // Cache this folder path
      this.folderPathCache.get(userEmail)!.set(currentPath.toLowerCase(), currentFolder.id);
      
      // If not at the end of the path, we need to go deeper
      if (i < parts.length - 1) {
        folders = await this.getChildFolders(currentFolder.id, userEmail);
      }
    }
    
    if (!currentFolder) {
      throw new Error(`Could not resolve folder path: ${normalizedPath}`);
    }
    
    return currentFolder.id;
  }

  /**
   * Builds a complete folder path map for a user
   * @param userEmail Email address of the user
   * @returns Map of folder IDs to their full paths
   */
  async buildFolderPathMap(userEmail: string): Promise<Map<string, string>> {
    if (!this.folderIdCache.has(userEmail)) {
      this.folderIdCache.set(userEmail, new Map());
    }
    
    // Start with top level folders
    const rootFolders = await this.getMailFolders(userEmail);
    
    // Process each folder
    for (const folder of rootFolders) {
      await this.processFolderAndChildren(folder, `/${folder.displayName}`, userEmail);
    }
    
    return this.folderIdCache.get(userEmail)!;
  }

  /**
   * Recursively process folders to build path maps
   * @param folder The current folder
   * @param currentPath Current path to this folder
   * @param userEmail User email
   */
  private async processFolderAndChildren(folder: MailFolder, currentPath: string, userEmail: string): Promise<void> {
    // Add to ID cache
    this.folderIdCache.get(userEmail)!.set(folder.id, currentPath);
    
    // Add to path cache
    if (!this.folderPathCache.has(userEmail)) {
      this.folderPathCache.set(userEmail, new Map());
    }
    this.folderPathCache.get(userEmail)!.set(currentPath.toLowerCase(), folder.id);
    
    // Store full path in the folder object itself
    folder.fullPath = currentPath;
    
    // Process children if there are any
    if (folder.childFolderCount > 0) {
      const children = await this.getChildFolders(folder.id, userEmail);
      for (const child of children) {
        await this.processFolderAndChildren(child, `${currentPath}/${child.displayName}`, userEmail);
      }
    }
  }

  /**
   * Get folder path by ID
   * @param folderId Folder ID
   * @param userEmail User email
   * @returns Folder path
   */
  async getFolderPath(folderId: string, userEmail: string): Promise<string> {
    // Check if we already have the path cached
    if (this.folderIdCache.has(userEmail) && this.folderIdCache.get(userEmail)!.has(folderId)) {
      return this.folderIdCache.get(userEmail)!.get(folderId)!;
    }
    
    // If not cached, build the complete folder path map
    await this.buildFolderPathMap(userEmail);
    
    // Check if we found it
    if (this.folderIdCache.get(userEmail)!.has(folderId)) {
      return this.folderIdCache.get(userEmail)!.get(folderId)!;
    }
    
    // If still not found, return the ID as fallback
    return folderId;
  }

  /**
   * Get mail folders for a specific user
   * @param userEmail Email address of the user (required for app-only authentication)
   * @returns List of mail folders
   */
  async getMailFolders(userEmail: string): Promise<MailFolder[]> {
    try {
      if (!userEmail) {
        throw new Error('User email is required for application permissions flow');
      }
      
      // Build the API endpoint for the specified user
      const endpoint = `/users/${userEmail}/mailFolders`;
      
      // Query parameters to include child folder count and more details
      const queryParams = graphConfig.folderQueryParams;
      
      // Make the request to Microsoft Graph
      const response = await this.client
        .api(`${endpoint}${queryParams}`)
        .get();
      
      return response.value;
    } catch (error) {
      console.error('Error getting mail folders:', error);
      throw error;
    }
  }

  /**
   * Get child folders for a specific mail folder
   * @param folderIdOrPath Folder ID or path (like '/Inbox')
   * @param userEmail Email address of the user
   * @returns List of child mail folders
   */
  async getChildFolders(folderIdOrPath: string, userEmail: string): Promise<MailFolder[]> {
    try {
      if (!userEmail) {
        throw new Error('User email is required for application permissions flow');
      }

      // Resolve folder path to ID if it's a path
      const folderId = await this.resolveFolderPath(folderIdOrPath, userEmail);

      // Build the API endpoint
      const endpoint = `/users/${userEmail}/mailFolders/${folderId}/childFolders`;
      
      // Query parameters to include more details
      const queryParams = graphConfig.folderQueryParams;
      
      // Make the request to Microsoft Graph
      const response = await this.client
        .api(`${endpoint}${queryParams}`)
        .get();
      
      return response.value;
    } catch (error) {
      console.error('Error getting child folders:', error);
      throw error;
    }
  }

  /**
   * Create a new mail folder
   * @param newFolder New folder details
   * @param userEmail Email address of the user
   * @param parentFolderIdOrPath Optional parent folder ID or path (if not provided, creates at root)
   * @returns Created mail folder
   */
  async createFolder(newFolder: NewMailFolder, userEmail: string, parentFolderIdOrPath?: string): Promise<MailFolder> {
    try {
      if (!userEmail) {
        throw new Error('User email is required for application permissions flow');
      }

      // Build the API endpoint
      let endpoint = `/users/${userEmail}`;
      
      if (parentFolderIdOrPath) {
        // Resolve parent folder path to ID if it's a path
        const parentFolderId = await this.resolveFolderPath(parentFolderIdOrPath, userEmail);
        endpoint += `/mailFolders/${parentFolderId}/childFolders`;
      } else {
        endpoint += '/mailFolders';
      }
      
      // Make the request to Microsoft Graph
      const response = await this.client
        .api(endpoint)
        .post(newFolder);
      
      // Clear the cache since folder structure has changed
      this.folderPathCache.delete(userEmail);
      this.folderIdCache.delete(userEmail);
      
      return response;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  /**
   * Update a mail folder's properties (rename)
   * @param folderIdOrPath ID or path of the folder to update
   * @param updatedFolder Updated folder properties
   * @param userEmail Email address of the user
   * @returns Updated mail folder
   */
  async updateFolder(folderIdOrPath: string, updatedFolder: Partial<NewMailFolder>, userEmail: string): Promise<MailFolder> {
    try {
      if (!userEmail) {
        throw new Error('User email is required for application permissions flow');
      }

      // Resolve folder path to ID if it's a path
      const folderId = await this.resolveFolderPath(folderIdOrPath, userEmail);

      // Build the API endpoint
      const endpoint = `/users/${userEmail}/mailFolders/${folderId}`;
      
      // Make the request to Microsoft Graph
      const response = await this.client
        .api(endpoint)
        .patch(updatedFolder);
      
      // Clear the cache since folder structure has changed
      this.folderPathCache.delete(userEmail);
      this.folderIdCache.delete(userEmail);
      
      return response;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  }

  /**
   * Move a folder to another parent folder
   * @param folderIdOrPath ID or path of the folder to move
   * @param destinationParentFolderIdOrPath ID or path of the destination parent folder
   * @param userEmail Email address of the user
   * @returns Moved mail folder
   */
  async moveFolder(folderIdOrPath: string, destinationParentFolderIdOrPath: string, userEmail: string): Promise<MailFolder> {
    try {
      if (!userEmail) {
        throw new Error('User email is required for application permissions flow');
      }

      // Resolve folder paths to IDs if they're paths
      const folderId = await this.resolveFolderPath(folderIdOrPath, userEmail);
      const destinationParentFolderId = await this.resolveFolderPath(destinationParentFolderIdOrPath, userEmail);

      // Build the API endpoint
      const endpoint = `/users/${userEmail}/mailFolders/${folderId}/move`;
      
      // Make the request to Microsoft Graph
      const response = await this.client
        .api(endpoint)
        .post({
          destinationId: destinationParentFolderId
        });
      
      // Clear the cache since folder structure has changed
      this.folderPathCache.delete(userEmail);
      this.folderIdCache.delete(userEmail);
      
      return response;
    } catch (error) {
      console.error('Error moving folder:', error);
      throw error;
    }
  }

  /**
   * Copy a folder to another parent folder
   * Note: This might not be supported by the Microsoft Graph API
   * @param folderIdOrPath ID or path of the folder to copy
   * @param destinationParentFolderIdOrPath ID or path of the destination parent folder
   * @param userEmail Email address of the user
   * @returns Copied mail folder
   */
  async copyFolder(folderIdOrPath: string, destinationParentFolderIdOrPath: string, userEmail: string): Promise<MailFolder> {
    try {
      if (!userEmail) {
        throw new Error('User email is required for application permissions flow');
      }

      // Resolve folder paths to IDs if they're paths
      const folderId = await this.resolveFolderPath(folderIdOrPath, userEmail);
      const destinationParentFolderId = await this.resolveFolderPath(destinationParentFolderIdOrPath, userEmail);

      // Build the API endpoint
      const endpoint = `/users/${userEmail}/mailFolders/${folderId}/copy`;
      
      // Make the request to Microsoft Graph
      const response = await this.client
        .api(endpoint)
        .post({
          destinationId: destinationParentFolderId
        });
      
      // Clear the cache since folder structure has changed
      this.folderPathCache.delete(userEmail);
      this.folderIdCache.delete(userEmail);
      
      return response;
    } catch (error) {
      const apiError = error as GraphApiError;
      // Check if the error is because the API doesn't support folder copying
      if (apiError.statusCode === 501 || apiError.message?.includes('Not Implemented')) {
        throw new Error('Folder copying is not supported by the Microsoft Graph API');
      }
      console.error('Error copying folder:', error);
      throw error;
    }
  }
}
