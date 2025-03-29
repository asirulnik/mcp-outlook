import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { emailPromptsConfig } from './promptConfig';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for prompt arguments
 */
export interface PromptArgument {
  description: string;
  required: boolean;
  default?: any;
}

/**
 * Interface for prompt configuration
 */
export interface PromptConfig {
  name: string;
  description: string;
  arguments: Record<string, PromptArgument>;
  template: string;
}

/**
 * Load external prompt configurations from disk
 * @returns Object containing external prompt configurations, or empty object if none found
 */
function loadExternalPrompts(): Record<string, PromptConfig> {
  let externalPrompts: Record<string, PromptConfig> = {};
  
  try {
    // Look for external prompts configuration file
    const externalConfigPath = path.join(process.cwd(), 'config', 'prompts', 'external-prompts.json');
    
    // Check if file exists
    if (fs.existsSync(externalConfigPath)) {
      console.log(`Loading external prompt configurations from ${externalConfigPath}`);
      
      // Read and parse the configuration file
      const configData = fs.readFileSync(externalConfigPath, 'utf8');
      externalPrompts = JSON.parse(configData);
      
      console.log(`Loaded ${Object.keys(externalPrompts).length} external prompt configurations`);
    } else {
      console.log(`No external prompt configurations found at ${externalConfigPath}`);
    }
  } catch (error) {
    console.error('Error loading external prompt configurations:', error);
  }
  
  return externalPrompts;
}

/**
 * Process a prompt template by replacing parameter placeholders with actual values
 * 
 * @param template The prompt template with placeholders
 * @param params The parameters to inject into the template
 * @param defaults Default values for parameters
 * @returns The processed template
 */
function processTemplate(template: string, params: Record<string, any>, defaults: Record<string, any> = {}): string {
  let processedTemplate = template;
  
  // Combine params with defaults for missing values
  const allParams = { ...defaults };
  for (const [key, value] of Object.entries(params)) {
    allParams[key] = value;
  }
  
  // Replace all placeholders with actual values
  for (const [key, value] of Object.entries(allParams)) {
    const placeholder = `{${key}}`;
    const stringValue = Array.isArray(value) ? value.join(', ') : String(value);
    processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), stringValue);
  }
  
  return processedTemplate;
}

/**
 * Register prompt capabilities with the MCP server
 * 
 * @param server The MCP server instance
 */
export function registerPrompts(server: McpServer): void {
  console.log('Registering prompt capabilities...');
  
  // Load external prompts
  const externalPrompts = loadExternalPrompts();
  
  // Register each built-in prompt
  for (const [promptId, promptConfig] of Object.entries(emailPromptsConfig)) {
    // Convert prompt arguments to Zod schemas
    const args: Record<string, any> = {};
    
    for (const [argName, argConfig] of Object.entries(promptConfig.arguments)) {
      if (argConfig.required) {
        args[argName] = z.string().describe(argConfig.description || '');
      } else {
        args[argName] = z.string().optional().describe(argConfig.description || '');
      }
    }
    
    // Register the prompt
    server.prompt(
      promptId,
      args,
      async (providedArgs) => {
        // Gather default values
        const defaults: Record<string, any> = {};
        for (const [argName, argConfig] of Object.entries(promptConfig.arguments)) {
          if (argConfig.default !== undefined) {
            defaults[argName] = argConfig.default;
          }
        }
        
        // Process the template with provided arguments and defaults
        const processedTemplate = processTemplate(promptConfig.template, providedArgs || {}, defaults);
        
        return {
          messages: [{
            role: "user",
            content: {
              type: "text",
              text: processedTemplate
            }
          }]
        };
      }
    );
    
    console.log(`Registered built-in prompt: ${promptId}`);
  }
  
  // Register each external prompt
  for (const [promptId, promptConfig] of Object.entries(externalPrompts)) {
    // Convert prompt arguments to Zod schemas
    const args: Record<string, any> = {};
    
    if (promptConfig.arguments) {
      for (const [argName, argConfig] of Object.entries(promptConfig.arguments)) {
        if (argConfig.required) {
          args[argName] = z.string().describe(argConfig.description || '');
        } else {
          args[argName] = z.string().optional().describe(argConfig.description || '');
        }
      }
    }
    
    // Register the prompt
    server.prompt(
      promptId,
      args,
      async (providedArgs) => {
        // Gather default values
        const defaults: Record<string, any> = {};
        if (promptConfig.arguments) {
          for (const [argName, argConfig] of Object.entries(promptConfig.arguments)) {
            if (argConfig.default !== undefined) {
              defaults[argName] = argConfig.default;
            }
          }
        }
        
        // Process the template with provided arguments and defaults
        const processedTemplate = processTemplate(promptConfig.template, providedArgs || {}, defaults);
        
        return {
          messages: [{
            role: "user",
            content: {
              type: "text",
              text: processedTemplate
            }
          }]
        };
      }
    );
    
    console.log(`Registered external prompt: ${promptId}`);
  }
  
  console.log('Prompt capabilities registered successfully.');
}