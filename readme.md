# Multiplayer Tic-Tac-Toe

A real-time multiplayer tic-tac-toe game built with the MERN stack and Socket.io. Two players can create or join a room with a code, or find a match instantly via the matchmaking queue. The server holds all game state — clients only render what the server says is true.

**Live demo:** _coming soon_

---

## Features

- **Real-time gameplay** — moves sync instantly across both players via WebSockets
- **Room codes** — create a private room and share the code with a friend
- **Quick Play** — jump into a matchmaking queue and get paired automatically
- **Rematch flow** — either player can request a rematch after a game ends; the other can accept or decline
- **Disconnect handling** — the remaining player is notified if their opponent leaves mid-game
- **Server-authoritative state** — all move validation and win detection happens on the server, not the client

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Real-time | Socket.io |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture

The project is split into two layers that are deliberately kept separate:

**Game logic (`server/game/rooms.js`)** — pure functions with no network awareness. `checkWinner`, `applyMove`, `isValidMove`, `createRoom`, `joinRoom`, and `requestRematch` all operate on plain JS objects and can be tested without a server running.

**Socket layer (`server/sockets/gameSocket.js`)** — thin event handlers that call into the game logic layer and broadcast results. No game rules live here.

This separation means the server is the single source of truth. Clients send move requests; the server validates them, updates state, and emits the result to both players.

---

## Socket events

| Event | Direction | Description |
|---|---|---|
| `create_room` | client → server | Create a new room, receive a room code |
| `join_room` | client → server | Join an existing room by code |
| `find_match` | client → server | Join the matchmaking queue |
| `cancel_match` | client → server | Leave the matchmaking queue |
| `make_move` | client → server | Attempt to place a mark on a cell |
| `leave_room` | client → server | Intentionally leave a game |
| `request_rematch` | client → server | Request or accept a rematch |
| `rematch_declined` | client → server | Decline a rematch request |
| `room_created` | server → client | Confirms room creation with room code |
| `game_start` | server → both | Game is ready, sends initial room state |
| `game_update` | server → both | Sends updated room state after a move |
| `player_disconnected` | server → client | Opponent left the game |
| `rematch_initiated` | server → client | Confirms rematch request was sent |
| `rematch_requested` | server → client | Notifies opponent of rematch request |
| `request_declined` | server → client | Notifies requester that rematch was declined |

---

## Getting started

### Prerequisites
- Node.js v18+
- npm

### Installation

Clone the repo:
```bash
git clone https://github.com/yourusername/multiplayer-tic-tac-toe.git
cd multiplayer-tic-tac-toe
```

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Environment variables

Create a `.env` file in the `backend/` folder:
```
PORT=5000
```

### Running locally

Start the backend:
```bash
cd backend
node server.js
```

Start the frontend (in a separate terminal):
```bash
cd frontend
npm run dev
```

Open two browser tabs at `http://localhost:5173` to test multiplayer.

---

## What I learned

- **Server-authoritative game state** — keeping all game logic on the server prevents cheating and keeps clients in sync. The key insight: clients send *requests*, the server decides *what actually happened*, then broadcasts the result to everyone.

- **Socket.io room management** — using Socket.io's built-in room feature (`socket.join`, `io.to(roomCode).emit`) to scope events to specific games rather than broadcasting to all connected clients.

- **Designing before coding** — planning the event table, state shape, and function signatures in plain English before writing any code made the implementation significantly smoother. Confusion mid-code is usually a sign of an unresolved design decision, not a knowledge gap.

- **Separation of concerns** — keeping pure game logic completely decoupled from the networking layer made both easier to reason about and debug independently.

- **Real-time state sync edge cases** — handling the timing problem where Player 2 navigates to the game page after `game_start` has already fired, requiring the room state to be passed via React Router's location state.
