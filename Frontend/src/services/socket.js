import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000"; // backend base url

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
});
