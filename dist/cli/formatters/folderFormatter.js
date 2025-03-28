"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFolderInfo = formatFolderInfo;
exports.printFolders = printFolders;
/**
 * Formats folder information for display
 * @param folder Folder to format
 * @param folderPath Path to the folder
 * @returns Formatted folder info string
 */
function formatFolderInfo(folder, folderPath) {
    let info = `(Path: ${folderPath}`;
    if (folder.unreadItemCount !== undefined) {
        info += `, Unread: ${folder.unreadItemCount}`;
    }
    if (folder.totalItemCount !== undefined) {
        info += `, Total: ${folder.totalItemCount}`;
    }
    info += ')';
    return info;
}
/**
 * Print folders in a tree structure
 * @param folders Folders to print
 * @param getFolderPath Function to get folder path
 * @param userEmail User email
 * @param level Current indentation level
 * @param prefix Current line prefix
 */
async function printFolders(folders, getFolderPath, userEmail, level = 0, prefix = '') {
    for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        const isLast = i === folders.length - 1;
        const folderPrefix = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';
        // Get folder path
        const folderPath = folder.fullPath || await getFolderPath(folder.id, userEmail);
        // Print folder details with path instead of ID
        console.log(`${prefix}${folderPrefix}${folder.displayName} ${formatFolderInfo(folder, folderPath)}`);
        // If this folder has child folders, indicate with a message
        if (folder.childFolderCount > 0) {
            console.log(`${prefix}${childPrefix}<Folder has ${folder.childFolderCount} child folders. Use 'list-child-folders "${folderPath}" --user ${userEmail}' to view.>`);
        }
    }
}
