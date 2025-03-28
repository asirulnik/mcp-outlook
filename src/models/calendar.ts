/**
 * Models and interfaces related to calendar events
 */

/**
 * Interface representing a calendar
 */
export interface Calendar {
  id: string;
  name: string;
  owner?: {
    name: string;
    address: string;
  };
  canEdit?: boolean;
  canShare?: boolean;
  canViewPrivateItems?: boolean;
}

/**
 * Interface representing a calendar event attendee
 */
export interface EventAttendee {
  emailAddress: {
    address: string;
    name?: string;
  };
  type: 'required' | 'optional' | 'resource';
  status?: {
    response: 'none' | 'accepted' | 'tentatively' | 'declined';
    time?: string;
  };
}

/**
 * Interface representing a calendar event location
 */
export interface EventLocation {
  displayName: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    countryOrRegion?: string;
    postalCode?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Interface representing a calendar event
 */
export interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: EventLocation;
  attendees?: EventAttendee[];
  body?: {
    contentType: 'text' | 'html';
    content: string;
  };
  isOnlineMeeting?: boolean;
  onlineMeetingUrl?: string;
  onlineMeetingProvider?: string;
  organizer?: {
    emailAddress: {
      address: string;
      name?: string;
    }
  };
  recurrence?: {
    pattern: {
      type: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      daysOfWeek?: string[];
      dayOfMonth?: number;
      month?: number;
    };
    range: {
      type: 'endDate' | 'noEnd' | 'numbered';
      startDate: string;
      endDate?: string;
      numberOfOccurrences?: number;
    };
  };
  sensitivity?: 'normal' | 'personal' | 'private' | 'confidential';
  showAs?: 'free' | 'busy' | 'tentative' | 'oof' | 'workingElsewhere';
  importance?: 'low' | 'normal' | 'high';
  isAllDay?: boolean;
  isCancelled?: boolean;
  responseRequested?: boolean;
}

/**
 * Interface for creating a new calendar event
 */
export interface NewCalendarEvent {
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: EventLocation;
  attendees?: {
    emailAddress: {
      address: string;
      name?: string;
    };
    type: 'required' | 'optional' | 'resource';
  }[];
  body?: {
    contentType: 'text' | 'html';
    content: string;
  };
  isOnlineMeeting?: boolean;
  isAllDay?: boolean;
  recurrence?: {
    pattern: {
      type: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      daysOfWeek?: string[];
      dayOfMonth?: number;
      month?: number;
    };
    range: {
      type: 'endDate' | 'noEnd' | 'numbered';
      startDate: string;
      endDate?: string;
      numberOfOccurrences?: number;
    };
  };
  sensitivity?: 'normal' | 'personal' | 'private' | 'confidential';
  showAs?: 'free' | 'busy' | 'tentative' | 'oof' | 'workingElsewhere';
  importance?: 'low' | 'normal' | 'high';
  responseRequested?: boolean;
}

/**
 * Interface for calendar search options
 */
export interface CalendarSearchOptions {
  startDateTime?: Date;
  endDateTime?: Date;
  calendarId?: string;
  includeOnlineMeetingUrls?: boolean;
}
