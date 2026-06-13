import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { QUESTIONS } from './questions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.json({ status: 'ok', name: 'GuessIt2 Server' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const PORT = process.env.PORT || 3000;

function getRandomQuestions(count) {
  const allQuestions = QUESTIONS.flatMap(cat =>
    cat.questions.map(q => ({ ...q, category: cat.category }))
  );
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ─── Points System ─────────────────────────────────────────────────────────────
const POINTS_CORRECT = 100;

// ─── In-Memory Stores ──────────────────────────────────────────────────────────
const lobbies = {};
const socketToLobby = {};

// Game state per lobby
// {
//   questions: Question[],
//   currentIndex: number,
//   answers: Record<socketId, { answerIndex: number|null, answeredAt: number }>,
//   scores: Record<socketId, number>,
//   questionStartedAt: number,
//   roundTimer: NodeJS.Timeout | null,
//   readyPlayers: Set<socketId>,   // players who pressed "Pronto" after a round
//   phase: 'lobby' | 'playing' | 'done'
// }
const gameStates = {};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function generateLobbyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result;
  do {
    result = '';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  } while (lobbies[result]);
  return result;
}

function getLobbyPlayers(code) {
  return (lobbies[code]?.players ?? []);
}

function buildPlayerList(code) {
  const gs = gameStates[code];
  return getLobbyPlayers(code).map((p) => ({
    ...p,
    score: gs?.scores[p.id] ?? 0,
    bonuses: gs?.bonuses[p.id] ?? { fiftyFifty: 0, doublePoints: 0 },
  }));
}

// ─── Game Flow ─────────────────────────────────────────────────────────────────

const QUESTIONS_PER_GAME = 8;

function sendQuestion(code) {
  const gs = gameStates[code];
  if (!gs) return;

  const q = gs.questions[gs.currentIndex];

  console.log("domanda", q);

  if (!q) {
    endGame(code);
    return;
  }

  gs.questionStartedAt = Date.now();
  gs.answers = {}; // reset answers for this round
  gs.activeBonuses = {}; // reset active bonuses
  gs.usedBonuses = {}; // reset used bonuses tracking for this round

  const payload = {
    index: gs.currentIndex,
    total: gs.questions.length,
    question: q.question,
    options: q.options || [],
    category: q.category,
    image: q.id,
    type: q.type || 'multiple_choice',
    explaination: q.explaination || [],
    min: q.min,
    max: q.max,
    step: q.step,
    unit: q.unit,
  };

  console.log(`[Lobby ${code}] Sending question ${gs.currentIndex + 1}/${gs.questions.length}: "${q.question}"`);
  io.to(code).emit('newQuestion', payload);
  // No auto-advance timer: round resolves only when all players submit an answer
}

function resolveRound(code) {
  const gs = gameStates[code];
  if (!gs) return;

  if (gs.roundTimer) {
    clearTimeout(gs.roundTimer);
    gs.roundTimer = null;
  }

  const q = gs.questions[gs.currentIndex];
  const players = getLobbyPlayers(code);

  // Tally scores
  if (q.type === 'numeric') {
    let closestDiff = Infinity;
    let closestPlayers = [];

    // Find closest diff
    for (const player of players) {
      const ans = gs.answers[player.id];
      if (ans && ans.answerIndex !== null && ans.answerIndex !== undefined) {
        const diff = Math.abs(ans.answerIndex - q.correctValue);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestPlayers = [player.id];
        } else if (diff === closestDiff) {
          closestPlayers.push(player.id);
        }
      }
    }

    // Award points
    for (const playerId of closestPlayers) {
      const activeBonuses = gs.activeBonuses[playerId] || {};
      const pts = activeBonuses.doublePoints ? POINTS_CORRECT * 2 : POINTS_CORRECT;
      gs.scores[playerId] = (gs.scores[playerId] ?? 0) + pts;
    }
  } else {
    for (const player of players) {
      const ans = gs.answers[player.id];
      if (ans && ans.answerIndex === q.correctIndex) {
        const activeBonuses = gs.activeBonuses[player.id] || {};
        const pts = activeBonuses.doublePoints ? POINTS_CORRECT * 2 : POINTS_CORRECT;
        gs.scores[player.id] = (gs.scores[player.id] ?? 0) + pts;
      }
    }
  }

  const roundResult = {
    correctIndex: q.type === 'numeric' ? q.correctValue : q.correctIndex,
    answers: Object.fromEntries(
      Object.entries(gs.answers).map(([id, a]) => [id, a.answerIndex])
    ),
    scores: { ...gs.scores },
    players: buildPlayerList(code),
    usedBonuses: gs.usedBonuses || {},
  };

  console.log(`[Lobby ${code}] Round resolved. Scores:`, gs.scores);

  // Advance index and reset ready set — players must click "Pronto" to proceed
  gs.currentIndex += 1;
  gs.readyPlayers = new Set();

  io.to(code).emit('roundResult', roundResult);
}

