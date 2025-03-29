import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { emailPromptsConfig } from './promptConfig';
import { z } from 'zod';

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
  console.log('Registering built-in prompt capabilities...');
  
  // Register each built-in prompt
  for (const [promptId, promptConfig] of Object.entries(emailPromptsConfig)) {
    // Convert arguments to Zod schema
    const args: Record<string, any> = {};
    
    for (const [argName, argConfig] of Object.entries(promptConfig.arguments)) {
      if (argConfig.required) {
        args[argName] = z.string().describe(argConfig.description);
      } else {
        args[argName] = z.string().optional().describe(argConfig.description);
      }
    }
    
    // Register the prompt
    server.prompt(
      promptId,
      args,
      (providedArgs) => {
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
  
  console.log('Built-in prompt capabilities registered successfully.');
}