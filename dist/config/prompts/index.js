"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptConfig = void 0;
exports.formatMessage = formatMessage;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const emailTools_1 = require("./emailTools");
const folderTools_1 = require("./folderTools");
const draftTools_1 = require("./draftTools");
const calendarTools_1 = require("./calendarTools");
const errorMessages_1 = require("./errorMessages");
// Default configuration with type safety
const defaultConfig = {
    tools: {
        email: emailTools_1.emailToolsConfig,
        folder: folderTools_1.folderToolsConfig,
        draft: draftTools_1.draftToolsConfig,
        calendar: calendarTools_1.calendarToolsConfig
    },
    errors: errorMessages_1.errorMessagesConfig
};
// Try to load external configuration if it exists
let externalConfig = {};
const configPath = path_1.default.join(process.cwd(), 'outlook-mcp-config.json');
try {
    if (fs_1.default.existsSync(configPath)) {
        const configData = fs_1.default.readFileSync(configPath, 'utf8');
        externalConfig = JSON.parse(configData);
        console.log('Loaded external configuration from outlook-mcp-config.json');
    }
}
catch (error) {
    console.warn('Error loading external configuration:', error);
}
// Deep merge function to handle nested properties
function deepMerge(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                }
                else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            }
            else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
// Merge configurations with default values taking lower precedence
exports.promptConfig = deepMerge(defaultConfig, externalConfig);
// Helper to get formatted messages with variable replacements
function formatMessage(template, vars) {
    let result = template;
    Object.entries(vars).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return result;
}
