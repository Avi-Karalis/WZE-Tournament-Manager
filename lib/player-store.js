import db from '../data/db.js';
import { Player } from './player.js';

export function getAllPlayers() {
    const rows = db.prepare('SELECT * FROM players').all();
    const players = rows.map(row => {
        const p = new Player(row.name);
        p.tournamentPoints = row.tournamentPoints;
        p.victoryPoints = row.victoryPoints;
        p.hasBye = !!row.hasBye;
        p.faction = row.faction;
        const opponentRows = db.prepare('SELECT opponent FROM opponents WHERE player = ?').all(row.name);
        p.opponents = opponentRows.map(r => r.opponent);
        return p;
    });
    return players;
}

export function savePlayer(player) {
    db.prepare(`
    INSERT INTO players (name, faction ,tournamentPoints, victoryPoints, hasBye)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      tournamentPoints = excluded.tournamentPoints,
      victoryPoints = excluded.victoryPoints,
      hasBye = excluded.hasBye
  `).run(player.name, player.faction , player.tournamentPoints, player.victoryPoints, player.hasBye? 1 : 0);

}

export function getOpponentsFromDB(playerName) {
    return db.prepare(`SELECT opponent FROM opponents WHERE player = ?`).all(playerName).map(row => row.opponent);
}

export function storeOpponentsInDB(p1, p2) {
    const stmt = db.prepare(`INSERT OR IGNORE INTO opponents (player, opponent) VALUES (?, ?)`);
    stmt.run(p1, p2);
    stmt.run(p2, p1);
}

