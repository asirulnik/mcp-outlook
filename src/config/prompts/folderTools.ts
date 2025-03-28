/**
 * Configuration for folder-related tool descriptions, parameters, and responses
 */
export const folderToolsConfig = {
  listFolders: {
    description: "List all top-level mail folders for a user",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access"
    },
    responses: {
      success: "Successfully retrieved {count} mail folders",
      error: "Error listing folders: {error}"
    }
  },
  
  listChildFolders: {
    description: "List all subfolders of a specific mail folder",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      parentFolderId: "ID or path of the parent folder to list children from"
    },
    responses: {
      success: "Successfully retrieved {count} child folders from {parentFolder}",
      error: "Error listing child folders: {error}"
    }
  },
  
  createFolder: {
    description: "Create a new mail folder",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      folderName: "Name for the new folder",
      parentFolderId: "Optional ID or path of the parent folder (creates a top-level folder if omitted)",
      isHidden: "Whether the folder should be hidden"
    },
    responses: {
      success: "Successfully created folder '{folderName}'",
      error: "Error creating folder: {error}"
    }
  },
  
  renameFolder: {
    description: "Rename an existing mail folder",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      folderId: "ID or path of the folder to rename",
      newName: "New name for the folder"
    },
    responses: {
      success: "Successfully renamed folder to '{newName}'",
      error: "Error renaming folder: {error}"
    }
  },
  
  moveFolder: {
    description: "Move a folder to be a child of another folder",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      folderId: "ID or path of the folder to move",
      destinationParentFolderId: "ID or path of the destination parent folder"
    },
    responses: {
      success: "Successfully moved folder to {destinationParentFolder}",
      error: "Error moving folder: {error}"
    }
  },
  
  copyFolder: {
    description: "Copy a folder and its contents to another location",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      folderId: "ID or path of the folder to copy",
      destinationParentFolderId: "ID or path of the destination parent folder"
    },
    responses: {
      success: "Successfully copied folder to {destinationParentFolder}",
      error: "Error copying folder: {error}"
    }
  }
};
