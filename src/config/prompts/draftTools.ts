/**
 * Configuration for draft-related tool descriptions, parameters, and responses
 */
export const draftToolsConfig = {
  createDraft: {
    description: "Create a new draft email in the user's drafts folder",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      subject: "Subject line for the draft email",
      body: "Content of the email",
      contentType: "Format of the email body (HTML or text)",
      toRecipients: "List of primary recipients",
      ccRecipients: "List of CC recipients",
      bccRecipients: "List of BCC recipients"
    },
    responses: {
      success: "Successfully created draft email with subject '{subject}'",
      error: "Error creating draft: {error}"
    }
  },
  
  updateDraft: {
    description: "Update an existing draft email",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      draftId: "ID of the draft to update",
      subject: "New subject line (optional)",
      body: "New content of the email (optional)",
      contentType: "Format of the email body (HTML or text, optional)",
      toRecipients: "New list of primary recipients (optional)",
      ccRecipients: "New list of CC recipients (optional)",
      bccRecipients: "New list of BCC recipients (optional)"
    },
    responses: {
      success: "Successfully updated draft email",
      error: "Error updating draft: {error}"
    }
  },
  
  sendDraft: {
    description: "Send an existing draft email",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      draftId: "ID of the draft to send"
    },
    responses: {
      success: "Successfully sent email",
      error: "Error sending draft: {error}"
    }
  },
  
  listDrafts: {
    description: "List all draft emails",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      limit: "Maximum number of drafts to retrieve (1-100)"
    },
    responses: {
      success: "Successfully retrieved {count} draft emails",
      error: "Error listing drafts: {error}"
    }
  },
  
  getDraft: {
    description: "Get the detailed content of a specific draft email",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      draftId: "ID of the draft to retrieve"
    },
    responses: {
      success: "Successfully retrieved draft details",
      error: "Error retrieving draft: {error}"
    }
  },
  
  deleteDraft: {
    description: "Delete a draft email",
    parameters: {
      userEmail: "Email address of the user whose mailbox to access",
      draftId: "ID of the draft to delete"
    },
    responses: {
      success: "Successfully deleted draft email",
      error: "Error deleting draft: {error}"
    }
  }
};
