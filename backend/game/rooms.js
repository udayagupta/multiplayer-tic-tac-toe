const generateRoomCode = require("../utils/roomCode");

const GAME_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  WON: "won",
  DRAW: "draw",
}

const rooms = {};

const checkWinner = (board) => {
  const combinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [6, 4, 2],
  ];

  const winner = combinations.find(([a, b, c]) => 
    board[a] !== null && board[a] === board[b] && board[b] === board[c]
  );

  if (winner) {
    return board[winner[0]];
  }

  return board.includes(null) ? null : "draw";
  
}

const createRoom = (socketId) => {
  const roomCode = generateRoomCode(rooms);

  const room = {
    roomCode,
    players: [
      { socketId, symbol: 'X' },
    ],
    board: Array(9).fill(null),
    currentTurn: 'X',
    status: "waiting",
    rematchRequests: [],
  };

  rooms[roomCode] = room;
  return { success: true, room };
};

const joinRoom = (socketId, roomCode) => {
  console.log("joinRoom called, rooms before join:", Object.keys(rooms));

  if (!rooms[roomCode]) return { success: false, error: "Room not found" };
  if (rooms[roomCode].players.length >= 2) return { success: false, error: "Room already at full" };

  rooms[roomCode].players.push({ socketId, symbol: "O" });
  rooms[roomCode].status = "playing";

  return { success: true, room: rooms[roomCode] };
};

const isValidMove = (room, cellIndex, socketId) => {
  const currentPlayer = room.players.find(player => player.socketId === socketId);

  if (room.status !== "playing") return { success: false, error: "Game is already over" };
  if (!currentPlayer) return { success: false, error: "Player not found" };
  if (currentPlayer.symbol !== room.currentTurn) return { success: false, error: `Not ${currentPlayer.symbol}'s turn` };
  if (!(cellIndex >= 0 && cellIndex <= 8)) return { success: false, error: "Cell index out of bounds" };
  if (room.board[cellIndex] !== null) return { success: false, error: "Not empty" };

  return { success: true, message: "Move is valid" };
};

const applyMove = (room, cellIndex) => {
  room.board[cellIndex] = room.currentTurn;

  const newRoomStatus = checkWinner(room.board);

  if (newRoomStatus === 'X' || newRoomStatus === 'O') {
    room.status = "won";
    room.winner = newRoomStatus;
  } else if (newRoomStatus === "draw") {
    room.status = "draw";
  } else {
    room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
  }

  return room;
};

const requestRematch = (room, socketId) => {
  if (room.rematchRequests.includes(socketId)) return { success: false };

  room.rematchRequests.push(socketId);

  const rematchLenth = room.rematchRequests.length;

  if (rematchLenth === 1) {
    const player = room.players.find(player => player.socketId === socketId);
    room.currentTurn = player.symbol;
    room.previousStatus = room.status;
    room.status = "rematch_requested";
    return { success: true, room, isRematch: false };

  } else if (rematchLenth === 2) {
    // currentTurn already set in length === 1 block, intentionally kept
    room.status = "playing";
    room.board = Array(9).fill(null);
    room.winner = null;
    room.rematchRequests = [];
    return { success: true, room, isRematch: true };
  }
};


module.exports = { rooms, checkWinner, createRoom, joinRoom, isValidMove, applyMove, requestRematch };