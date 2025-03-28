/**
 * Models and interfaces related to mail folders
 */

/**
 * Represents a mail folder in Microsoft Outlook
 */
export interface MailFolder {
  id: string;
  displayName: string;
  parentFolderId?: string;
  childFolderCount: number;
  unreadItemCount?: number;
  totalItemCount?: number;
  fullPath?: string; // Added for storing the full path
}

/**
 * Interface for creating a new mail folder
 */
export interface NewMailFolder {
  displayName: string;
  isHidden?: boolean;
}
