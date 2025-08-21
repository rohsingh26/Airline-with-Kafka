import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import routes from "./routes/index.js";
import { connectMongo } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { connectKafka } from "./config/kafka.js";
import { streamToSocket } from "./realtime/streamToSocket.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (_, res) => res.json({ ok: true }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectMongo(process.env.MONGO_URI);
    await connectRedis();
    await connectKafka();

    // Stream Kafka → Socket.io
    await streamToSocket(io);

    server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Server start failed:", err);
  }
};

start();
