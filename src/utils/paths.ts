/**
 * Path handling utilities for Outlook folders and messages
 */

/**
 * Normalizes a folder path to ensure consistent formatting
 * @param folderPath The folder path to normalize
 * @returns Normalized path (always starts with / and never ends with /)
 */
export function normalizeFolderPath(folderPath: string): string {
  // Make sure the path starts with /
  let normalizedPath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;
  
  // Remove trailing slash if present
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  
  return normalizedPath;
}

/**
 * Gets parent path from a folder path
 * @param folderPath The folder path
 * @returns The parent path or '/' if at root
 */
export function getParentPath(folderPath: string): string {
  const normalizedPath = normalizeFolderPath(folderPath);
  
  // If we're at the root or a top-level folder, return root
  if (normalizedPath === '/' || !normalizedPath.includes('/', 1)) {
    return '/';
  }
  
  // Otherwise return the parent path
  const lastSlashIndex = normalizedPath.lastIndexOf('/');
  return lastSlashIndex > 0 ? normalizedPath.substring(0, lastSlashIndex) : '/';
}

/**
 * Gets the folder name from a path
 * @param folderPath The folder path
 * @returns The folder name (last segment of the path)
 */
export function getFolderName(folderPath: string): string {
  const normalizedPath = normalizeFolderPath(folderPath);
  
  // If we're at the root, return empty string
  if (normalizedPath === '/') {
    return '';
  }
  
  // Otherwise return the last segment
  const lastSlashIndex = normalizedPath.lastIndexOf('/');
  return normalizedPath.substring(lastSlashIndex + 1);
}

/**
 * Joins path segments into a valid folder path
 * @param segments The path segments to join
 * @returns Joined path
 */
export function joinPaths(...segments: string[]): string {
  if (segments.length === 0) return '/';
  
  // Start with the first segment, normalized
  let result = normalizeFolderPath(segments[0]);
  
  // Add each subsequent segment, ensuring no duplicate slashes
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i].trim();
    
    if (!segment) continue;
    
    // Remove any leading slashes from the segment
    const cleanSegment = segment.startsWith('/') ? segment.substring(1) : segment;
    
    // Add the segment to the result
    if (cleanSegment) {
      result = `${result}/${cleanSegment}`;
    }
  }
  
  return normalizeFolderPath(result);
}
