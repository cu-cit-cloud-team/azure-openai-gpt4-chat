export interface UserMeta {
  email?: string;
  name?: string;
  user_id?: string;
}

// Re-export ToolUIPart from AI SDK
export type { ToolUIPart } from 'ai';

// Message part types
export interface TextPart {
  type: 'text';
  text: string;
}

export interface ReasoningPart {
  type: 'reasoning';
  text: string;
}

export interface SourceUrlPart {
  type: 'source-url';
  sourceId: string;
  url: string;
  title?: string;
  providerMetadata?: unknown;
}

export interface FilePart {
  type: 'file';
  mediaType: string;
  url?: string;
  textContent?: string;
  name?: string;
}
