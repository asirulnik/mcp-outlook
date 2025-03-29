import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { emailPromptsConfig } from './promptConfig';
import { loadExternalPrompts } from './externalPromptsLoader';

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
  
  // Combine with built-in prompts
  const allPrompts = {
    ...emailPromptsConfig,
    ...externalPrompts
  };
  
  // Handle listPrompts request
  server.registerListPromptsHandler(async () => {
    const prompts = [];
    
    for (const [id, config] of Object.entries(allPrompts)) {
      const promptArgs = [];
      
      // Convert arguments to the format expected by MCP
      for (const [argName, argConfig] of Object.entries(config.arguments)) {
        promptArgs.push({
          name: argName,
          description: argConfig.description,
          required: argConfig.required || false
        });
      }
      
      prompts.push({
        name: id,
        description: config.description,
        arguments: promptArgs
      });
    }
    
    return prompts;
  });
  
  // Handle getPrompt request
  server.registerGetPromptHandler(async (name, args) => {
    // Check if prompt exists
    if (!allPrompts[name]) {
      throw new Error(`Prompt '${name}' not found`);
    }
    
    const promptConfig = allPrompts[name];
    
    // Gather default values
    const defaults: Record<string, any> = {};
    for (const [argName, argConfig] of Object.entries(promptConfig.arguments)) {
      if (argConfig.default !== undefined) {
        defaults[argName] = argConfig.default;
      }
    }
    
    // Process the template with provided arguments and defaults
    const processedTemplate = processTemplate(promptConfig.template, args || {}, defaults);
    
    // Return in the format expected by MCP
    return {
      description: promptConfig.description,
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: processedTemplate
        }
      }]
    };
  });
  
  console.log('Prompt capabilities registered successfully.');
}