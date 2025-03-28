"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const errors_1 = require("../../../utils/errors");
/**
 * Service for handling calendar operations
 */
class CalendarService {
    constructor(authService) {
        this.client = authService.getClient();
    }
    /**
     * List all calendars for a user
     * @param userEmail Email address of the user
     * @returns List of calendars
     */
    async listCalendars(userEmail) {
        try {
            if (!userEmail) {
                throw new errors_1.ValidationError('User email is required for application permissions flow');
            }
            // Build the API endpoint
            const endpoint = `/users/${userEmail}/calendars`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .get();
            return response.value;
        }
        catch (error) {
            console.error('Error listing calendars:', error);
            return (0, errors_1.handleGraphError)(error);
        }
    }
    /**
     * List events in a calendar with optional time range
     * @param userEmail Email address of the user
     * @param startDateTime Optional start date and time
     * @param endDateTime Optional end date and time
     * @param limit Maximum number of events to retrieve
     * @param calendarId Optional ID of the specific calendar (defaults to primary)
     * @returns List of calendar events
     */
    async listEvents(userEmail, startDateTime, endDateTime, limit = 25, calendarId) {
        try {
            if (!userEmail) {
                throw new errors_1.ValidationError('User email is required for application permissions flow');
            }
            // Build the API endpoint based on whether a specific calendar is requested
            const endpoint = calendarId
                ? `/users/${userEmail}/calendars/${calendarId}/events`
                : `/users/${userEmail}/calendar/events`;
            // Start building the query parameters
            let queryParams = `?$top=${limit}`;
            // Add filter for date range if provided
            if (startDateTime || endDateTime) {
                let filterParams = [];
                if (startDateTime) {
                    filterParams.push(`start/dateTime ge '${startDateTime.toISOString()}'`);
                }
                if (endDateTime) {
                    filterParams.push(`end/dateTime le '${endDateTime.toISOString()}'`);
                }
                if (filterParams.length > 0) {
                    queryParams += `&$filter=${filterParams.join(' and ')}`;
                }
            }
            // Add ordering by start time
            queryParams += `&$orderby=start/dateTime`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(`${endpoint}${queryParams}`)
                .get();
            return response.value;
        }
        catch (error) {
            console.error('Error listing events:', error);
            return (0, errors_1.handleGraphError)(error);
        }
    }
    /**
     * Get a specific event
     * @param eventId ID of the event to retrieve
     * @param userEmail Email address of the user
     * @param calendarId Optional ID of the specific calendar (defaults to primary)
     * @returns Calendar event details
     */
    async getEvent(eventId, userEmail, calendarId) {
        try {
            if (!userEmail) {
                throw new errors_1.ValidationError('User email is required for application permissions flow');
            }
            if (!eventId) {
                throw new errors_1.ValidationError('Event ID is required');
            }
            // Build the API endpoint based on whether a specific calendar is requested
            const endpoint = calendarId
                ? `/users/${userEmail}/calendars/${calendarId}/events/${eventId}`
                : `/users/${userEmail}/calendar/events/${eventId}`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .get();
            return response;
        }
        catch (error) {
            console.error('Error getting event details:', error);
            return (0, errors_1.handleGraphError)(error);
        }
    }
    /**
     * Create a new calendar event
     * @param event New event details
     * @param userEmail Email address of the user
     * @param calendarId Optional ID of the specific calendar (defaults to primary)
     * @returns Created calendar event
     */
    async createEvent(event, userEmail, calendarId) {
        try {
            if (!userEmail) {
                throw new errors_1.ValidationError('User email is required for application permissions flow');
            }
            if (!event) {
                throw new errors_1.ValidationError('Event details are required');
            }
            // Validate required fields
            if (!event.subject) {
                throw new errors_1.ValidationError('Event subject is required');
            }
            if (!event.start || !event.end) {
                throw new errors_1.ValidationError('Event start and end times are required');
            }
            // Build the API endpoint based on whether a specific calendar is requested
            const endpoint = calendarId
                ? `/users/${userEmail}/calendars/${calendarId}/events`
                : `/users/${userEmail}/calendar/events`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .post(event);
            return response;
        }
        catch (error) {
            console.error('Error creating event:', error);
            return (0, errors_1.handleGraphError)(error);
        }
    }
    /**
     * Update an existing calendar event
     * @param eventId ID of the event to update
     * @param event Updated event details
     * @param userEmail Email address of the user
     * @param calendarId Optional ID of the specific calendar (defaults to primary)
     * @returns Updated calendar event
     */
    async updateEvent(eventId, event, userEmail, calendarId) {
        try {
            if (!userEmail) {
                throw new errors_1.ValidationError('User email is required for application permissions flow');
            }
            if (!eventId) {
                throw new errors_1.ValidationError('Event ID is required');
            }
            if (!event || Object.keys(event).length === 0) {
                throw new errors_1.ValidationError('Event update details are required');
            }
            // Build the API endpoint based on whether a specific calendar is requested
            const endpoint = calendarId
                ? `/users/${userEmail}/calendars/${calendarId}/events/${eventId}`
                : `/users/${userEmail}/calendar/events/${eventId}`;
            // Make the request to Microsoft Graph
            const response = await this.client
                .api(endpoint)
                .patch(event);
            return response;
        }
        catch (error) {
            console.error('Error updating event:', error);
            return (0, errors_1.handleGraphError)(error);
        }
    }
    /**
     * Delete a calendar event
     * @param eventId ID of the event to delete
     * @param userEmail Email address of the user
     * @param calendarId Optional ID of the specific calendar (defaults to primary)
     * @returns Void promise indicating success
     */
    async deleteEvent(eventId, userEmail, calendarId) {
        try {
            if (!userEmail) {
                throw new errors_1.ValidationError('User email is required for application permissions flow');
            }
            if (!eventId) {
                throw new errors_1.ValidationError('Event ID is required');
            }
            // Build the API endpoint based on whether a specific calendar is requested
            const endpoint = calendarId
                ? `/users/${userEmail}/calendars/${calendarId}/events/${eventId}`
                : `/users/${userEmail}/calendar/events/${eventId}`;
            // Make the request to Microsoft Graph
            await this.client
                .api(endpoint)
                .delete();
            return;
        }
        catch (error) {
            console.error('Error deleting event:', error);
            return (0, errors_1.handleGraphError)(error);
        }
    }
}
exports.CalendarService = CalendarService;
