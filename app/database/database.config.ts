import type { UIMessage } from 'ai';
import Dexie, { type Table } from 'dexie';

// StoredMessage includes chatId to scope messages to a session
export interface StoredMessage extends UIMessage {
  model: string;
  createdAt: string;
  chatId?: string;
}

export class AppDatabase extends Dexie {
  messages!: Table<StoredMessage>;

  constructor() {
    super('database');

    // v1: minimal initial schema
    this.version(1).stores({
      messages: '&id, role, createdAt',
    });

    // v2: add model and migrate if missing
    this.version(2)
      .stores({
        messages: '&id, role, createdAt, model',
      })
      .upgrade((tx) => {
        return tx
          .table('messages')
          .toCollection()
          .modify((message: unknown) => {
            if (typeof message === 'object' && message !== null) {
              const m = message as Record<string, unknown>;
              if (!('model' in m)) {
                m.model = 'gpt-5.1';
              }
              if ('modelString' in m) {
                delete m.modelString;
              }
            }
          });
      });

    // v3: migrate legacy `content` strings into `parts`
    this.version(3)
      .stores({
        messages: '&id, role, createdAt, model',
      })
      .upgrade((tx) => {
        return tx
          .table('messages')
          .toCollection()
          .modify((message: unknown) => {
            if (typeof message === 'object' && message !== null) {
              const m = message as Record<string, unknown> & {
                parts?: unknown;
                content?: unknown;
              };
              if (!m.parts && typeof m.content === 'string') {
                m.parts = [{ type: 'text', text: m.content as string }];
              }
              if ('content' in m) {
                delete m.content;
              }
            }
          });
      });

    // v4: add chatId to scope messages
    this.version(4)
      .stores({
        // Do not index complex 'parts' array; index primitive chatId for session scoping
        messages: '&id, chatId, role, createdAt, model',
      })
      .upgrade((tx) => {
        return tx
          .table('messages')
          .toCollection()
          .modify((message: unknown) => {
            if (typeof message === 'object' && message !== null) {
              const m = message as Record<string, unknown> & {
                chatId?: unknown;
              };
              if (!('chatId' in m) || !m.chatId) {
                m.chatId = 'local-chat';
              }
            }
          });
      });

    // v5: ensure shape and non-destructive migration to parts-based format
    this.version(5)
      .stores({
        messages: '&id, chatId, role, createdAt, model',
      })
      .upgrade((tx) => {
        return tx
          .table('messages')
          .toCollection()
          .modify((message: unknown) => {
            if (typeof message === 'object' && message !== null) {
              const m = message as Record<string, unknown> & {
                parts?: unknown;
                content?: unknown;
                createdAt?: unknown;
                model?: unknown;
                chatId?: unknown;
              };

              if (!m.parts && typeof m.content === 'string') {
                m.parts = [{ type: 'text', text: m.content }];
              }

              if (!m.createdAt) {
                m.createdAt = new Date().toISOString();
              }

              if (!m.model) {
                m.model = 'gpt-5.1';
              }

              if (!m.chatId) {
                m.chatId = 'local-chat';
              }

              if ('content' in m) {
                delete m.content;
              }

              if ('modelString' in m) {
                delete m.modelString;
              }
            }
          });
      });
  }
}

declare global {
  interface Window {
    __appDatabase?: AppDatabase;
  }
}

export const database: AppDatabase = (() => {
  if (typeof window === 'undefined') {
    return undefined as unknown as AppDatabase;
  }

  if (!window.__appDatabase) {
    window.__appDatabase = new AppDatabase();
  }
  return window.__appDatabase;
})();

export const messagesTable =
  typeof window !== 'undefined' && database ? database.messages : undefined;

export default database;
