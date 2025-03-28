/**
 * Models and interfaces related to email drafts
 */

/**
 * Interface for creating a new email draft
 */
export interface NewEmailDraft {
  subject: string;
  body: {
    contentType: string; // 'Text' or 'HTML'
    content: string;
  };
  toRecipients: {
    emailAddress: {
      address: string;
      name?: string;
    }
  }[];
  ccRecipients?: {
    emailAddress: {
      address: string;
      name?: string;
    }
  }[];
  bccRecipients?: {
    emailAddress: {
      address: string;
      name?: string;
    }
  }[];
}

/**
 * Interface for email draft with optional recipients
 * Used in some scenarios where certain recipient types are optional
 */
export interface DraftWithOptionalRecipients {
  subject: string;
  body: {
    contentType: string;
    content: string;
  };
  toRecipients: {
    emailAddress: {
      address: string;
    };
  }[];
  ccRecipients?: {
    emailAddress: {
      address: string;
    };
  }[];
  bccRecipients?: {
    emailAddress: {
      address: string;
    };
  }[];
}
