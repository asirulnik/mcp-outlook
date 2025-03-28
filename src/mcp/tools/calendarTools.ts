import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServiceFactory } from '../../services/serviceFactory';
import { NewCalendarEvent } from '../../models/calendar';
import { promptConfig, formatMessage } from '../../config/prompts';

/**
 * Register calendar-related MCP tools with the server
 * @param server MCP server instance
 */
export function registerCalendarTools(server: McpServer): void {
  const calendarConfig = promptConfig.tools.calendar;

  // 1. List calendars tool
  server.tool(
    'list-calendars',
    { 
      userEmail: z.string().email().describe(calendarConfig.listCalendars.parameters.userEmail)
    },
    async ({ userEmail }) => {
      try {
        const calendarService = ServiceFactory.getCalendarService();
        const calendars = await calendarService.listCalendars(userEmail);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(calendars, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(calendarConfig.listCalendars.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 2. List events tool
  server.tool(
    'list-events',
    { 
      userEmail: z.string().email().describe(calendarConfig.listEvents.parameters.userEmail),
      startDateTime: z.string().optional().describe(calendarConfig.listEvents.parameters.startDateTime),
      endDateTime: z.string().optional().describe(calendarConfig.listEvents.parameters.endDateTime),
      limit: z.number().min(1).max(100).optional().default(25).describe(calendarConfig.listEvents.parameters.limit),
      calendarId: z.string().optional().describe(calendarConfig.listEvents.parameters.calendarId)
    },
    async ({ userEmail, startDateTime, endDateTime, limit, calendarId }) => {
      try {
        const calendarService = ServiceFactory.getCalendarService();
        
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
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(calendarConfig.listEvents.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 3. Get event tool
  server.tool(
    'get-event',
    { 
      userEmail: z.string().email().describe(calendarConfig.getEvent.parameters.userEmail),
      eventId: z.string().describe(calendarConfig.getEvent.parameters.eventId),
      calendarId: z.string().optional().describe(calendarConfig.getEvent.parameters.calendarId)
    },
    async ({ userEmail, eventId, calendarId }) => {
      try {
        const calendarService = ServiceFactory.getCalendarService();
        const event = await calendarService.getEvent(eventId, userEmail, calendarId);
        
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify(event, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(calendarConfig.getEvent.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 4. Create event tool
  server.tool(
    'create-event',
    { 
      userEmail: z.string().email().describe(calendarConfig.createEvent.parameters.userEmail),
      subject: z.string().describe(calendarConfig.createEvent.parameters.subject),
      start: z.string().describe(calendarConfig.createEvent.parameters.start),
      end: z.string().describe(calendarConfig.createEvent.parameters.end),
      timeZone: z.string().describe(calendarConfig.createEvent.parameters.timeZone),
      location: z.string().optional().describe(calendarConfig.createEvent.parameters.location),
      body: z.string().optional().describe(calendarConfig.createEvent.parameters.body),
      contentType: z.enum(['text', 'html']).optional().default('text').describe(calendarConfig.createEvent.parameters.contentType),
      isOnlineMeeting: z.string().optional().describe(calendarConfig.createEvent.parameters.isOnlineMeeting),
      attendees: z.string().optional().describe(calendarConfig.createEvent.parameters.attendees),
      calendarId: z.string().optional().describe(calendarConfig.createEvent.parameters.calendarId)
    },
    async ({ 
      userEmail, subject, start, end, timeZone, location, 
      body, contentType, isOnlineMeeting, attendees, calendarId 
    }) => {
      try {
        const calendarService = ServiceFactory.getCalendarService();
        
        // Construct event object
        const newEvent: NewCalendarEvent = {
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
            contentType: contentType as 'text' | 'html',
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
          } catch (e) {
            // If parsing fails, ignore attendees
          }
        }
        
        const result = await calendarService.createEvent(newEvent, userEmail, calendarId);
        
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(calendarConfig.createEvent.responses.success, { subject })
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(calendarConfig.createEvent.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 5. Update event tool
  server.tool(
    'update-event',
    { 
      userEmail: z.string().email().describe(calendarConfig.updateEvent.parameters.userEmail),
      eventId: z.string().describe(calendarConfig.updateEvent.parameters.eventId),
      subject: z.string().optional().describe(calendarConfig.updateEvent.parameters.subject),
      start: z.string().optional().describe(calendarConfig.updateEvent.parameters.start),
      end: z.string().optional().describe(calendarConfig.updateEvent.parameters.end),
      timeZone: z.string().optional().describe(calendarConfig.updateEvent.parameters.timeZone),
      location: z.string().optional().describe(calendarConfig.updateEvent.parameters.location),
      body: z.string().optional().describe(calendarConfig.updateEvent.parameters.body),
      contentType: z.enum(['text', 'html']).optional().describe(calendarConfig.updateEvent.parameters.contentType),
      isOnlineMeeting: z.string().optional().describe(calendarConfig.updateEvent.parameters.isOnlineMeeting),
      attendees: z.string().optional().describe(calendarConfig.updateEvent.parameters.attendees),
      calendarId: z.string().optional().describe(calendarConfig.updateEvent.parameters.calendarId)
    },
    async ({ 
      userEmail, eventId, subject, start, end, timeZone, location, 
      body, contentType, isOnlineMeeting, attendees, calendarId 
    }) => {
      try {
        const calendarService = ServiceFactory.getCalendarService();
        
        // Construct event update object
        const eventUpdate: Partial<NewCalendarEvent> = {};
        
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
            contentType: contentType || 'text' as 'text' | 'html',
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
          } catch (e) {
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
            text: formatMessage(calendarConfig.updateEvent.responses.success, {})
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(calendarConfig.updateEvent.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );

  // 6. Delete event tool
  server.tool(
    'delete-event',
    { 
      userEmail: z.string().email().describe(calendarConfig.deleteEvent.parameters.userEmail),
      eventId: z.string().describe(calendarConfig.deleteEvent.parameters.eventId),
      calendarId: z.string().optional().describe(calendarConfig.deleteEvent.parameters.calendarId)
    },
    async ({ userEmail, eventId, calendarId }) => {
      try {
        const calendarService = ServiceFactory.getCalendarService();
        await calendarService.deleteEvent(eventId, userEmail, calendarId);
        
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(calendarConfig.deleteEvent.responses.success, {})
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: formatMessage(calendarConfig.deleteEvent.responses.error, { error: String(error) })
          }],
          isError: true
        };
      }
    }
  );
}
