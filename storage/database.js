import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';

export async function setupDatabase() {
  const dbFile = join(process.cwd(), 'storage', 'db.json');
  const defaultData = {
    users: [],
    groups: [],
    premiumUsers: [],
    commandSettings: {},
    stats: {}
  };

  const adapter = new JSONFile(dbFile);
  const db = new Low(adapter, defaultData);
  await db.read();

  global.db = db.data;
  global.db.save = async function () {
    await db.write();
  };

  return db;
}
