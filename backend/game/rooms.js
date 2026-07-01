const generateRoomCode = require("../utils/roomCode");

const rooms = {};

const checkWinner = (board) => {
  const combinations = [
    [0, 1, 2], 
    [3, 4, 5], 
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2],
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
    status: "waiting"
  };

  rooms[roomCode] = room;
  return { success: true, room };
};

const joinRoom = (socketId, roomCode) => {
  if (!rooms[roomCode]) return { success: false, error: "Room not found" };
  if (rooms[roomCode].players.length >= 2) return { success: false, error: "Room already at full" };

  rooms[roomCode].players.push({ socketId, symbol: "O" });
  rooms[roomCode].status = "playing";

  return { success: true, room: rooms[roomCode] };
};

const isValidMove = (room, cellIndex, socketId) => {
  const currentPlayer = room.players.find(pl => pl.socketId === socketId);

  if (room.status !== "playing") return false;
  if (!currentPlayer) return false;
  if (currentPlayer.symbol !== room.currentTurn) return false;
  if (!(cellIndex >= 0 && cellIndex <= 8)) return false;
  if (room.board[cellIndex] !== null) return false;

  return true;
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

module.exports = { rooms, checkWinner, createRoom, joinRoom, isValidMove, applyMove };

