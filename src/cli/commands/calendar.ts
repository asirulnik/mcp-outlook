import { ServiceFactory } from '../../services/serviceFactory';
import { NewCalendarEvent } from '../../models/calendar';
import { formatErrorForUser } from '../../utils/errors';
import { printCalendars, printEvents, printEventDetails } from '../formatters/calendarFormatter';

/**
 * Command to list all calendars
 */
export async function listCalendarsCommand(
  options: { 
    user: string 
  }
): Promise<void> {
  try {
    const calendarService = ServiceFactory.getCalendarService();
    const calendars = await calendarService.listCalendars(options.user);
    
    console.log(`\nCalendars for User: ${options.user}\n`);
    printCalendars(calendars);
  } catch (error) {
    console.error('Error listing calendars:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to list calendar events
 */
export async function listEventsCommand(
  options: { 
    user: string,
    start?: string,
    end?: string,
    limit?: string,
    calendarId?: string
  }
): Promise<void> {
  try {
    const calendarService = ServiceFactory.getCalendarService();
    
    // Parse dates if provided
    const startDate = options.start ? new Date(options.start) : undefined;
    const endDate = options.end ? new Date(options.end) : undefined;
    
    // Parse limit
    const limit = options.limit ? parseInt(options.limit) : 25;
    
    const events = await calendarService.listEvents(
      options.user, 
      startDate, 
      endDate, 
      limit, 
      options.calendarId
    );
    
    // Build description of filters for output
    let filterDesc = '';
    if (startDate) {
      filterDesc += ` from ${startDate.toLocaleString()}`;
    }
    if (endDate) {
      filterDesc += filterDesc ? ` to ${endDate.toLocaleString()}` : ` until ${endDate.toLocaleString()}`;
    }
    if (options.calendarId) {
      filterDesc += ` (Calendar ID: ${options.calendarId})`;
    }
    
    console.log(`\nEvents for User: ${options.user}${filterDesc}\n`);
    printEvents(events);
    console.log(`\nFound ${events.length} event(s).`);
  } catch (error) {
    console.error('Error listing events:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to get a specific event
 */
export async function getEventCommand(
  eventId: string,
  options: { 
    user: string,
    calendarId?: string
  }
): Promise<void> {
  try {
    const calendarService = ServiceFactory.getCalendarService();
    const event = await calendarService.getEvent(eventId, options.user, options.calendarId);
    
    console.log(`\nEvent Details (ID: ${eventId})\n`);
    printEventDetails(event);
  } catch (error) {
    console.error('Error getting event:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to create a calendar event
 */
export async function createEventCommand(
  options: { 
    user: string,
    subject: string,
    start: string,
    end: string,
    timeZone: string,
    location?: string,
    body?: string,
    isHtml?: boolean,
    isOnlineMeeting?: boolean,
    isAllDay?: boolean,
    attendees?: string,
    calendarId?: string
  }
): Promise<void> {
  try {
    const calendarService = ServiceFactory.getCalendarService();
    
    // Create event object
    const newEvent: NewCalendarEvent = {
      subject: options.subject,
      start: {
        dateTime: options.start,
        timeZone: options.timeZone
      },
      end: {
        dateTime: options.end,
        timeZone: options.timeZone
      },
      isAllDay: options.isAllDay || false,
      isOnlineMeeting: options.isOnlineMeeting || false
    };
    
    // Add optional fields if provided
    if (options.location) {
      newEvent.location = {
        displayName: options.location
      };
    }
    
    if (options.body) {
      newEvent.body = {
        contentType: options.isHtml ? 'html' : 'text',
        content: options.body
      };
    }
    
    // Process attendees if provided
    if (options.attendees) {
      const attendeeEmails = options.attendees.split(',').map(email => email.trim());
      newEvent.attendees = attendeeEmails.map(email => ({
        emailAddress: {
          address: email
        },
        type: 'required'
      }));
    }
    
    // Create the event
    const result = await calendarService.createEvent(newEvent, options.user, options.calendarId);
    
    console.log(`\nEvent "${options.subject}" created successfully.`);
    console.log(`ID: ${result.id}`);
    
    if (result.isOnlineMeeting && result.onlineMeetingUrl) {
      console.log(`Online meeting URL: ${result.onlineMeetingUrl}`);
    }
  } catch (error) {
    console.error('Error creating event:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to update a calendar event
 */
export async function updateEventCommand(
  eventId: string,
  options: { 
    user: string,
    subject?: string,
    start?: string,
    end?: string,
    timeZone?: string,
    location?: string,
    body?: string,
    isHtml?: boolean,
    isOnlineMeeting?: boolean,
    isAllDay?: boolean,
    attendees?: string,
    calendarId?: string
  }
): Promise<void> {
  try {
    const calendarService = ServiceFactory.getCalendarService();
    
    // Create the update object with only provided fields
    const eventUpdate: Partial<NewCalendarEvent> = {};
    
    // Add fields only if they're provided
    if (options.subject !== undefined) {
      eventUpdate.subject = options.subject;
    }
    
    if (options.start !== undefined && options.timeZone !== undefined) {
      eventUpdate.start = {
        dateTime: options.start,
        timeZone: options.timeZone
      };
    }
    
    if (options.end !== undefined && options.timeZone !== undefined) {
      eventUpdate.end = {
        dateTime: options.end,
        timeZone: options.timeZone
      };
    }
    
    if (options.isAllDay !== undefined) {
      eventUpdate.isAllDay = options.isAllDay;
    }
    
    if (options.isOnlineMeeting !== undefined) {
      eventUpdate.isOnlineMeeting = options.isOnlineMeeting;
    }
    
    if (options.location !== undefined) {
      eventUpdate.location = {
        displayName: options.location
      };
    }
    
    if (options.body !== undefined) {
      eventUpdate.body = {
        contentType: options.isHtml ? 'html' : 'text',
        content: options.body
      };
    }
    
    // Process attendees if provided
    if (options.attendees !== undefined) {
      const attendeeEmails = options.attendees.split(',').map(email => email.trim());
      eventUpdate.attendees = attendeeEmails.map(email => ({
        emailAddress: {
          address: email
        },
        type: 'required'
      }));
    }
    
    // Only update if there's at least one change
    if (Object.keys(eventUpdate).length === 0) {
      console.log('\nNo updates provided. Event remains unchanged.');
      return;
    }
    
    // Update the event
    await calendarService.updateEvent(eventId, eventUpdate, options.user, options.calendarId);
    
    console.log(`\nEvent successfully updated.`);
  } catch (error) {
    console.error('Error updating event:', formatErrorForUser(error));
    process.exit(1);
  }
}

/**
 * Command to delete a calendar event
 */
export async function deleteEventCommand(
  eventId: string,
  options: { 
    user: string,
    calendarId?: string
  }
): Promise<void> {
  try {
    const calendarService = ServiceFactory.getCalendarService();
    await calendarService.deleteEvent(eventId, options.user, options.calendarId);
    
    console.log(`\nEvent successfully deleted.`);
  } catch (error) {
    console.error('Error deleting event:', formatErrorForUser(error));
    process.exit(1);
  }
}
