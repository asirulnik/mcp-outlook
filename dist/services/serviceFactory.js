"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceFactory = void 0;
const authService_1 = require("./authService");
const folderService_1 = require("./mailService/folderService");
const emailService_1 = require("./mailService/emailService");
const draftService_1 = require("./mailService/draftService");
const calendar_1 = require("./mailService/calendar");
/**
 * Factory class for creating services
 */
class ServiceFactory {
    /**
     * Get the authentication service
     * @returns Auth service
     */
    static getAuthService() {
        return this._authService;
    }
    /**
     * Set a custom authentication service (for testing)
     * @param service Custom auth service
     */
    static setAuthService(service) {
        this._authService = service;
    }
    /**
     * Get the folder service
     * @returns Folder service
     */
    static getFolderService() {
        return new folderService_1.FolderService(this.getAuthService());
    }
    /**
     * Get the email service
     * @returns Email service
     */
    static getEmailService() {
        return new emailService_1.EmailService(this.getAuthService(), this.getFolderService());
    }
    /**
     * Get the draft service
     * @returns Draft service
     */
    static getDraftService() {
        return new draftService_1.DraftService(this.getAuthService());
    }
    /**
     * Get the calendar service
     * @returns Calendar service
     */
    static getCalendarService() {
        return new calendar_1.CalendarService(this.getAuthService());
    }
}
exports.ServiceFactory = ServiceFactory;
ServiceFactory._authService = authService_1.authService;
