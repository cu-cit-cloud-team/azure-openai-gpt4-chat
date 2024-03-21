import Dexie from 'dexie';

export const database = new Dexie('database');

database.version(1).stores({
  messages: '&id, role, content, createdAt',
});

export const messagesTable = database.table('messages');

export default database;
