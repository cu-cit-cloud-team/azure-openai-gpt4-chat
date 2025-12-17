export interface UserMeta {
  email?: string;
  name?: string;
  user_id?: string;
}

export type {
  FileUIPart,
  ReasoningUIPart,
  SourceUrlUIPart,
  ToolUIPart,
} from 'ai';

// Message part types
export interface TextPart {
  type: 'text';
  text: string;
}
