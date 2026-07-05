const { rooms, applyMove, checkWinner, createRoom, isValidMove, joinRoom, requestRematch } = require("../game/rooms");

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
    });

    socket.on("request_rematch", ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;

        const result = requestRematch(room, socket.id);

        if (result.success && !result.isRematch) {
            const otherPlayer = room.players.find(player => player.socketId !== socket.id);
            io.to(otherPlayer.socketId).emit("rematch_requested", result.room);
            socket.emit("rematch_initiated", result.room);
            
        } else if (result.success && result.isRematch) {
            io.to(room.roomCode).emit("game_start", result.room);
        
        } else if (!result.success) {
            socket.emit("error", "Could not complete this action");
        }

    })

    socket.on("rematch_declined", ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;

        const waiter = room.rematchRequests[0];

        io.to(waiter).emit("request_declined");
        room.rematchRequests = [];
        room.status = room.previousStatus;
    })

}

module.exports = gameSocket;