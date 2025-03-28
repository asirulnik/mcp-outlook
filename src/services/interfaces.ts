import { Client } from '@microsoft/microsoft-graph-client';
import { MailFolder, NewMailFolder } from '../models/folder';
import { EmailMessage, EmailDetails, EmailSearchOptions } from '../models/email';
import { NewEmailDraft, DraftWithOptionalRecipients } from '../models/draft';
import { Calendar, CalendarEvent, NewCalendarEvent, CalendarSearchOptions } from '../models/calendar';

/**
 * Interface for authentication service
 */
export interface IAuthService {
  /**
   * Get the Microsoft Graph client with proper authentication
   */
  getClient(): Client;
}

/**
 * Interface for mail folder operations
 */
export interface IFolderService {
  /**
   * Get mail folders for a specific user
   * @param userEmail Email address of the user
   * @returns List of mail folders
   */
  getMailFolders(userEmail: string): Promise<MailFolder[]>;
  
  /**
   * Get child folders for a specific mail folder
   * @param folderIdOrPath Folder ID or path (like '/Inbox')
   * @param userEmail Email address of the user
   * @returns List of child mail folders
   */
  getChildFolders(folderIdOrPath: string, userEmail: string): Promise<MailFolder[]>;
  
  /**
   * Resolves a folder path to its ID
   * @param folderPathOrId Folder path (e.g., "/Inbox") or ID
   * @param userEmail Email address of the user
   * @returns The resolved folder ID
   */
  resolveFolderPath(folderPathOrId: string, userEmail: string): Promise<string>;
  
  /**
   * Get folder path by ID
   * @param folderId Folder ID
   * @param userEmail User email
   * @returns Folder path
   */
  getFolderPath(folderId: string, userEmail: string): Promise<string>;
  
  /**
   * Create a new mail folder
   * @param newFolder New folder details
   * @param userEmail Email address of the user
   * @param parentFolderIdOrPath Optional parent folder ID or path
   * @returns Created mail folder
   */
  createFolder(newFolder: NewMailFolder, userEmail: string, parentFolderIdOrPath?: string): Promise<MailFolder>;
  
  /**
   * Update a mail folder's properties (rename)
   * @param folderIdOrPath ID or path of the folder to update
   * @param updatedFolder Updated folder properties
   * @param userEmail Email address of the user
   * @returns Updated mail folder
   */
  updateFolder(folderIdOrPath: string, updatedFolder: Partial<NewMailFolder>, userEmail: string): Promise<MailFolder>;
  
  /**
   * Move a folder to another parent folder
   * @param folderIdOrPath ID or path of the folder to move
   * @param destinationParentFolderIdOrPath ID or path of the destination parent folder
   * @param userEmail Email address of the user
   * @returns Moved mail folder
   */
  moveFolder(folderIdOrPath: string, destinationParentFolderIdOrPath: string, userEmail: string): Promise<MailFolder>;
  
  /**
   * Copy a folder to another parent folder
   * @param folderIdOrPath ID or path of the folder to copy
   * @param destinationParentFolderIdOrPath ID or path of the destination parent folder
   * @param userEmail Email address of the user
   * @returns Copied mail folder
   */
  copyFolder(folderIdOrPath: string, destinationParentFolderIdOrPath: string, userEmail: string): Promise<MailFolder>;
  
  /**
   * Builds a complete folder path map for a user
   * @param userEmail Email address of the user
   * @returns Map of folder IDs to their full paths
   */
  buildFolderPathMap(userEmail: string): Promise<Map<string, string>>;
}

/**
 * Interface representing an email attachment
 */
export interface EmailAttachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
  contentBytes?: string; // Base64 encoded content
}

/**
 * Interface for email operations
 */
export interface IEmailService {
  /**
   * List emails in a folder with optional search and date filtering
   * @param folderIdOrPath Folder ID or path (like '/Inbox')
   * @param userEmail Email address of the user
   * @param limit Number of emails to retrieve
   * @param searchOptions Optional search and date filters
   * @returns List of email messages (with optional bodies)
   */
  listEmails(
    folderIdOrPath: string, 
    userEmail: string, 
    limit?: number, 
    searchOptions?: EmailSearchOptions
  ): Promise<EmailMessage[] | EmailDetails[]>;
  
  /**
   * Get a specific email with details
   * @param emailId ID of the email to retrieve
   * @param userEmail Email address of the user
   * @param hideQuotedContent Optional flag to hide quoted content in the email body
   * @returns Email details
   */
  getEmail(emailId: string, userEmail: string, hideQuotedContent?: boolean): Promise<EmailDetails>;
  
  /**
   * Move an email to another folder
   * @param emailId ID of the email to move
   * @param destinationFolderIdOrPath ID or path of the destination folder
   * @param userEmail Email address of the user
   * @returns Moved email message
   */
  moveEmail(emailId: string, destinationFolderIdOrPath: string, userEmail: string): Promise<EmailMessage>;
  
