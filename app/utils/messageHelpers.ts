/**
 * Simple helpers for working with AI SDK v5 messages
 */

import type { UIMessage } from 'ai';

/**
 * Extract the first text content from a v5 message
 */
export function getMessageText(message: UIMessage): string {
  for (const part of message.parts) {
    if (part.type === 'text' && !part.text.startsWith('[File: ')) {
      return part.text;
    }
  }
  return '';
}

/**
 *  Mapping of common file extensions to media types
 */

export const mediaTypeMap: Record<string, string> = {
  json: 'application/json',
  pdf: 'application/pdf',
  ts: 'application/typescript',
  sh: 'application/x-sh',
  xml: 'application/xml',
  yaml: 'application/yaml',
  yml: 'application/yaml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  css: 'text/css',
  csv: 'text/csv',
  html: 'text/html',
  htm: 'text/html',
  js: 'text/javascript',
  md: 'text/markdown',
  txt: 'text/plain',
  go: 'text/x-golang',
  java: 'text/x-java',
  php: 'text/x-php',
  py: 'text/x-python',
  rb: 'text/x-ruby',
};

/**
 * Infer media type from filename extension
 */
function getMediaTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return mediaTypeMap[ext || ''] || 'text/plain';
}

/**
 * Extract all file parts from a v5 message
 * Text files are stored as text parts with [File: name] prefix
 * Images and PDFs are stored as file parts
 */
export function getMessageFiles(message: UIMessage) {
  const files: Array<{
    type: string;
    mediaType: string;
    url: string;
    name?: string;
    textContent?: string;
  }> = [];

  message.parts.forEach((part) => {
    if (part.type === 'file') {
      // Images and PDFs stored as file parts
      const filePart = part as {
        mediaType: string;
        url: string;
        name?: string;
        filename?: string;
      };
      files.push({
        type: part.type,
        mediaType: filePart.mediaType,
        url: filePart.url,
        name: filePart.filename || filePart.name || 'file',
      });
    } else if (part.type === 'text' && part.text.startsWith('[File: ')) {
      // Text files stored as text parts with [File: name] prefix
      const match = part.text.match(/^\[File: (.+?)\]\n([\s\S]*)$/);
      if (match) {
        const filename = match[1];
        files.push({
          type: 'file',
          mediaType: getMediaTypeFromFilename(filename),
          url: '',
          name: filename,
          textContent: match[2],
        });
      }
    }
  });

  return files;
}

/**
 * Check if a message has any meaningful content
 * Used to prevent persisting empty messages on errors
 */
export function hasMessageContent(message: UIMessage): boolean {
  if (!message.parts || message.parts.length === 0) {
    return false;
  }

  // Check if there's any text content (excluding file prefixes)
  const hasText = message.parts.some(
    (part) => part.type === 'text' && part.text.trim() !== ''
  );

  // Check if there are any file parts
  const hasFiles = message.parts.some((part) => part.type === 'file');

  // Check if there are any other meaningful parts (reasoning, tool calls, etc.)
  const hasOtherContent = message.parts.some(
    (part) =>
      part.type === 'reasoning' ||
      part.type.startsWith('tool-') ||
      part.type === 'source-url'
  );

  return hasText || hasFiles || hasOtherContent;
}

/**
 * Extract a meaningful title from a URL for display purposes.
 * Returns the domain name or last path segment instead of the full URL.
 */
export function getSourceTitle(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname
      .split('/')
      .filter((segment) => segment.length > 0);

    if (pathSegments.length > 0) {
      // Return the last path segment (e.g., "article-name" from "/path/to/article-name")
      const lastSegment = pathSegments[pathSegments.length - 1];
      // Decode URI component and replace hyphens/underscores with spaces for readability
      return decodeURIComponent(lastSegment)
        .replace(/[-_]/g, ' ')
        .replace(/\.(html?|php|aspx?)$/i, ''); // Remove common file extensions
    }

    // Fallback to domain name
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    // If URL parsing fails, return the original URL
    return url;
  }
}
