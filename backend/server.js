require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const { Server } = require("socket.io");


const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: { origin: "*" },
})

app.set("io", io);

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on ${process.env.PORT || 5000}`)
})