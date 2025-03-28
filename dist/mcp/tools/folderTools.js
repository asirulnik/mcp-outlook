"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFolderTools = registerFolderTools;
const zod_1 = require("zod");
const serviceFactory_1 = require("../../services/serviceFactory");
/**
 * Register folder-related MCP tools with the server
 * @param server MCP server instance
 */
function registerFolderTools(server) {
    // 1. List mail folders tool
    server.tool('list-mail-folders', {
        userEmail: zod_1.z.string().email()
    }, async ({ userEmail }) => {
        try {
            const folderService = serviceFactory_1.ServiceFactory.getFolderService();
            const folders = await folderService.getMailFolders(userEmail);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(folders, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error listing mail folders: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 2. List child folders tool
    server.tool('list-child-folders', {
        userEmail: zod_1.z.string().email(),
        folderId: zod_1.z.string()
    }, async ({ userEmail, folderId }) => {
        try {
            const folderService = serviceFactory_1.ServiceFactory.getFolderService();
            const folders = await folderService.getChildFolders(folderId, userEmail);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(folders, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error listing child folders: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 3. Create folder tool
    server.tool('create-folder', {
        userEmail: zod_1.z.string().email(),
        displayName: zod_1.z.string(),
        isHidden: zod_1.z.boolean().optional(),
        parentFolderId: zod_1.z.string().optional()
    }, async ({ userEmail, displayName, isHidden, parentFolderId }) => {
        try {
            const folderService = serviceFactory_1.ServiceFactory.getFolderService();
            const newFolder = {
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
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error creating folder: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 4. Move folder tool
    server.tool('move-folder', {
        userEmail: zod_1.z.string().email(),
        folderId: zod_1.z.string(),
        destinationFolderId: zod_1.z.string()
    }, async ({ userEmail, folderId, destinationFolderId }) => {
        try {
            const folderService = serviceFactory_1.ServiceFactory.getFolderService();
            const result = await folderService.moveFolder(folderId, destinationFolderId, userEmail);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error moving folder: ${error}`
                    }],
                isError: true
            };
        }
    });
    // 5. Update folder (rename) tool
    server.tool('update-folder', {
        userEmail: zod_1.z.string().email(),
        folderId: zod_1.z.string(),
        displayName: zod_1.z.string()
    }, async ({ userEmail, folderId, displayName }) => {
        try {
            const folderService = serviceFactory_1.ServiceFactory.getFolderService();
            const updatedFolder = {
                displayName
            };
            const result = await folderService.updateFolder(folderId, updatedFolder, userEmail);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error updating folder: ${error}`
                    }],
                isError: true
            };
        }
    });
}
