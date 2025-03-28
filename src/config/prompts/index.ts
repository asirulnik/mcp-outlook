import fs from 'fs';
import path from 'path';
import { emailToolsConfig } from './emailTools';
import { folderToolsConfig } from './folderTools';
import { draftToolsConfig } from './draftTools';
import { calendarToolsConfig } from './calendarTools';
import { errorMessagesConfig } from './errorMessages';

// Default configuration with type safety
const defaultConfig = {
  tools: {
    email: emailToolsConfig,
    folder: folderToolsConfig,
    draft: draftToolsConfig,
    calendar: calendarToolsConfig
  },
  errors: errorMessagesConfig
};

// Type for the configuration structure
export type PromptConfigType = typeof defaultConfig;

// Try to load external configuration if it exists
let externalConfig = {};
const configPath = path.join(process.cwd(), 'outlook-mcp-config.json');

try {
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf8');
    externalConfig = JSON.parse(configData);
    console.log('Loaded external configuration from outlook-mcp-config.json');
  }
} catch (error) {
  console.warn('Error loading external configuration:', error);
}

// Deep merge function to handle nested properties
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Merge configurations with default values taking lower precedence
export const promptConfig = deepMerge(defaultConfig, externalConfig) as PromptConfigType;

// Helper to get formatted messages with variable replacements
export function formatMessage(template: string, vars: Record<string, string>): string {
  let result = template;
  Object.entries(vars).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  return result;
}
