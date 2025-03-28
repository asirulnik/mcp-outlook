/**
 * Configuration for email-related tool descriptions, parameters, and responses
 */
export const emailToolsConfig = {
  listEmails: {
    description: "List emails in a specified mail folder with options for filtering and sorting",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      folderId: "ID or path of the folder to list emails from",
      limit: "Maximum number of emails to retrieve (1-100)",
      includeBodies: "Whether to include full message bodies in results",
      hideQuotedContent: "Whether to hide quoted content in message bodies",
      searchOptions: {
        description: "Options for filtering and sorting emails",
        beforeDate: "Only include emails received before this date (ISO format)",
        afterDate: "Only include emails received after this date (ISO format)",
        previousPeriod: "Only include emails from a specific previous time period",
        searchQuery: "Text to search for in emails",
        searchFields: "Fields to search in (subject, body, from, recipients, or all)",
        sortBy: "Field to sort results by (receivedDateTime, sentDateTime, subject, importance)",
        sortOrder: "Order to sort results (asc or desc)"
      }
    },
    responses: {
      success: "Successfully retrieved {count} emails from folder",
      error: "Error listing emails: {error}"
    }
  },
  
  readEmail: {
    description: "Get the detailed content of a specific email",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      emailId: "ID of the email to retrieve",
      convertHtmlToText: "Whether to convert HTML content to plain text",
      hideQuotedContent: "Whether to hide quoted content in the email body",
      htmlToTextOptions: "Options for HTML to plain text conversion"
    },
    responses: {
      success: "Successfully retrieved email details",
      error: "Error reading email: {error}"
    }
  },
  
  moveEmail: {
    description: "Move an email to a different folder",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      emailId: "ID of the email to move",
      destinationFolderId: "ID or path of the destination folder"
    },
    responses: {
      success: "Email {emailId} successfully moved to folder {destinationFolderId}",
      error: "Error moving email: {error}"
    }
  },
  
  copyEmail: {
    description: "Copy an email to a different folder",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      emailId: "ID of the email to copy",
      destinationFolderId: "ID or path of the destination folder"
    },
    responses: {
      success: "Email {emailId} successfully copied to folder {destinationFolderId}",
      error: "Error copying email: {error}"
    }
  },
  
  listAttachments: {
    description: "List all attachments in a specific email",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      emailId: "ID of the email containing the attachments"
    },
    responses: {
      success: "Successfully retrieved {count} attachments from email",
      error: "Error listing attachments: {error}"
    }
  },
  
  downloadAttachment: {
    description: "Download an attachment from a specific email",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      emailId: "ID of the email containing the attachment",
      attachmentId: "ID of the attachment to download"
    },
    responses: {
      success: "Successfully downloaded attachment {name}",
      error: "Error downloading attachment: {error}"
    }
  },
  
  convertHtmlToText: {
    description: "Convert HTML content to plain text",
    parameters: {
      html: "HTML content to convert",
      options: {
        description: "Options for HTML to text conversion",
        wordwrap: "Whether and at what column to wrap text",
        preserveNewlines: "Whether to preserve newlines in the original HTML",
        tables: "Whether to format tables in a human-readable way",
        preserveHrefLinks: "Whether to preserve links in the text",
        headingStyle: "How to format headings",
        bulletIndent: "Number of spaces to indent bullet lists",
        listIndent: "Number of spaces to indent all lists",
        maxLineLength: "Maximum length of a line",
        hideQuotedContent: "Whether to hide quoted content"
      }
    },
    responses: {
      success: "Successfully converted HTML to plain text",
      error: "Error converting HTML to text: {error}"
    }
  }
};
