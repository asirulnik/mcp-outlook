import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServiceFactory } from '../../services/serviceFactory';
import { MailFolder, NewMailFolder } from '../../models/folder';

/**
 * Register folder-related MCP tools with the server
 * @param server MCP server instance
 */
export function registerFolderTools(server: McpServer): void {
  // 1. List mail folders tool
  server.tool(
    'list-mail-folders',
    { 
      userEmail: z.string().email()
    },
    async ({ userEmail }) => {
      try {
        const folderService = ServiceFactory.getFolderService();
        const folders = await folderService.getMailFolders(userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(folders, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error listing mail folders: ${error}`
          }],
          isError: true
        };
      }
    }
  );

  // 2. List child folders tool
  server.tool(
    'list-child-folders',
    { 
      userEmail: z.string().email(),
      folderId: z.string()
    },
    async ({ userEmail, folderId }) => {
      try {
        const folderService = ServiceFactory.getFolderService();
        const folders = await folderService.getChildFolders(folderId, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(folders, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error listing child folders: ${error}`
          }],
          isError: true
        };
      }
    }
  );
  
  // 3. Create folder tool
  server.tool(
    'create-folder',
    { 
      userEmail: z.string().email(),
      displayName: z.string(),
      isHidden: z.boolean().optional(),
      parentFolderId: z.string().optional()
    },
    async ({ userEmail, displayName, isHidden, parentFolderId }) => {
      try {
        const folderService = ServiceFactory.getFolderService();
        
        const newFolder: NewMailFolder = {
          displayName,
          isHidden
        };
        
        const result = await folderService.createFolder(newFolder, userEmail, parentFolderId);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error creating folder: ${error}`
          }],
          isError: true
        };
      }
    }
  );
  
  // 4. Move folder tool
  server.tool(
    'move-folder',
    { 
      userEmail: z.string().email(),
      folderId: z.string(),
      destinationFolderId: z.string()
    },
    async ({ userEmail, folderId, destinationFolderId }) => {
      try {
        const folderService = ServiceFactory.getFolderService();
        const result = await folderService.moveFolder(folderId, destinationFolderId, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error moving folder: ${error}`
          }],
          isError: true
        };
      }
    }
  );
  
  // 5. Update folder (rename) tool
  server.tool(
    'update-folder',
    { 
      userEmail: z.string().email(),
      folderId: z.string(),
      displayName: z.string()
    },
    async ({ userEmail, folderId, displayName }) => {
      try {
        const folderService = ServiceFactory.getFolderService();
        
        const updatedFolder: Partial<NewMailFolder> = {
          displayName
        };
        
        const result = await folderService.updateFolder(folderId, updatedFolder, userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Error updating folder: ${error}`
          }],
          isError: true
        };
      }
    }
  );
}
