import db from '../data/db.js';
import { savePlayer } from './player-store.js';

export function assignBye(player, round) {
    player.tournamentPoints += 3;
    player.hasBye = true;
    db.prepare(`
    INSERT INTO matches (round, player1, player2, p1Score, p2Score)
    VALUES (?, ?, NULL, 0, 0)
  `).run(round, player.name);
    savePlayer(player);
}


export function pairNextRound(players) {
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
            assignBye(byePlayer);
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
                p1.opponents.push(p2.name);
                p2.opponents.push(p1.name);
                pairs.push([p1, p2]);
                used.add(p1.name);
                used.add(p2.name);
                found = true;
                break;
            }
        }

        if (!found) {
            for (let j = i + 1; j < sorted.length; j++) {
                const p2 = sorted[j];
                if (used.has(p2.name)) continue;
                p1.opponents.push(p2.name);
                p2.opponents.push(p1.name);
                pairs.push([p1, p2]);
                used.add(p1.name);
                used.add(p2.name);
                break;
            }
        }
    }

    return pairs;
}
export function recordMatchResult(p1, p2, vp1, vp2, round) {
    p1.victoryPoints += vp1;
    p2.victoryPoints += vp2;

    if (vp1 > vp2) p1.tournamentPoints += 3;
    else if (vp2 > vp1) p2.tournamentPoints += 3;
    else {
        p1.tournamentPoints += 1;
        p2.tournamentPoints += 1;
    }

    db.prepare(`
    INSERT INTO matches (round, player1, player2, p1Score, p2Score)
    VALUES (?, ?, ?, ?, ?)
  `).run(round, p1.name, p2.name, vp1, vp2);

    savePlayer(p1);
    savePlayer(p2);
}