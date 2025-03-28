"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCalendarTools = registerCalendarTools;
const zod_1 = require("zod");
const serviceFactory_1 = require("../../services/serviceFactory");
const prompts_1 = require("../../config/prompts");
/**
 * Register calendar-related MCP tools with the server
 * @param server MCP server instance
 */
function registerCalendarTools(server) {
    const calendarConfig = prompts_1.promptConfig.tools.calendar;
    // 1. List calendars tool
    server.tool('list-calendars', {
        userEmail: zod_1.z.string().email().describe(calendarConfig.listCalendars.parameters.userEmail)
    }, async ({ userEmail }) => {
        try {
            const calendarService = serviceFactory_1.ServiceFactory.getCalendarService();
            const calendars = await calendarService.listCalendars(userEmail);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(calendars, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(calendarConfig.listCalendars.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 2. List events tool
    server.tool('list-events', {
        userEmail: zod_1.z.string().email().describe(calendarConfig.listEvents.parameters.userEmail),
        startDateTime: zod_1.z.string().optional().describe(calendarConfig.listEvents.parameters.startDateTime),
        endDateTime: zod_1.z.string().optional().describe(calendarConfig.listEvents.parameters.endDateTime),
        limit: zod_1.z.number().min(1).max(100).optional().default(25).describe(calendarConfig.listEvents.parameters.limit),
        calendarId: zod_1.z.string().optional().describe(calendarConfig.listEvents.parameters.calendarId)
    }, async ({ userEmail, startDateTime, endDateTime, limit, calendarId }) => {
        try {
            const calendarService = serviceFactory_1.ServiceFactory.getCalendarService();
            // Convert ISO date strings to Date objects if provided
            const startDate = startDateTime ? new Date(startDateTime) : undefined;
            const endDate = endDateTime ? new Date(endDateTime) : undefined;
            const events = await calendarService.listEvents(userEmail, startDate, endDate, limit, calendarId);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(events, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(calendarConfig.listEvents.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 3. Get event tool
    server.tool('get-event', {
        userEmail: zod_1.z.string().email().describe(calendarConfig.getEvent.parameters.userEmail),
        eventId: zod_1.z.string().describe(calendarConfig.getEvent.parameters.eventId),
        calendarId: zod_1.z.string().optional().describe(calendarConfig.getEvent.parameters.calendarId)
    }, async ({ userEmail, eventId, calendarId }) => {
        try {
            const calendarService = serviceFactory_1.ServiceFactory.getCalendarService();
            const event = await calendarService.getEvent(eventId, userEmail, calendarId);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(event, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(calendarConfig.getEvent.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 4. Create event tool
    server.tool('create-event', {
        userEmail: zod_1.z.string().email().describe(calendarConfig.createEvent.parameters.userEmail),
        subject: zod_1.z.string().describe(calendarConfig.createEvent.parameters.subject),
        start: zod_1.z.string().describe(calendarConfig.createEvent.parameters.start),
        end: zod_1.z.string().describe(calendarConfig.createEvent.parameters.end),
        timeZone: zod_1.z.string().describe(calendarConfig.createEvent.parameters.timeZone),
        location: zod_1.z.string().optional().describe(calendarConfig.createEvent.parameters.location),
        body: zod_1.z.string().optional().describe(calendarConfig.createEvent.parameters.body),
        contentType: zod_1.z.enum(['text', 'html']).optional().default('text').describe(calendarConfig.createEvent.parameters.contentType),
        isOnlineMeeting: zod_1.z.string().optional().describe(calendarConfig.createEvent.parameters.isOnlineMeeting),
        attendees: zod_1.z.string().optional().describe(calendarConfig.createEvent.parameters.attendees),
        calendarId: zod_1.z.string().optional().describe(calendarConfig.createEvent.parameters.calendarId)
    }, async ({ userEmail, subject, start, end, timeZone, location, body, contentType, isOnlineMeeting, attendees, calendarId }) => {
        try {
            const calendarService = serviceFactory_1.ServiceFactory.getCalendarService();
            // Construct event object
            const newEvent = {
                subject,
                start: {
                    dateTime: start,
                    timeZone
                },
                end: {
                    dateTime: end,
                    timeZone
                },
                isAllDay: false,
                isOnlineMeeting: isOnlineMeeting === 'true'
            };
            // Add optional fields if provided
            if (location) {
                newEvent.location = {
                    displayName: location
                };
            }
            if (body) {
                newEvent.body = {
                    contentType: contentType,
                    content: body
                };
            }
            if (attendees) {
                try {
                    const attendeeList = JSON.parse(attendees);
                    if (Array.isArray(attendeeList)) {
                        newEvent.attendees = attendeeList.map(attendee => ({
                            emailAddress: {
                                address: attendee.email,
                                name: attendee.name
                            },
                            type: attendee.type || 'required'
                        }));
                    }
                }
                catch (e) {
                    // If parsing fails, ignore attendees
                }
            }
            const result = await calendarService.createEvent(newEvent, userEmail, calendarId);
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(calendarConfig.createEvent.responses.success, { subject })
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(calendarConfig.createEvent.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 5. Update event tool
    server.tool('update-event', {
        userEmail: zod_1.z.string().email().describe(calendarConfig.updateEvent.parameters.userEmail),
        eventId: zod_1.z.string().describe(calendarConfig.updateEvent.parameters.eventId),
        subject: zod_1.z.string().optional().describe(calendarConfig.updateEvent.parameters.subject),
        start: zod_1.z.string().optional().describe(calendarConfig.updateEvent.parameters.start),
        end: zod_1.z.string().optional().describe(calendarConfig.updateEvent.parameters.end),
        timeZone: zod_1.z.string().optional().describe(calendarConfig.updateEvent.parameters.timeZone),
        location: zod_1.z.string().optional().describe(calendarConfig.updateEvent.parameters.location),
        body: zod_1.z.string().optional().describe(calendarConfig.updateEvent.parameters.body),
        contentType: zod_1.z.enum(['text', 'html']).optional().describe(calendarConfig.updateEvent.parameters.contentType),
        isOnlineMeeting: zod_1.z.string().optional().describe(calendarConfig.updateEvent.parameters.isOnlineMeeting),
        attendees: zod_1.z.string().optional().describe(calendarConfig.updateEvent.parameters.attendees),
        calendarId: zod_1.z.string().optional().describe(calendarConfig.updateEvent.parameters.calendarId)
    }, async ({ userEmail, eventId, subject, start, end, timeZone, location, body, contentType, isOnlineMeeting, attendees, calendarId }) => {
        try {
            const calendarService = serviceFactory_1.ServiceFactory.getCalendarService();
            // Construct event update object
            const eventUpdate = {};
            // Add fields only if they're provided
            if (subject !== undefined) {
                eventUpdate.subject = subject;
            }
            if (start !== undefined && timeZone !== undefined) {
                eventUpdate.start = {
                    dateTime: start,
                    timeZone
                };
            }
            if (end !== undefined && timeZone !== undefined) {
                eventUpdate.end = {
                    dateTime: end,
                    timeZone
                };
            }
            if (isOnlineMeeting !== undefined) {
                eventUpdate.isOnlineMeeting = isOnlineMeeting === 'true';
            }
            if (location !== undefined) {
                eventUpdate.location = {
                    displayName: location
                };
            }
            if (body !== undefined) {
                eventUpdate.body = {
                    contentType: contentType || 'text',
                    content: body
                };
            }
            if (attendees !== undefined) {
                try {
                    const attendeeList = JSON.parse(attendees);
                    if (Array.isArray(attendeeList)) {
                        eventUpdate.attendees = attendeeList.map(attendee => ({
                            emailAddress: {
                                address: attendee.email,
                                name: attendee.name
                            },
                            type: attendee.type || 'required'
                        }));
                    }
                }
                catch (e) {
                    // If parsing fails, ignore attendees
                }
            }
            // Only update if there's at least one change
            if (Object.keys(eventUpdate).length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: 'No updates provided. Event remains unchanged.'
                        }]
                };
            }
            const result = await calendarService.updateEvent(eventId, eventUpdate, userEmail, calendarId);
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(calendarConfig.updateEvent.responses.success, {})
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(calendarConfig.updateEvent.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
    // 6. Delete event tool
    server.tool('delete-event', {
        userEmail: zod_1.z.string().email().describe(calendarConfig.deleteEvent.parameters.userEmail),
        eventId: zod_1.z.string().describe(calendarConfig.deleteEvent.parameters.eventId),
        calendarId: zod_1.z.string().optional().describe(calendarConfig.deleteEvent.parameters.calendarId)
    }, async ({ userEmail, eventId, calendarId }) => {
        try {
            const calendarService = serviceFactory_1.ServiceFactory.getCalendarService();
            await calendarService.deleteEvent(eventId, userEmail, calendarId);
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(calendarConfig.deleteEvent.responses.success, {})
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: (0, prompts_1.formatMessage)(calendarConfig.deleteEvent.responses.error, { error: String(error) })
                    }],
                isError: true
            };
        }
    });
}
