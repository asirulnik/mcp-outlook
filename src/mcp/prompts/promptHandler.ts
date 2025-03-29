import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { emailPromptsConfig } from './promptConfig';
import * as fs from 'fs';
import * as path from 'path';

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
 * Load external prompt configurations if available
 * @returns Object containing any external prompt configurations
 */
function loadExternalPrompts(): Record<string, any> {
  let externalPrompts: Record<string, any> = {};
  try {
    const externalConfigPath = path.join(process.cwd(), 'config', 'prompts', 'external-prompts.json');
    if (fs.existsSync(externalConfigPath)) {
      console.log(`Loading external prompt configurations from ${externalConfigPath}`);
      const configData = fs.readFileSync(externalConfigPath, 'utf8');
      externalPrompts = JSON.parse(configData);
      console.log(`Loaded ${Object.keys(externalPrompts).length} external prompts`);
    } else {
      console.log(`External prompt config file not found at: ${externalConfigPath}`);
    }
  } catch (error) {
    console.error('Error loading external prompt configurations:', error);
  }
  return externalPrompts;
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
  
  // Merge external prompts with built-in prompts
  const allPrompts = {
    ...emailPromptsConfig,
    ...externalPrompts
  };
  
  // Register each prompt with the server
  for (const [promptId, promptConfig] of Object.entries(allPrompts)) {
    // Convert prompt arguments to the format needed by the SDK
    const args: Record<string, any> = {};
    
    if (promptConfig.arguments) {
      for (const [argName, argConfig] of Object.entries(promptConfig.arguments)) {
        args[argName] = {
          description: argConfig.description || '',
          required: argConfig.required || false
        };
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
    
    console.log(`Registered prompt: ${promptId}`);
  }
  
  console.log('Prompt capabilities registered successfully.');
}