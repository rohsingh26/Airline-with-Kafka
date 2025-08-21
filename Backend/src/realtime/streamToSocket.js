// src/realtime/streamToSocket.js
import { consumer } from "../config/kafka.js";

/**
 * Stream Kafka events to connected Socket.io clients
 * @param {Server} io - socket.io server instance
 */
export async function streamToSocket(io) {
  try {
    // Subscribe to correct topics
    await consumer.subscribe({ topic: "flight-events", fromBeginning: false });
    await consumer.subscribe({ topic: "baggage-events", fromBeginning: false });

    // Start consuming
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value.toString());

          if (topic === "flight-events") {
            io.emit("flightUpdate", event);
          }

          if (topic === "baggage-events") {
            io.emit("baggageUpdate", event);
          }

          console.log(`Kafka → WS | ${topic}:`, event);
        } catch (err) {
          console.error("Kafka message parse error:", err);
        }
      },
    });

    console.log("✅ Kafka → Socket streaming started");
  } catch (err) {
    console.error("❌ Error in streamToSocket:", err);
  }
}