function endGame(code) {
  const gs = gameStates[code];
  if (!gs) return;

  gs.phase = 'done';

  const sortedPlayers = buildPlayerList(code).sort((a, b) => b.score - a.score);
  console.log(`[Lobby ${code}] Game ended. Winner: ${sortedPlayers[0]?.name}`);
  io.to(code).emit('gameEnd', { players: sortedPlayers });

  // Clean up lobby
  setTimeout(() => {
    delete lobbies[code];
    delete gameStates[code];
    const toDelete = Object.entries(socketToLobby).filter(([, c]) => c === code).map(([id]) => id);
    for (const id of toDelete) delete socketToLobby[id];
    console.log(`[Lobby ${code}] Lobby cleaned up.`);
  }, 60000); // keep 60s in case of reconnects
}

// ─── Socket Handlers ───────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Create Lobby
  socket.on('createLobby', ({ username, profileImage }) => {
    if (!username || username.trim().length < 3) {
      socket.emit('joinError', 'Il nome deve avere almeno 3 caratteri');
      return;
    }

    const code = generateLobbyCode();
    lobbies[code] = {
      code,
      players: [{ id: socket.id, name: username.trim(), isHost: true, isReady: true, profileImage }],
    };
    socketToLobby[socket.id] = code;
    socket.join(code);

    console.log(`Lobby ${code} created by ${username} (${socket.id})`);
    socket.emit('lobbyState', lobbies[code]);
  });

  // 2. Join Lobby
  socket.on('joinLobby', ({ username, code, profileImage }) => {
    if (!username || username.trim().length < 3) {
      socket.emit('joinError', 'Il nome deve avere almeno 3 caratteri');
      return;
    }
    if (!code || code.trim().length !== 4) {
      socket.emit('joinError', 'Il codice deve essere di 4 caratteri');
      return;
    }

    const lobbyCode = code.trim().toUpperCase();
    const lobby = lobbies[lobbyCode];

    if (!lobby) { socket.emit('joinError', 'La lobby inserita non esiste'); return; }
    if (lobby.players.length >= 4) { socket.emit('joinError', 'La lobby è piena (max 4 giocatori)'); return; }

    const nameExists = lobby.players.some((p) => p.name.toLowerCase() === username.trim().toLowerCase());
    const finalUsername = nameExists ? `${username.trim()} (2)` : username.trim();

    lobby.players.push({ id: socket.id, name: finalUsername, isHost: false, isReady: false, profileImage });
    socketToLobby[socket.id] = lobbyCode;
    socket.join(lobbyCode);

    console.log(`User ${finalUsername} joined lobby ${lobbyCode}`);
    io.to(lobbyCode).emit('lobbyState', lobby);
  });

  // 3. Toggle Ready
  socket.on('toggleReady', () => {
    const code = socketToLobby[socket.id];
    if (!code || !lobbies[code]) return;

    const player = lobbies[code].players.find((p) => p.id === socket.id);
    if (player && !player.isHost) {
      player.isReady = !player.isReady;
      io.to(code).emit('lobbyState', lobbies[code]);
    }
  });

  // 4. Start Game
  socket.on('startGame', () => {
    const code = socketToLobby[socket.id];
    if (!code || !lobbies[code]) return;

    const lobby = lobbies[code];
    const player = lobby.players.find((p) => p.id === socket.id);

    if (player && player.isHost) {
      const allReady = lobby.players.every((p) => p.isReady);
      if (!allReady || lobby.players.length < 2) return;

      console.log(`Game starting in lobby ${code}`);

      // Init game state
      gameStates[code] = {
        questions: getRandomQuestions(QUESTIONS_PER_GAME),
        currentIndex: 0,
        answers: {},
        scores: Object.fromEntries(lobby.players.map((p) => [p.id, 0])),
        bonuses: Object.fromEntries(lobby.players.map((p) => [p.id, { fiftyFifty: 3, doublePoints: 3, targeting: 3 }])),
        activeBonuses: {},
        usedBonuses: {},
        questionStartedAt: 0,
        roundTimer: null,
        readyPlayers: new Set(),
        phase: 'playing',
      };

      io.to(code).emit('gameStarted');

      // Start sending questions after a brief countdown
      setTimeout(() => sendQuestion(code), 1500);
    }
  });

  // 5. Re-join Game (client reconnects to game screen)
  socket.on('rejoinGame', ({ lobbyCode }) => {
    const gs = gameStates[lobbyCode];
    if (!gs) return;

    // Make sure socket is in the room
    socket.join(lobbyCode);

    // If player not tracked yet (e.g. fresh socket after navigation)
    if (!socketToLobby[socket.id]) {
      socketToLobby[socket.id] = lobbyCode;
    }

    // Add score slot if new socket id
    if (gs.scores[socket.id] === undefined) {
      // Try to find old player by name – not easy, just give 0 for safety
      gs.scores[socket.id] = 0;
    }

    console.log(`[Lobby ${lobbyCode}] Socket ${socket.id} rejoined game`);
  });

  // 5b. Ready for next question (after round result)
  socket.on('readyForNext', () => {
    const code = socketToLobby[socket.id];
    if (!code) return;

    const gs = gameStates[code];
    if (!gs || gs.phase !== 'playing') return;

    gs.readyPlayers.add(socket.id);
    const totalPlayers = getLobbyPlayers(code).length;
    const readyCount = gs.readyPlayers.size;

    console.log(`[Lobby ${code}] Player ${socket.id} ready for next (${readyCount}/${totalPlayers})`);

    // Broadcast updated ready count to all players
    io.to(code).emit('readyCount', { ready: readyCount, total: totalPlayers });

    // Advance to next question when everyone is ready
    if (readyCount === totalPlayers) {
      if (gs.currentIndex < gs.questions.length) {
        sendQuestion(code);
      } else {
        endGame(code);
      }
    }
  });

  // 6. Submit Answer
  socket.on('submitAnswer', ({ answerIndex }) => {
    const code = socketToLobby[socket.id];
    if (!code) return;

    const gs = gameStates[code];
    if (!gs || gs.phase !== 'playing') return;

    // Don't overwrite an already submitted answer
    if (gs.answers[socket.id] !== undefined) return;

    gs.answers[socket.id] = {
      answerIndex: answerIndex ?? null,
      answeredAt: Date.now(),
    };

    const totalPlayers = getLobbyPlayers(code).length;
    const answeredCount = Object.keys(gs.answers).length;

    console.log(`[Lobby ${code}] Answer from ${socket.id}: ${answerIndex} (${answeredCount}/${totalPlayers})`);

    // If everyone has answered, resolve immediately
    if (answeredCount >= totalPlayers) {
      resolveRound(code);
    }
  });

  // 6b. Use Bonus
  socket.on('useBonus', ({ type }) => {
    const code = socketToLobby[socket.id];
    if (!code) return;
    const gs = gameStates[code];
    if (!gs || gs.phase !== 'playing') return;

    const playerBonuses = gs.bonuses[socket.id];
    if (!playerBonuses) return;

    // Check if player has already submitted an answer
    if (gs.answers[socket.id] !== undefined) return;

    if (!gs.usedBonuses) gs.usedBonuses = {};
    if (!gs.usedBonuses[socket.id]) gs.usedBonuses[socket.id] = {};

    if (type === 'fiftyFifty') {
      if (playerBonuses.fiftyFifty <= 0) return;
      const q = gs.questions[gs.currentIndex];
      if (q.type !== 'multiple_choice') return;
      
      const incorrectIndices = q.options.map((_, i) => i).filter(i => i !== q.correctIndex);
      incorrectIndices.sort(() => Math.random() - 0.5);
      const toDisable = incorrectIndices.slice(0, 2);

      playerBonuses.fiftyFifty--;
      gs.usedBonuses[socket.id].fiftyFifty = true;
      socket.emit('fiftyFiftyResult', { disabledIndices: toDisable });
    } else if (type === 'doublePoints') {
        if (playerBonuses.doublePoints <= 0) return;
        if (!gs.activeBonuses[socket.id]) gs.activeBonuses[socket.id] = {};
        if (gs.activeBonuses[socket.id].doublePoints) return; // already active

        playerBonuses.doublePoints--;
        gs.activeBonuses[socket.id].doublePoints = true;
        gs.usedBonuses[socket.id].doublePoints = true;
        socket.emit('doublePointsResult', { active: true });
      } else if (type === 'targeting') {
          // Targeting (mirino) bonus, only for numeric questions and usable once per question
          if (playerBonuses.targeting <= 0) return;
          // Prevent reuse within the same question
          if (gs.activeBonuses[socket.id] && gs.activeBonuses[socket.id].targeting) return; // already active
          const q = gs.questions[gs.currentIndex];
          if (q.type !== 'numeric') return;
          // Compute reduced range (e.g., 20% of original range centered around correct value)
          const originalMin = q.min ?? 0;
          const originalMax = q.max ?? 100;
          const range = originalMax - originalMin;
          const reducedRange = Math.max(1, Math.floor(range * 0.2));
          const correct = q.correctValue;
          const newMin = Math.max(originalMin, correct - Math.floor(reducedRange / 2));
          const newMax = Math.min(originalMax, correct + Math.ceil(reducedRange / 2));
          // Store active targeting range for this player
          if (!gs.activeBonuses[socket.id]) gs.activeBonuses[socket.id] = {};
          gs.activeBonuses[socket.id].targeting = { min: newMin, max: newMax };
          playerBonuses.targeting--;
          gs.usedBonuses[socket.id].targeting = true;
          socket.emit('targetingResult', { min: newMin, max: newMax });
        }
  });

  // 7. Leave Lobby
  socket.on('leaveLobby', () => handleUserLeaving(socket));

  // 8. Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    handleUserLeaving(socket);
  });
});

function handleUserLeaving(socket) {
  const code = socketToLobby[socket.id];
  if (!code) return;

  const lobby = lobbies[code];
  if (!lobby) {
    delete socketToLobby[socket.id];
    return;
  }

  const playerIndex = lobby.players.findIndex((p) => p.id === socket.id);
  if (playerIndex !== -1) {
    const leaving = lobby.players[playerIndex];
    lobby.players.splice(playerIndex, 1);
    socket.leave(code);
    console.log(`Player ${leaving.name} left lobby ${code}`);

    if (lobby.players.length === 0) {
      // Clean up game state too
      if (gameStates[code]?.roundTimer) clearTimeout(gameStates[code].roundTimer);
      delete lobbies[code];
      delete gameStates[code];
      console.log(`Lobby ${code} deleted (empty)`);
    } else {
      if (leaving.isHost) {
        lobby.players[0].isHost = true;
        lobby.players[0].isReady = true;
        console.log(`${lobby.players[0].name} is new host for lobby ${code}`);
      }
      io.to(code).emit('lobbyState', lobby);
    }
  }

  delete socketToLobby[socket.id];
}

server.listen(PORT, () => {
  console.log(`GuessIt! multiplayer server running on port ${PORT}`);
});
