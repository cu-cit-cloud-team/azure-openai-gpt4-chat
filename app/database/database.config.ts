import type { UIMessage } from 'ai';
import Dexie, { type Table } from 'dexie';

export interface StoredMessage extends UIMessage {
  model: string;
  createdAt: string;
}

export class AppDatabase extends Dexie {
  messages!: Table<StoredMessage>;

  constructor() {
    super('database');

    // initial version
    this.version(1).stores({
      messages: '&id, role, content, createdAt',
    });

    // add model information to each message
    this.version(2)
      .stores({
        messages: '&id, role, content, createdAt, model, modelString',
      })
      .upgrade((tx) => {
        return tx
          .table('messages')
          .toCollection()
          .modify((message: any) => {
            message.model = 'gpt-4o';
            message.modelString = 'Azure OpenAI GPT-4o (2024-08-06)';
          });
      });

    // remove modelString column
    this.version(3).stores({
      messages: '&id, role, content, createdAt, model',
    });

    // Add parts array support for AI SDK v5 (keeping content for backward compatibility)
    this.version(4).stores({
      messages: '&id, role, content, createdAt, model, parts',
    });

    // Migrate to pure AI SDK v5 format - remove v4 fields, clear old data
    this.version(5)
      .stores({
        messages: '&id, role, parts, createdAt, model',
      })
      .upgrade((tx) => {
        // Clear all existing messages to start fresh with v5 format
        return tx.table('messages').clear();
      });
  }
}

export const database = new AppDatabase();
export const messagesTable = database.messages;

export default database;
