/**
 * Models and interfaces related to emails
 */

/**
 * Represents a basic email message
 */
export interface EmailMessage {
  id: string;
  subject?: string;
  from?: {
    emailAddress: {
      name?: string;
      address: string;
    }
  };
  receivedDateTime?: string;
  bodyPreview?: string;
  hasAttachments?: boolean;
  isRead?: boolean;
}

/**
 * Represents detailed email information, extending the basic email message
 */
export interface EmailDetails extends EmailMessage {
  body?: {
    contentType: string;
    content: string;
    originalContent?: string; // Original content before filtering quoted text
    plainTextContent?: string; // HTML converted to text (if applicable)
    originalPlainTextContent?: string; // Original HTML converted to text (if applicable)
  };
  toRecipients?: {
    emailAddress: {
      name?: string;
      address: string;
    }
  }[];
  ccRecipients?: {
    emailAddress: {
      name?: string;
      address: string;
    }
  }[];
  attachments?: {
    id: string;
    name: string;
    contentType: string;
    size: number;
  }[];
}

/**
 * Interface for email search and filter options
 */
export interface EmailSearchOptions {
  beforeDate?: Date;
  afterDate?: Date;
  previousPeriod?: {
    value: number;
    unit: 'days' | 'weeks' | 'months' | 'years';
  };
  searchQuery?: string;
  searchFields?: ('subject' | 'body' | 'from' | 'recipients' | 'all')[];
  includeBodies?: boolean; // Flag to include full message bodies in results
  hideQuotedContent?: boolean; // Flag to hide quoted content in message bodies
  sortBy?: 'receivedDateTime' | 'sentDateTime' | 'subject' | 'importance'; // Field to sort by
  sortOrder?: 'asc' | 'desc'; // Sort order (ascending or descending)
}
