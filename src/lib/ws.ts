import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";

const jobClients = new Map<string, WebSocket>();

export function initWebSocket(server: Server) {
  // Attach websocket server to the same HTTP server
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("BE: Client connected.");

    ws.send(JSON.stringify({ message: "Hello from the WebSocket!" }));

    ws.on("message", (msg) => {
      // Clients send message to subscribe to job.
      try {
        const data = JSON.parse(msg.toString());
        console.log("BE: Client Subscribed: ", data);

        if (data.jobId) {
          console.log(`BE[initWebSocket][onMessage] We hace subscribed and added client to list.`)
          jobClients.set(data.jobId, ws);
          console.log(`BE[initWebSocket][onMessage] jobClients: ${Array.from(jobClients.entries())}`)
          console.log("BE: Client subscribed to job: ", data.jobId);
        }
      } catch (error) {
        console.log("Invalid WS message: ", msg);
      }
    });

    ws.on("close", () => {
      console.log("BE: Client disconnected.");
      // Clean up any job subscriptions for this socket.
      for (const [jobId, client] of jobClients.entries()) {
        if (client === ws) {
          jobClients.delete(jobId);
        }
      }
    });
  });
}

export function sendUpdateToClient(jobId: string, update: any) {
  console.log(`BE[sendUpdateToClient]: Sending update to client subscribed to jobId:${jobId}.`);
  const client = jobClients.get(jobId);
  console.log(`BE[sendUpdateToClient]: Client found: ${client}`)
  if (client && client.readyState === WebSocket.OPEN) {
    console.log(`BE[sendUpdateToClient] Client found!`)
    client.send(JSON.stringify(update));
  }
}
