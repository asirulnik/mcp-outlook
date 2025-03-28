"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFoldersCommand = listFoldersCommand;
exports.listChildFoldersCommand = listChildFoldersCommand;
exports.createFolderCommand = createFolderCommand;
exports.renameFolderCommand = renameFolderCommand;
exports.moveFolderCommand = moveFolderCommand;
exports.copyFolderCommand = copyFolderCommand;
const serviceFactory_1 = require("../../services/serviceFactory");
const folderFormatter_1 = require("../formatters/folderFormatter");
/**
 * Command to list mail folders
 */
async function listFoldersCommand(options) {
    try {
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        const folders = await folderService.getMailFolders(options.user);
        // Build folder path map for all folders
        await folderService.buildFolderPathMap(options.user);
        console.log(`\nMail Folders for ${options.user}:`);
        await (0, folderFormatter_1.printFolders)(folders, folderService.getFolderPath.bind(folderService), options.user);
        console.log('\n');
    }
    catch (error) {
        console.error('Error listing folders:', error);
        process.exit(1);
    }
}
/**
 * Command to list child folders
 */
async function listChildFoldersCommand(folderIdOrPath, options) {
    try {
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        // Resolve path if needed
        let folderPath = folderIdOrPath;
        if (!folderIdOrPath.startsWith('/')) {
            folderPath = await folderService.getFolderPath(folderIdOrPath, options.user);
        }
        const folders = await folderService.getChildFolders(folderIdOrPath, options.user);
        console.log(`\nChild Folders for Folder: ${folderPath} (User: ${options.user})`);
        await (0, folderFormatter_1.printFolders)(folders, folderService.getFolderPath.bind(folderService), options.user);
        console.log('\n');
    }
    catch (error) {
        console.error('Error listing child folders:', error);
        process.exit(1);
    }
}
/**
 * Command to create a new folder
 */
async function createFolderCommand(name, options) {
    try {
        const newFolder = {
            displayName: name,
            isHidden: options.hidden || false
        };
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        const result = await folderService.createFolder(newFolder, options.user, options.parent);
        // Get the path for the newly created folder
        const folderPath = await folderService.getFolderPath(result.id, options.user);
        console.log(`Folder "${name}" created successfully with path: ${folderPath}`);
    }
    catch (error) {
        console.error('Error creating folder:', error);
        process.exit(1);
    }
}
/**
 * Command to rename a folder
 */
async function renameFolderCommand(folderIdOrPath, newName, options) {
    try {
        const updatedFolder = {
            displayName: newName
        };
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        // Resolve path if needed and get current path for display
        let folderPath = folderIdOrPath;
        if (!folderIdOrPath.startsWith('/')) {
            folderPath = await folderService.getFolderPath(folderIdOrPath, options.user);
        }
        await folderService.updateFolder(folderIdOrPath, updatedFolder, options.user);
        // Get parent path
        const lastSlashIndex = folderPath.lastIndexOf('/');
        const parentPath = lastSlashIndex > 0 ? folderPath.substring(0, lastSlashIndex) : '';
        const newPath = parentPath + '/' + newName;
        console.log(`Folder ${folderPath} renamed to "${newName}" successfully`);
        console.log(`New path: ${newPath}`);
    }
    catch (error) {
        console.error('Error renaming folder:', error);
        process.exit(1);
    }
}
/**
 * Command to move a folder
 */
async function moveFolderCommand(folderIdOrPath, destinationParentFolderIdOrPath, options) {
    try {
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        // Resolve paths if needed
        let sourceFolderPath = folderIdOrPath;
        if (!folderIdOrPath.startsWith('/')) {
            sourceFolderPath = await folderService.getFolderPath(folderIdOrPath, options.user);
        }
        let destinationFolderPath = destinationParentFolderIdOrPath;
        if (!destinationParentFolderIdOrPath.startsWith('/')) {
            destinationFolderPath = await folderService.getFolderPath(destinationParentFolderIdOrPath, options.user);
        }
        await folderService.moveFolder(folderIdOrPath, destinationParentFolderIdOrPath, options.user);
        // Get folder name from source path
        const folderName = sourceFolderPath.substring(sourceFolderPath.lastIndexOf('/') + 1);
        const newPath = destinationFolderPath + '/' + folderName;
        console.log(`Folder ${sourceFolderPath} successfully moved to ${destinationFolderPath}`);
        console.log(`New path: ${newPath}`);
    }
    catch (error) {
        console.error('Error moving folder:', error);
        process.exit(1);
    }
}
/**
 * Command to copy a folder
 */
async function copyFolderCommand(folderIdOrPath, destinationParentFolderIdOrPath, options) {
    var _a;
    try {
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        // Resolve paths if needed
        let sourceFolderPath = folderIdOrPath;
        if (!folderIdOrPath.startsWith('/')) {
            sourceFolderPath = await folderService.getFolderPath(folderIdOrPath, options.user);
        }
        let destinationFolderPath = destinationParentFolderIdOrPath;
        if (!destinationParentFolderIdOrPath.startsWith('/')) {
            destinationFolderPath = await folderService.getFolderPath(destinationParentFolderIdOrPath, options.user);
        }
        await folderService.copyFolder(folderIdOrPath, destinationParentFolderIdOrPath, options.user);
        // Get folder name from source path
        const folderName = sourceFolderPath.substring(sourceFolderPath.lastIndexOf('/') + 1);
        const newPath = destinationFolderPath + '/' + folderName;
        console.log(`Folder ${sourceFolderPath} successfully copied to ${destinationFolderPath}`);
        console.log(`Copy path: ${newPath}`);
    }
    catch (error) {
        const err = error;
        if ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes('not supported')) {
            console.error('Error: Folder copying is not supported by the Microsoft Graph API');
        }
        else {
            console.error('Error copying folder:', error);
        }
        process.exit(1);
    }
}
