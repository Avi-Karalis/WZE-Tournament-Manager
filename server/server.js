import express from 'express';
import cors from 'cors';
import {Player} from '../lib/player.js';
import db from '../data/db.js';
import { getAllPlayers, savePlayer } from '../lib/player-store.js';
import { pairNextRound, recordMatchResult, assignBye } from '../lib/pairing.js';

const app = express();
app.use(cors());
app.use(express.json());

let round = 1;

app.get('/players', (req, res) => {
    res.json(getAllPlayers());
});

app.post('/pairings', (req, res) => {
    const players = getAllPlayers();
    const pairs = pairNextRound(players, round);
    res.json(pairs.map(([p1, p2]) => ({
        p1: p1.name,
        p2: p2?.name ?? null
    })));
});

app.post('/match', (req, res) => {
    const { p1, p2, vp1, vp2 } = req.body;
    const players = getAllPlayers();
    const player1 = players.find(p => p.name === p1);
    const player2 = p2 ? players.find(p => p.name === p2) : null;

    if (player2) {
        recordMatchResult(player1, player2, vp1, vp2, round);
    } else {
        assignBye(player1, round);
    }

    res.sendStatus(200);
});
app.post('/register', (req, res) => {
    const { name,faction } = req.body;
    const player = new Player(name, faction);
    savePlayer(player);
    res.status(201).json(player);
});
app.listen(3000, () => console.log('Server running at http://localhost:3000'));
