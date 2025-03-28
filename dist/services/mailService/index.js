"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailService = exports.MailService = void 0;
const authService_1 = require("../authService");
const folderService_1 = require("./folderService");
const emailService_1 = require("./emailService");
const draftService_1 = require("./draftService");
/**
 * Main Mail Service that composes other specialized services
 */
class MailService {
    /**
     * Creates a new instance of the MailService
     * @param customAuthService Optional custom auth service (uses default if not provided)
     */
    constructor(customAuthService) {
        // Use provided auth service or singleton instance
        this._authService = customAuthService || authService_1.authService;
        // Create the specialized services
        this._folderService = new folderService_1.FolderService(this._authService);
        this._emailService = new emailService_1.EmailService(this._authService, this._folderService);
        this._draftService = new draftService_1.DraftService(this._authService);
    }
    /**
     * Get the folder service
     */
    get folders() {
        return this._folderService;
    }
    /**
     * Get the email service
     */
    get emails() {
        return this._emailService;
    }
    /**
     * Get the draft service
     */
    get drafts() {
        return this._draftService;
    }
    // --- Convenience methods that delegate to specialized services ---
    /**
     * Get mail folders for a specific user
     * @param userEmail Email address of the user
     * @returns List of mail folders
     */
    async getMailFolders(userEmail) {
        return this._folderService.getMailFolders(userEmail);
    }
    /**
     * Get child folders for a specific mail folder
     * @param folderIdOrPath Folder ID or path (like '/Inbox')
     * @param userEmail Email address of the user
     * @returns List of child mail folders
     */
    async getChildFolders(folderIdOrPath, userEmail) {
        return this._folderService.getChildFolders(folderIdOrPath, userEmail);
    }
    /**
     * Resolves a folder path to its ID
     * @param folderPathOrId Folder path (e.g., "/Inbox") or ID
     * @param userEmail Email address of the user
     * @returns The resolved folder ID
     */
    async resolveFolderPath(folderPathOrId, userEmail) {
        return this._folderService.resolveFolderPath(folderPathOrId, userEmail);
    }
    /**
     * Get folder path by ID
     * @param folderId Folder ID
     * @param userEmail User email
     * @returns Folder path
     */
    async getFolderPath(folderId, userEmail) {
        return this._folderService.getFolderPath(folderId, userEmail);
    }
    /**
     * Builds a complete folder path map for a user
     * @param userEmail Email address of the user
     * @returns Map of folder IDs to their full paths
     */
    async buildFolderPathMap(userEmail) {
        return this._folderService.buildFolderPathMap(userEmail);
    }
    /**
     * Create a new mail folder
     * @param newFolder New folder details
     * @param userEmail Email address of the user
     * @param parentFolderIdOrPath Optional parent folder ID or path
     * @returns Created mail folder
     */
    async createFolder(newFolder, userEmail, parentFolderIdOrPath) {
        return this._folderService.createFolder(newFolder, userEmail, parentFolderIdOrPath);
    }
    /**
     * Update a mail folder's properties (rename)
     * @param folderIdOrPath ID or path of the folder to update
     * @param updatedFolder Updated folder properties
     * @param userEmail Email address of the user
     * @returns Updated mail folder
     */
    async updateFolder(folderIdOrPath, updatedFolder, userEmail) {
        return this._folderService.updateFolder(folderIdOrPath, updatedFolder, userEmail);
    }
    /**
     * Move a folder to another parent folder
     * @param folderIdOrPath ID or path of the folder to move
     * @param destinationParentFolderIdOrPath ID or path of the destination parent folder
     * @param userEmail Email address of the user
     * @returns Moved mail folder
     */
    async moveFolder(folderIdOrPath, destinationParentFolderIdOrPath, userEmail) {
        return this._folderService.moveFolder(folderIdOrPath, destinationParentFolderIdOrPath, userEmail);
    }
    /**
     * Copy a folder to another parent folder
     * @param folderIdOrPath ID or path of the folder to copy
     * @param destinationParentFolderIdOrPath ID or path of the destination parent folder
     * @param userEmail Email address of the user
     * @returns Copied mail folder
     */
    async copyFolder(folderIdOrPath, destinationParentFolderIdOrPath, userEmail) {
        return this._folderService.copyFolder(folderIdOrPath, destinationParentFolderIdOrPath, userEmail);
    }
    /**
     * List emails in a folder with optional search and date filtering
     * @param folderIdOrPath Folder ID or path (like '/Inbox')
     * @param userEmail Email address of the user
     * @param limit Number of emails to retrieve (default: 25)
     * @param searchOptions Optional search and date filters
     * @returns List of email messages (with optional bodies)
     */
    async listEmails(folderIdOrPath, userEmail, limit = 25, searchOptions) {
        return this._emailService.listEmails(folderIdOrPath, userEmail, limit, searchOptions);
    }
    /**
     * Get a specific email with details
     * @param emailId ID of the email to retrieve
     * @param userEmail Email address of the user
     * @param hideQuotedContent Optional flag to hide quoted content in the email body
     * @returns Email details
     */
    async getEmail(emailId, userEmail, hideQuotedContent = false) {
        return this._emailService.getEmail(emailId, userEmail, hideQuotedContent);
    }
    /**
     * Move an email to another folder
     * @param emailId ID of the email to move
     * @param destinationFolderIdOrPath ID or path of the destination folder
     * @param userEmail Email address of the user
     * @returns Moved email message
     */
    async moveEmail(emailId, destinationFolderIdOrPath, userEmail) {
        return this._emailService.moveEmail(emailId, destinationFolderIdOrPath, userEmail);
    }
    /**
     * Copy an email to another folder
     * @param emailId ID of the email to copy
     * @param destinationFolderIdOrPath ID or path of the destination folder
     * @param userEmail Email address of the user
     * @returns Copied email message
     */
    async copyEmail(emailId, destinationFolderIdOrPath, userEmail) {
        return this._emailService.copyEmail(emailId, destinationFolderIdOrPath, userEmail);
    }
    /**
     * Create a new draft email
     * @param draft Draft email content
     * @param userEmail Email address of the user
     * @returns Created draft email
     */
    async createDraft(draft, userEmail) {
        return this._draftService.createDraft(draft, userEmail);
    }
}
exports.MailService = MailService;
// Export a singleton instance for convenience
exports.mailService = new MailService(authService_1.authService);
// Re-export the interfaces and types from models
__exportStar(require("../../models/folder"), exports);
__exportStar(require("../../models/email"), exports);
__exportStar(require("../../models/draft"), exports);
