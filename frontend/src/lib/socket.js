import { io, Socket } from "socket.io-client";

export const SOCKET_URL = "http://localhost:5000";
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["polling", "websocket"],
});