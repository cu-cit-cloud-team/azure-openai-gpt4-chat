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
 * Extract all file parts from a v5 message, including text files stored as text parts
 */
export function getMessageFiles(message: UIMessage) {
  const files: Array<{
    type: string;
    mediaType: string;
    url: string;
    name?: string;
    textContent?: string;
  }> = [];

  // Get actual file parts (images, PDFs)
  message.parts.forEach((part) => {
    if (part.type === 'file') {
      files.push({
        type: part.type,
        mediaType: (part as { mediaType: string }).mediaType,
        url: (part as { url: string }).url,
        name: (part as { name?: string }).name,
      });
    } else if (part.type === 'text' && part.text.startsWith('[File: ')) {
      // Extract text file attachments from text parts
      const match = part.text.match(/^\[File: (.+?)\]\n([\s\S]*)$/);
      if (match) {
        files.push({
          type: 'file',
          mediaType: match[1].endsWith('.md') ? 'text/markdown' : 'text/plain',
          url: '',
          name: match[1],
          textContent: match[2],
        });
      }
    }
  });

  return files;
}
