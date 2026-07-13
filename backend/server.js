require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
// const connectDB = require("./config/db");
const { Server } = require("socket.io");
const gameSocket = require("./sockets/gameSocket");

const app = express();
const server = http.createServer(app);

// connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
    cors: { 
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log("new connection:", socket.id);
    gameSocket(io, socket);
})

io.engine.on("connection_error", (err) => {
    console.log("Connection error:", err.req, err.code, err.message, err.context);
});


server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on ${process.env.PORT || 5000}`);
})