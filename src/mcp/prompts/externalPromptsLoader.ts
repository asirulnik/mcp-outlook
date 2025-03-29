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
export function loadExternalPrompts(): Record<string, PromptConfig> {
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