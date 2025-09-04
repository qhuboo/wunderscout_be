import { createClient, type RedisClientType } from "redis";
import config from "./config.js";

import { sendUpdateToClient } from "./ws.js";

const client: RedisClientType = createClient({ url: config.redis.url });

client.on("error", (err) => console.log("BE: Redis Client Error", err));
client.on("connect", () =>
	console.log("BE: Node-Redis Client: Attempting to connect...")
);
client.on("ready", () =>
	console.log("BE: Node-Redis Client: Connected and ready!")
);
client.on("end", () => console.log("BE: Node-Redis Client: Connection ended."));
client.on("reconnecting", () =>
	console.warn("BE: Node-Redis Client: Reconnecting...")
);

export async function initRedisSubscriber() {
	await client.connect();

	await client.subscribe("job_updates", (msg) => {
		try {
			const update = JSON.parse(msg);
			console.log("BE: Got update from worker: ", update);

			// Forward to WebSocket clients
			sendUpdateToClient(update.jobId, update);
		} catch (error) {
			console.log("BE: Failed to parse message: ", error);
		}
	});

	console.log("BE: Subscribed to job_updates channel.");
}
