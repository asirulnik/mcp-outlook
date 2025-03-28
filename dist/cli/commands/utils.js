"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAuthCommand = testAuthCommand;
exports.convertHtmlCommand = convertHtmlCommand;
const fs = __importStar(require("fs"));
const htmlToText_1 = require("../../utils/htmlToText");
const serviceFactory_1 = require("../../services/serviceFactory");
/**
 * Command to test authentication with Microsoft Graph
 */
async function testAuthCommand(options) {
    try {
        const folderService = serviceFactory_1.ServiceFactory.getFolderService();
        // Try to get the top-level folders to test authentication
        await folderService.getMailFolders(options.user);
        console.log('Authentication successful! You are connected to Microsoft Graph API.');
    }
    catch (error) {
        console.error('Authentication failed:', error);
        process.exit(1);
    }
}
/**
 * Command to convert HTML content to plain text
 */
async function convertHtmlCommand(options) {
    try {
        // Read the HTML file
        const html = fs.readFileSync(options.file, 'utf8');
        // Convert options
        const convertOptions = {
            wordwrap: parseInt(options.wordWrap || '100'),
            preserveNewlines: true,
            tables: true,
            preserveHrefLinks: options.preserveLinks || false,
            headingStyle: 'linebreak'
        };
        // Convert HTML to plain text
        let plainText = (0, htmlToText_1.htmlToText)(html, convertOptions);
        // If hideQuotedContent is enabled, extract only the main message
        if (options.hideQuoted) {
            const parts = plainText.split('\n---\n');
            if (parts.length > 1) {
                plainText = parts[0] + '\n\n[Prior quoted messages removed]';
            }
        }
        console.log(plainText);
    }
    catch (error) {
        console.error('Error converting HTML to text:', error);
        process.exit(1);
    }
}
