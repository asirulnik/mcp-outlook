"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printCalendars = printCalendars;
exports.printEvents = printEvents;
exports.printEventDetails = printEventDetails;
const htmlToText_1 = require("../../utils/htmlToText");
/**
 * Print a list of calendars to the console
 * @param calendars List of calendars
 */
function printCalendars(calendars) {
    if (calendars.length === 0) {
        console.log('No calendars found.');
        return;
    }
    for (let i = 0; i < calendars.length; i++) {
        const calendar = calendars[i];
        const owner = calendar.owner
            ? ` - Owner: ${calendar.owner.name || calendar.owner.address}`
            : '';
        const canEdit = calendar.canEdit === true ? ' (Can edit)' : '';
        console.log(`${i + 1}. ${calendar.name}${owner}${canEdit}`);
        console.log(`   ID: ${calendar.id}`);
        console.log('');
    }
    console.log(`Found ${calendars.length} calendar(s).`);
}
/**
 * Print a list of calendar events to the console
 * @param events List of calendar events
 */
function printEvents(events) {
    var _a, _b, _c, _d, _e;
    if (events.length === 0) {
        console.log('No events found.');
        return;
    }
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        // Format dates
        const startDate = new Date(event.start.dateTime);
        const endDate = new Date(event.end.dateTime);
        const dateFormat = formatEventDateRange(startDate, endDate, event.isAllDay);
        // Format status/type indicators
        const indicators = [];
        if (event.isOnlineMeeting)
            indicators.push('Online');
        if (event.isCancelled)
            indicators.push('Cancelled');
        if (event.isAllDay)
            indicators.push('All Day');
        const statusIndicator = indicators.length > 0 ? ` [${indicators.join(', ')}]` : '';
        // Format location
        const location = ((_a = event.location) === null || _a === void 0 ? void 0 : _a.displayName) ? ` - ${event.location.displayName}` : '';
        // Format organizer
        const organizer = ((_c = (_b = event.organizer) === null || _b === void 0 ? void 0 : _b.emailAddress) === null || _c === void 0 ? void 0 : _c.name) || ((_e = (_d = event.organizer) === null || _d === void 0 ? void 0 : _d.emailAddress) === null || _e === void 0 ? void 0 : _e.address);
        const organizerInfo = organizer ? ` - Organizer: ${organizer}` : '';
        // Print the event summary
        console.log(`${i + 1}. ${event.subject}${statusIndicator}`);
        console.log(`   ${dateFormat}${location}${organizerInfo}`);
        console.log(`   ID: ${event.id}`);
        // Show attendance count if applicable
        if (event.attendees && event.attendees.length > 0) {
            const required = event.attendees.filter(a => a.type === 'required').length;
            const optional = event.attendees.filter(a => a.type === 'optional').length;
            console.log(`   Attendees: ${required} required, ${optional} optional`);
        }
        console.log('');
    }
}
/**
 * Print detailed event information to the console
 * @param event Calendar event details
 * @param options HTML to text conversion options
 */
