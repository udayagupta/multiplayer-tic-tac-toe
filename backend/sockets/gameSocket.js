const { rooms, applyMove, checkWinner, createRoom, isValidMove, joinRoom } = require("../game/rooms");

const gameSocket = (io, socket) => {
    socket.on("create_room", () => {
        const result = createRoom(socket.id);
        console.log("rooms after create:", Object.keys(rooms));

        socket.join(result.room.roomCode);
        socket.emit("room_created", {
            roomCode: result.room.roomCode
        });

    });

    socket.on("join_room", ({ roomCode }) => {
        const result = joinRoom(socket.id, roomCode);

        if (!result.success) {
            socket.emit("error", result.error)
        } else {
            socket.join(roomCode);
            io.to(roomCode).emit("game_start", rooms[roomCode]);
        }

    });
    
    socket.on("make_move", ({ roomCode, cellIndex }) => {
        const room = rooms[roomCode];
        const validMove = isValidMove(room, cellIndex, socket.id);

        if (validMove.success) {
            const result = applyMove(room, cellIndex);
            io.to(roomCode).emit("game_update", result);

        } else {
            console.log("not a valid move")
            socket.emit("error", validMove.error)
        }
    });

    socket.on("disconnect", () => {
        console.log("disconnect fired for", socket.id);
        console.log("current rooms:", JSON.stringify(rooms, null, 2));

        const room = Object.values(rooms).find(r => r.players.find(pl => pl.socketId === socket.id));
        if (!room) return;

        const { roomCode } = room;

        io.to(roomCode).emit("player_disconnected", {
            message: "Your opponent disconnected",
            roomCode
        })

        delete rooms[roomCode];
    });

    socket.on("leave_room", ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;

        io.to(roomCode).emit("player_disconnected", {
            message: "Your opponent disconnected",
            roomCode
        });

        delete rooms[roomCode];
        socket.leave(roomCode)

    })
}

module.exports = gameSocket;