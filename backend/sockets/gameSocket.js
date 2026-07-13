const { rooms, applyMove, checkWinner, createRoom, isValidMove, joinRoom, requestRematch } = require("../game/rooms");
let { queue } = require("../game/rooms");

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
        console.log({ queue });

        const queueIndex = queue.indexOf(socket.id);
        if (queueIndex !== -1) {
            queue = queue.filter(id => id !== socket.id)
        };

        const room = Object.values(rooms).find(r => r.players.find(pl => pl.socketId === socket.id));
        console.log("room found in disconnect:", room?.roomCode);
        if (!room) return;

        const { roomCode } = room;

        io.to(roomCode).emit("player_disconnected", {
            message: "Your opponent disconnected",
            roomCode
        })

        delete rooms[roomCode];
    });

    socket.on("leave_room", ({ roomCode }) => {
        console.log("leave_room fired", roomCode);
        
        const room = rooms[roomCode];
        console.log("room found:", room);
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

        room.rematchRequests = [];
        room.status = room.previousStatus;
        room.rematchStatus = "declined";
        io.to(waiter).emit("request_declined", room);
    })

    socket.on("find_match", () => {
        if (queue.includes(socket.id)) return;

        queue.push(socket.id);
        console.log({ queue, messsage: `${socket.id} is finding a match` });

        if (queue.length >= 2) {
            const playerAId = queue.shift();
            const playerBId = queue.shift();

            // in-memory room
            const { room } = createRoom(playerAId);
            joinRoom(playerBId, room.roomCode);

            // Socket.io room
            const playerASocket = io.sockets.sockets.get(playerAId);
            playerASocket.join(room.roomCode);
            socket.join(room.roomCode);

            io.to(room.roomCode).emit("game_start", rooms[room.roomCode]);

        }
    })

    socket.on("cancel_match", () => {
        console.log("before cancel_match", Object.keys(rooms), queue);

        queue = queue.filter(id => id !== socket.id)

        console.log("after cancel_match", Object.keys(rooms), queue);

    })

}

module.exports = gameSocket;