function printEventDetails(event, options) {
    var _a;
    console.log('\n==================================================');
    console.log(`Subject: ${event.subject}`);
    // Format dates
    const startDate = new Date(event.start.dateTime);
    const endDate = new Date(event.end.dateTime);
    const dateFormat = formatEventDateRange(startDate, endDate, event.isAllDay);
    console.log(`When: ${dateFormat} (${event.start.timeZone})`);
    // Format location
    if ((_a = event.location) === null || _a === void 0 ? void 0 : _a.displayName) {
        console.log(`Location: ${event.location.displayName}`);
    }
    // Format online meeting
    if (event.isOnlineMeeting) {
        console.log(`Meeting Type: Online${event.onlineMeetingProvider ? ` (${event.onlineMeetingProvider})` : ''}`);
        if (event.onlineMeetingUrl) {
            console.log(`Meeting URL: ${event.onlineMeetingUrl}`);
        }
    }
    // Formatting organizer
    if (event.organizer) {
        console.log(`Organizer: ${event.organizer.emailAddress.name || ''} <${event.organizer.emailAddress.address}>`);
    }
    // Format attendees
    if (event.attendees && event.attendees.length > 0) {
        console.log('\nAttendees:');
        // Group by type
        const requireAttendees = event.attendees.filter(a => a.type === 'required');
        const optionalAttendees = event.attendees.filter(a => a.type === 'optional');
        const resourceAttendees = event.attendees.filter(a => a.type === 'resource');
        if (requireAttendees.length > 0) {
            console.log('  Required:');
            requireAttendees.forEach(attendee => {
                const name = attendee.emailAddress.name || attendee.emailAddress.address;
                const status = attendee.status ? ` (${formatAttendeeStatus(attendee.status.response)})` : '';
                console.log(`    - ${name}${status}`);
            });
        }
        if (optionalAttendees.length > 0) {
            console.log('  Optional:');
            optionalAttendees.forEach(attendee => {
                const name = attendee.emailAddress.name || attendee.emailAddress.address;
                const status = attendee.status ? ` (${formatAttendeeStatus(attendee.status.response)})` : '';
                console.log(`    - ${name}${status}`);
            });
        }
        if (resourceAttendees.length > 0) {
            console.log('  Resources:');
            resourceAttendees.forEach(attendee => {
                const name = attendee.emailAddress.name || attendee.emailAddress.address;
                console.log(`    - ${name}`);
            });
        }
    }
    // Format sensitivity and importance
    if (event.sensitivity && event.sensitivity !== 'normal') {
        console.log(`\nSensitivity: ${event.sensitivity}`);
    }
    if (event.importance && event.importance !== 'normal') {
        console.log(`Importance: ${event.importance}`);
    }
    // Format body
    if (event.body) {
        console.log('\n--------------------------------------------------');
        if (event.body.contentType === 'html') {
            console.log('Description (converted from HTML):');
            // Convert HTML to text
            const defaultOptions = {
                wordwrap: 100,
                preserveNewlines: true,
                tables: true,
                preserveHrefLinks: true,
                headingStyle: 'linebreak'
            };
            // Merge with provided options
            const textOptions = { ...defaultOptions, ...options };
            // Convert the HTML to text
            const textContent = (0, htmlToText_1.htmlToText)(event.body.content, textOptions);
            console.log(textContent);
        }
        else {
            console.log('Description:');
            console.log(event.body.content);
        }
    }
    console.log('==================================================\n');
}
/**
 * Format a date range for an event
 * @param start Start date
 * @param end End date
 * @param isAllDay Whether the event is an all-day event
 * @returns Formatted date range string
 */
function formatEventDateRange(start, end, isAllDay) {
    if (isAllDay) {
        // Format all-day events differently
        const isSameDay = start.getDate() === end.getDate() &&
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear();
        if (isSameDay) {
            // Single all-day event
            return `${start.toLocaleDateString()} (All day)`;
        }
        else {
            // Multi-day event
            return `${start.toLocaleDateString()} - ${end.toLocaleDateString()} (All day)`;
        }
    }
    else {
        // Regular timed event
        const isSameDay = start.getDate() === end.getDate() &&
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear();
        if (isSameDay) {
            // Same-day event
            return `${start.toLocaleDateString()}, ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
        }
        else {
            // Multi-day event
            return `${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleDateString()} ${end.toLocaleTimeString()}`;
        }
    }
}
/**
 * Format attendee response status
 * @param status Response status
 * @returns Formatted status
 */
function formatAttendeeStatus(status) {
    switch (status) {
        case 'accepted':
            return 'Accepted';
        case 'tentatively':
        case 'tentative':
            return 'Tentative';
        case 'declined':
            return 'Declined';
        case 'none':
        default:
            return 'No response';
    }
}
