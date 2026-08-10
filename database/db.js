import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getDB() {
  const db = await open({
    filename: path.join(__dirname, 'database.db'),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      email TEXT UNIQUE,
      password TEXT,
      age TEXT,
      institution TEXT,
      subjects TEXT,
      location TEXT,
      studyMode TEXT
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subject TEXT,
      deadline TEXT,
      dailyHours TEXT,
      studyMode TEXT,
      priority TEXT,
      userId INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS partnerRequests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      subject TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS calendarEvents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT
    );
  `);

  return db;
}