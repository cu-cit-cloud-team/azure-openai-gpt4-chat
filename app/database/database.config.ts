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

export const messagesTable = database.table('messages');

export default database;
