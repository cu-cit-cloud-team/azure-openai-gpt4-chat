import Dexie from 'dexie';

export const database = new Dexie('database');

// initial version
database.version(1).stores({
  messages: '&id, role, content, createdAt',
});

// add model information to each message
database
  .version(2)
  .stores({
    messages: '&id, role, content, createdAt, model, modelString',
  })
  .upgrade((tx) => {
    return tx.messages.toCollection().modify((message) => {
      message.model = 'gpt-4o';
      message.modelString = 'Azure OpenAI GPT-4o (2024-08-06)';
    });
  });

// remove modelString column
database.version(3).stores({
  messages: '&id, role, content, createdAt, model',
});

// Add parts array support for AI SDK v5 (keeping content for backward compatibility)
database.version(4).stores({
  messages: '&id, role, content, createdAt, model, parts',
});

// Migrate to pure AI SDK v5 format - remove v4 fields, clear old data
database
  .version(5)
  .stores({
    messages: '&id, role, parts, createdAt, model',
  })
  .upgrade((tx) => {
    // Clear all existing messages to start fresh with v5 format
    return tx.messages.clear();
  });

export const messagesTable = database.table('messages');

export default database;
