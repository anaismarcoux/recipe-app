import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('recipebook.db');

  await db.execAsync(`PRAGMA journal_mode = WAL;`);
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '🍽️',
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY NOT NULL,
      categoryId TEXT NOT NULL,
      title TEXT NOT NULL,
      imageUri TEXT,
      steps TEXT NOT NULL DEFAULT '',
      cookTimeMinutes INTEGER,
      notes TEXT,
      yieldAmount REAL,
      yieldUnit TEXT,
      totalWeightGrams REAL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY NOT NULL,
      recipeId TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'g',
      calories REAL NOT NULL DEFAULT 0,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `);

  return db;
}

export async function seedDefaultCategories(): Promise<void> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );

  if (result && result.count === 0) {
    const now = new Date().toISOString();
    const defaults = [
      { name: 'Breakfast', emoji: '🥣' },
      { name: 'Soups', emoji: '🍲' },
      { name: 'Curries', emoji: '🍛' },
      { name: 'Desserts', emoji: '🍰' },
    ];

    for (let i = 0; i < defaults.length; i++) {
      const id = `default-${defaults[i].name.toLowerCase()}`;
      await database.runAsync(
        'INSERT INTO categories (id, name, emoji, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?)',
        id, defaults[i].name, defaults[i].emoji, i, now
      );
    }
  }
}