  /**
   * Copy an email to another folder
   * @param emailId ID of the email to copy
   * @param destinationFolderIdOrPath ID or path of the destination folder
   * @param userEmail Email address of the user
   * @returns Copied email message
   */
  copyEmail(emailId: string, destinationFolderIdOrPath: string, userEmail: string): Promise<EmailMessage>;
  
  /**
   * Download an attachment from an email
   * @param emailId ID of the email containing the attachment
   * @param attachmentId ID of the attachment to download
   * @param userEmail Email address of the user
   * @returns Attachment with content
   */
  downloadAttachment(emailId: string, attachmentId: string, userEmail: string): Promise<EmailAttachment>;
  
  /**
   * List attachments for a specific email
   * @param emailId ID of the email
   * @param userEmail Email address of the user
   * @returns List of attachments
   */
  listAttachments(emailId: string, userEmail: string): Promise<EmailAttachment[]>;
}

/**
 * Interface for draft operations
 */
export interface IDraftService {
  /**
   * Create a new draft email
   * @param draft Draft email content
   * @param userEmail Email address of the user
   * @returns Created draft email
   */
  createDraft(draft: NewEmailDraft, userEmail: string): Promise<EmailMessage>;

  /**
   * List draft emails
   * @param userEmail Email address of the user
   * @param limit Maximum number of drafts to retrieve
   * @returns List of draft emails
   */
  listDrafts(userEmail: string, limit?: number): Promise<EmailMessage[]>;

  /**
   * Get a specific draft
   * @param draftId ID of the draft to retrieve
   * @param userEmail Email address of the user
   * @returns Draft email details
   */
  getDraft(draftId: string, userEmail: string): Promise<EmailDetails>;

  /**
   * Update an existing draft
   * @param draftId ID of the draft to update
   * @param draftUpdates Updated draft content
   * @param userEmail Email address of the user
   * @returns Updated draft email
   */
  updateDraft(draftId: string, draftUpdates: Partial<DraftWithOptionalRecipients>, userEmail: string): Promise<EmailMessage>;

  /**
   * Send an existing draft
   * @param draftId ID of the draft to send
   * @param userEmail Email address of the user
   * @returns Void promise indicating success
   */
  sendDraft(draftId: string, userEmail: string): Promise<void>;

  /**
   * Delete a draft email
   * @param draftId ID of the draft to delete
   * @param userEmail Email address of the user
   * @returns Void promise indicating success
   */
  deleteDraft(draftId: string, userEmail: string): Promise<void>;
}

/**
 * Interface for calendar operations
 */
export interface ICalendarService {
  /**
   * List all calendars for a user
   * @param userEmail Email address of the user
   * @returns List of calendars
   */
  listCalendars(userEmail: string): Promise<Calendar[]>;

  /**
   * List events in a calendar with optional time range
   * @param userEmail Email address of the user
   * @param startDateTime Optional start date and time
   * @param endDateTime Optional end date and time
   * @param limit Maximum number of events to retrieve
   * @param calendarId Optional ID of the specific calendar (defaults to primary)
   * @returns List of calendar events
   */
  listEvents(
    userEmail: string,
    startDateTime?: Date,
    endDateTime?: Date,
    limit?: number,
    calendarId?: string
  ): Promise<CalendarEvent[]>;

  /**
   * Get a specific event
   * @param eventId ID of the event to retrieve
   * @param userEmail Email address of the user
   * @param calendarId Optional ID of the specific calendar (defaults to primary)
   * @returns Calendar event details
   */
  getEvent(eventId: string, userEmail: string, calendarId?: string): Promise<CalendarEvent>;

  /**
   * Create a new calendar event
   * @param event New event details
   * @param userEmail Email address of the user
   * @param calendarId Optional ID of the specific calendar (defaults to primary)
   * @returns Created calendar event
   */
  createEvent(event: NewCalendarEvent, userEmail: string, calendarId?: string): Promise<CalendarEvent>;

  /**
   * Update an existing calendar event
   * @param eventId ID of the event to update
   * @param event Updated event details
   * @param userEmail Email address of the user
   * @param calendarId Optional ID of the specific calendar (defaults to primary)
   * @returns Updated calendar event
   */
  updateEvent(
    eventId: string,
    event: Partial<NewCalendarEvent>,
    userEmail: string,
    calendarId?: string
  ): Promise<CalendarEvent>;

  /**
   * Delete a calendar event
   * @param eventId ID of the event to delete
   * @param userEmail Email address of the user
   * @param calendarId Optional ID of the specific calendar (defaults to primary)
   * @returns Void promise indicating success
   */
  deleteEvent(eventId: string, userEmail: string, calendarId?: string): Promise<void>;
}
