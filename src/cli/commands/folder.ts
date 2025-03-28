import { IFolderService } from '../../services/interfaces';
import { NewMailFolder } from '../../models/folder';
import { ServiceFactory } from '../../services/serviceFactory';
import { formatFolderInfo, printFolders } from '../formatters/folderFormatter';

/**
 * Command to list mail folders
 */
export async function listFoldersCommand(options: { user: string }): Promise<void> {
  try {
    const folderService = ServiceFactory.getFolderService();
    const folders = await folderService.getMailFolders(options.user);
    
    // Build folder path map for all folders
    await folderService.buildFolderPathMap(options.user);
    
    console.log(`\nMail Folders for ${options.user}:`);
    await printFolders(folders, folderService.getFolderPath.bind(folderService), options.user);
    console.log('\n');
  } catch (error) {
    console.error('Error listing folders:', error);
    process.exit(1);
  }
}

/**
 * Command to list child folders
 */
export async function listChildFoldersCommand(folderIdOrPath: string, options: { user: string }): Promise<void> {
  try {
    const folderService = ServiceFactory.getFolderService();
    
    // Resolve path if needed
    let folderPath = folderIdOrPath;
    if (!folderIdOrPath.startsWith('/')) {
      folderPath = await folderService.getFolderPath(folderIdOrPath, options.user);
    }
    
    const folders = await folderService.getChildFolders(folderIdOrPath, options.user);
    
    console.log(`\nChild Folders for Folder: ${folderPath} (User: ${options.user})`);
    await printFolders(folders, folderService.getFolderPath.bind(folderService), options.user);
    console.log('\n');
  } catch (error) {
    console.error('Error listing child folders:', error);
    process.exit(1);
  }
}

/**
 * Command to create a new folder
 */
export async function createFolderCommand(name: string, options: { user: string, parent?: string, hidden?: boolean }): Promise<void> {
  try {
    const newFolder: NewMailFolder = {
      displayName: name,
      isHidden: options.hidden || false
    };
    
    const folderService = ServiceFactory.getFolderService();
    const result = await folderService.createFolder(newFolder, options.user, options.parent);
    
    // Get the path for the newly created folder
    const folderPath = await folderService.getFolderPath(result.id, options.user);
    
    console.log(`Folder "${name}" created successfully with path: ${folderPath}`);
  } catch (error) {
    console.error('Error creating folder:', error);
    process.exit(1);
  }
}

/**
 * Command to rename a folder
 */
export async function renameFolderCommand(folderIdOrPath: string, newName: string, options: { user: string }): Promise<void> {
  try {
    const updatedFolder: Partial<NewMailFolder> = {
      displayName: newName
    };
    
    const folderService = ServiceFactory.getFolderService();
    
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
  } catch (error) {
    console.error('Error renaming folder:', error);
    process.exit(1);
  }
}

/**
 * Command to move a folder
 */
export async function moveFolderCommand(folderIdOrPath: string, destinationParentFolderIdOrPath: string, options: { user: string }): Promise<void> {
  try {
    const folderService = ServiceFactory.getFolderService();
    
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
  } catch (error) {
    console.error('Error moving folder:', error);
    process.exit(1);
  }
}

/**
 * Command to copy a folder
 */
export async function copyFolderCommand(folderIdOrPath: string, destinationParentFolderIdOrPath: string, options: { user: string }): Promise<void> {
  try {
    const folderService = ServiceFactory.getFolderService();
    
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
  } catch (error) {
    const err = error as { message?: string };
    if (err.message?.includes('not supported')) {
      console.error('Error: Folder copying is not supported by the Microsoft Graph API');
    } else {
      console.error('Error copying folder:', error);
    }
    process.exit(1);
  }
}
