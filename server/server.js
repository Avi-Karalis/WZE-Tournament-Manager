import express from 'express';
import cors from 'cors';
import {Player} from '../lib/player.js';
import db from '../data/db.js';
import { getAllPlayers, savePlayer } from '../lib/player-store.js';
import { pairNextRound, recordMatchResult, assignBye } from '../lib/pairing.js';



let round = 1;
const maxRounds = 3;

function incrementRound() {
  if (round < maxRounds) {
    round++;
  }
}
function resetTournament() {
    round = 1; // Reset for a new tournament
    db.exec('DELETE FROM matches', (err) => {
        if (err) {
            console.error('Error deleting matches:', err);
            return;
        }
    })
        // Step 2: Reset player stats (tournamentPoints, victoryPoints, hasBye)
    db.exec('UPDATE players SET tournamentPoints = 0, victoryPoints = 0, hasBye = 0', function(err) {
        if (err) {
            console.error('Error resetting player stats:', err);
            return;
        }

        console.log('Tournament reset successful.');
    });
};

const app = express();
app.use(cors());
app.use(express.json());

app.post('/round', (req, res) => {
    let {fromFront} = req.body;

    const stmt = db.prepare(`
        SELECT AVG(p1Score + p2Score) AS avgVP
        FROM matches
        WHERE round = ?;
      `);
      const result = stmt.get(round);
      const avgVP = result?.avgVP ?? 0;
      
      // 2. Update the p1Score for the match where player2 = 'BYE'
      db.prepare(`
        UPDATE matches
        SET p1Score = ?
        WHERE round = ? AND player2 = 'BYE';
      `).run(avgVP, round);
      
      // 3. Get the name of the player who got the BYE
      const match = db.prepare(`
        SELECT player1
        FROM matches
        WHERE round = ? AND player2 = 'BYE';
      `).get(round);
      
      if (match) {
        const playerName = match.player1;
      
        // 4. Update that player's victoryPoints
        db.prepare(`
          UPDATE players
          SET victoryPoints = victoryPoints + ?
          WHERE name = ?;
        `).run(Math.floor(avgVP), playerName);
    incrementRound();

    res.json(round);
}});


app.get('/players', (req, res) => {
    res.json(getAllPlayers());
});

app.post('/pairings', (req, res) => {
    if (round > maxRounds) {
        return "tournament is over";
    }

    const players = getAllPlayers();
    const pairs = pairNextRound(players, round);
    res.json(pairs.map(([p1, p2]) => ({
        p1: p1.name,
        p2: p2?.name ?? null
    })));
});

app.post('/match', (req, res) => {
    if (round > maxRounds) {
        return res.status(400).send('Tournament has ended.');
    }
    const { p1, p2, vp1, vp2 } = req.body;
    const players = getAllPlayers();
    const player1 = players.find(p => p.name === p1);
    const player2 = p2 ? players.find(p => p.name === p2) : null;
    console.log("player 2 " + player2);
    if (player2!==null) {
        console.log("hi")
        recordMatchResult(player1, player2, vp1, vp2, round);
    } 
   
    res.sendStatus(200);
});

app.post('/register', (req, res) => {
    const { name,faction } = req.body;
    const player = new Player(name, faction);
    savePlayer(player);
    res.status(201).json(player);
});

app.post('/reset', (req, res) => {
    resetTournament();
    res.sendStatus(200);
});

app.delete('/player/:name', (req, res) => {
    const { name } = req.params;
    const stmt = db.prepare('DELETE FROM players WHERE name = ?');
    const result = stmt.run(name);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Player not found' });
    }

    res.status(200).json({ message: `Player ${name} deleted.` });
});
app.put('/player/:name', (req, res) => {
    const originalName = req.params.name;
    const { name, faction } = req.body;

    const players = getAllPlayers();
    const existing = players.find(p => p.name === originalName);
    if (!existing) return res.status(404).json({ error: 'Player not found' });

    existing.name = name;
    existing.faction = faction;
    savePlayer(existing); // Re-save with updated name/faction
    res.status(200).json(existing);
});
app.listen(3000, () => console.log('Server running at http://localhost:3000'));
// // distro
// import path from 'path'
// import { fileURLToPath } from 'url'

// const __dirname = path.dirname(fileURLToPath(import.meta.url))
// const frontendPath = path.join(__dirname, '../frontend/dist')
// app.use(express.static(frontendPath))
// //