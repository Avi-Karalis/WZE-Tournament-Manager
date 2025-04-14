import Database from 'better-sqlite3';

const db = new Database('./database.db', { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    name TEXT PRIMARY KEY,
    tournamentPoints INTEGER DEFAULT 0,
    victoryPoints INTEGER DEFAULT 0,
    hasBye INTEGER DEFAULT 0,
    faction TEXT
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round INTEGER,
    player1 TEXT,
    player2 TEXT,
    p1Score INTEGER,
    p2Score INTEGER
  );

  CREATE TABLE IF NOT EXISTS opponents (
    player TEXT,
    opponent TEXT,
    UNIQUE(player, opponent)
  );
`);

export default db;