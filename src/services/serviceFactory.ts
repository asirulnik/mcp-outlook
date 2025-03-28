import { IAuthService, IFolderService, IEmailService, IDraftService, ICalendarService } from './interfaces';
import { authService } from './authService';
import { FolderService } from './mailService/folderService';
import { EmailService } from './mailService/emailService';
import { DraftService } from './mailService/draftService';
import { CalendarService } from './mailService/calendar';

/**
 * Factory class for creating services
 */
export class ServiceFactory {
  private static _authService: IAuthService = authService;
  
  /**
   * Get the authentication service
   * @returns Auth service
   */
  static getAuthService(): IAuthService {
    return this._authService;
  }
  
  /**
   * Set a custom authentication service (for testing)
   * @param service Custom auth service
   */
  static setAuthService(service: IAuthService): void {
    this._authService = service;
  }
  
  /**
   * Get the folder service
   * @returns Folder service
   */
  static getFolderService(): IFolderService {
    return new FolderService(this.getAuthService());
  }
  
  /**
   * Get the email service
   * @returns Email service
   */
  static getEmailService(): IEmailService {
    return new EmailService(this.getAuthService(), this.getFolderService());
  }
  
  /**
   * Get the draft service
   * @returns Draft service
   */
  static getDraftService(): IDraftService {
    return new DraftService(this.getAuthService());
  }

  /**
   * Get the calendar service
   * @returns Calendar service
   */
  static getCalendarService(): ICalendarService {
    return new CalendarService(this.getAuthService());
  }
}
