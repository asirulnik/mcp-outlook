"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftService = void 0;
const graphConfig_1 = require("../../config/graphConfig");
/**
 * Service for handling email draft operations
 */
class DraftService {
    constructor(authService) {
        this.client = authService.getClient();
    }
    /**
     * Create a new draft email
     * @param draft Draft email content
     * @param userEmail Email address of the user
     * @returns Created draft email
     */
    async createDraft(draft, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint for creating a message in drafts folder
            const endpoint = `/users/${userEmail}/messages`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .post(draft);
            return response;
        }
        catch (error) {
            console.error('Error creating draft:', error);
            throw error;
        }
    }
    /**
     * List draft emails
     * @param userEmail Email address of the user
     * @param limit Maximum number of drafts to retrieve
     * @returns List of draft emails
     */
    async listDrafts(userEmail, limit = 25) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint to get messages from drafts folder
            const endpoint = `/users/${userEmail}/mailFolders/drafts/messages`;
            // Get base query parameters
            let queryParams = graphConfig_1.graphConfig.emailQueryParams(limit, false);
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(`${endpoint}${queryParams}`)
                .get();
            return response.value;
        }
        catch (error) {
            console.error('Error listing drafts:', error);
            throw error;
        }
    }
    /**
     * Get a specific draft
     * @param draftId ID of the draft to retrieve
     * @param userEmail Email address of the user
     * @returns Draft email details
     */
    async getDraft(draftId, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${draftId}`;
            // Query parameters to include body
            const queryParams = graphConfig_1.graphConfig.emailDetailsQueryParams;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(`${endpoint}${queryParams}`)
                .get();
            return response;
        }
        catch (error) {
            console.error('Error getting draft details:', error);
            throw error;
        }
    }
    /**
     * Update an existing draft
     * @param draftId ID of the draft to update
     * @param draftUpdates Updated draft content
     * @param userEmail Email address of the user
     * @returns Updated draft email
     */
    async updateDraft(draftId, draftUpdates, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${draftId}`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .patch(draftUpdates);
            return response;
        }
        catch (error) {
            console.error('Error updating draft:', error);
            throw error;
        }
    }
    /**
     * Send an existing draft
     * @param draftId ID of the draft to send
     * @param userEmail Email address of the user
     * @returns Void promise indicating success
     */
    async sendDraft(draftId, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${draftId}/send`;
            // Make the request to Microsoft Graph
            await this.client
                .api(endpoint)
                .post({});
            return;
        }
        catch (error) {
            console.error('Error sending draft:', error);
            throw error;
        }
    }
    /**
     * Delete a draft email
     * @param draftId ID of the draft to delete
     * @param userEmail Email address of the user
     * @returns Void promise indicating success
     */
    async deleteDraft(draftId, userEmail) {
        try {
            if (!userEmail) {
                throw new Error('User email is required for application permissions flow');
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/messages/${draftId}`;
            // Make the request to Microsoft Graph
            await this.client
                .api(endpoint)
                .delete();
            return;
        }
        catch (error) {
            console.error('Error deleting draft:', error);
            throw error;
        }
    }
}
exports.DraftService = DraftService;
