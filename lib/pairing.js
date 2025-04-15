import db from '../data/db.js';
import { savePlayer } from './player-store.js';
import {getOpponentsFromDB, storeOpponentsInDB } from "../lib/player-store.js";
export function assignBye(player, round) {
    player.tournamentPoints += 5;
    player.hasBye = true;
    const stmt = db.prepare(`
        SELECT AVG(p1Score + p2Score) AS average_vp
        FROM matches
        WHERE round = ?;
      `);
      const result = stmt.get(round);
      const avgVP = result?.average_vp ?? 0;
    db.prepare(`
    INSERT INTO matches (round, player1, player2, p1Score, p2Score)
    VALUES (?, ?, ?, ?, 0)
  `).run(round, player.name, "BYE" ,avgVP);
    savePlayer(player);
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

export function pairNextRound(players, round) {
    players = round === 1 ? shuffle(players) : players;

    for (const player of players) {
        player.opponents = getOpponentsFromDB(player.name);
    }

    const sorted = [...players].sort((a, b) => {
        if (b.tournamentPoints !== a.tournamentPoints)
            return b.tournamentPoints - a.tournamentPoints;
        return b.victoryPoints - a.victoryPoints;
    });

    const pairs = [];
    const used = new Set();

    if (sorted.length % 2 !== 0) {
        let byeIndex = sorted.length - 1;
        while (byeIndex >= 0 && (sorted[byeIndex].hasBye || used.has(sorted[byeIndex].name))) {
            byeIndex--;
        }

        if (byeIndex >= 0) {
            const byePlayer = sorted[byeIndex];
            assignBye(byePlayer, round);
            used.add(byePlayer.name);
            pairs.push([byePlayer, null]);
        } else {
            console.warn("No valid bye candidate found.");
        }
    }

    for (let i = 0; i < sorted.length; i++) {
        const p1 = sorted[i];
        if (used.has(p1.name)) continue;

        let found = false;
        for (let j = i + 1; j < sorted.length; j++) {
            const p2 = sorted[j];
            if (used.has(p2.name)) continue;
            if (!p1.opponents.includes(p2.name)) {
                pairs.push([p1, p2]);
                used.add(p1.name);
                used.add(p2.name);
                storeOpponentsInDB(p1.name, p2.name);
                found = true;
                break;
            }
        }

        if (!found) {
            for (let j = i + 1; j < sorted.length; j++) {
                const p2 = sorted[j];
                if (used.has(p2.name)) continue;
                pairs.push([p1, p2]);
                used.add(p1.name);
                used.add(p2.name);
                storeOpponentsInDB(p1.name, p2.name);
                break;
            }
        }
    }

    return pairs;
}

export function recordMatchResult(p1, p2, vp1, vp2, round) {
    if (p2!==null){

    
        p1.victoryPoints += vp1;
        p2.victoryPoints += vp2;

        if (vp1 > vp2) {p1.tournamentPoints += 5; p2.tournamentPoints += 1;}
        else if (vp2 > vp1) {p2.tournamentPoints += 5; p1.tournamentPoints += 1;}
        else {
            p1.tournamentPoints += 3;
            p2.tournamentPoints += 3;
        }

        db.prepare(`
        INSERT INTO matches (round, player1, player2, p1Score, p2Score)
        VALUES (?, ?, ?, ?, ?)
    `).run(round, p1.name, p2.name, vp1, vp2);

        savePlayer(p1);
        savePlayer(p2);
    }

    
}