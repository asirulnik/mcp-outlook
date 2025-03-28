"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarToolsConfig = void 0;
/**
 * Configuration for calendar-related tool descriptions, parameters, and responses
 */
exports.calendarToolsConfig = {
    listEvents: {
        description: "List calendar events within a specified time range",
        parameters: {
            userEmail: "Email address of the user whose calendar to access",
            startDateTime: "Start date and time for the range (ISO format)",
            endDateTime: "End date and time for the range (ISO format)",
            limit: "Maximum number of events to retrieve (1-100)",
            calendarId: "Optional ID of the specific calendar to use (defaults to primary)"
        },
        responses: {
            success: "Successfully retrieved {count} calendar events",
            error: "Error listing events: {error}"
        }
    },
    getEvent: {
        description: "Get the detailed information of a specific calendar event",
        parameters: {
            userEmail: "Email address of the user whose calendar to access",
            eventId: "ID of the event to retrieve",
            calendarId: "Optional ID of the specific calendar (defaults to primary)"
        },
        responses: {
            success: "Successfully retrieved event details",
            error: "Error retrieving event: {error}"
        }
    },
    createEvent: {
        description: "Create a new calendar event",
        parameters: {
            userEmail: "Email address of the user whose calendar to access",
            subject: "Title of the event",
            start: "Start date and time (ISO format)",
            end: "End date and time (ISO format)",
            timeZone: "Time zone for the event times",
            location: "Optional location for the event",
            body: "Optional body/description of the event",
            contentType: "Format of the body content (HTML or text)",
            attendees: "Optional list of attendees",
            isOnlineMeeting: "Whether to create an online meeting for this event",
            calendarId: "Optional ID of the specific calendar (defaults to primary)"
        },
        responses: {
            success: "Successfully created event '{subject}'",
            error: "Error creating event: {error}"
        }
    },
    updateEvent: {
        description: "Update an existing calendar event",
        parameters: {
            userEmail: "Email address of the user whose calendar to access",
            eventId: "ID of the event to update",
            subject: "New title of the event (optional)",
            start: "New start date and time (optional, ISO format)",
            end: "New end date and time (optional, ISO format)",
            timeZone: "New time zone for the event times (optional)",
            location: "New location for the event (optional)",
            body: "New body/description of the event (optional)",
            contentType: "Format of the body content (HTML or text, optional)",
            attendees: "New list of attendees (optional)",
            isOnlineMeeting: "Whether this event should be an online meeting (optional)",
            calendarId: "Optional ID of the specific calendar (defaults to primary)"
        },
        responses: {
            success: "Successfully updated event",
            error: "Error updating event: {error}"
        }
    },
    deleteEvent: {
        description: "Delete a calendar event",
        parameters: {
            userEmail: "Email address of the user whose calendar to access",
            eventId: "ID of the event to delete",
            calendarId: "Optional ID of the specific calendar (defaults to primary)"
        },
        responses: {
            success: "Successfully deleted event",
            error: "Error deleting event: {error}"
        }
    },
    listCalendars: {
        description: "List all available calendars for a user",
        parameters: {
            userEmail: "Email address of the user whose calendars to access"
        },
        responses: {
            success: "Successfully retrieved {count} calendars",
            error: "Error listing calendars: {error}"
        }
    }
};
