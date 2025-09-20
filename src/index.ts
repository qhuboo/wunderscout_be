import express from "express";
import cors from "cors";
import config from "./lib/config.js";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

import { sendMessage } from "./lib/rabbit.js";

import { initRedisSubscriber } from "./lib/kv.js";
import { initWebSocket } from "./lib/ws.js";

import pool from "./lib/db.js";

const app = express();

app.use(express.json());
app.use(cors());

const s3 = new S3Client({
  region: config.aws.region,
});

app.get("/", (req, res) => {
  res.json({ status: "ok", env: config.nodeEnv });
});

app.post("/upload-url", async (req, res) => {
  const { fileName, contentType } = req.body;
  try {
    const jobId = uuidv4();
    const ext = fileName?.split(".").pop();
    const key = ext ? `uploads/${jobId}.${ext}` : `uploads/${jobId}`;
    const command = new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return res.json({ url: uploadURL, jobId, key });
  } catch (error) {
    console.log("Error generating url: ", error);
    res.status(500).json({ error: "Failed to generate upload URL." });
  }
});

app.post("/jobs", (req, res) => {
  const { jobId, key } = req.body;

  try {
    const ok = sendMessage("test_queue", JSON.stringify({ jobId, key }));

    if (!ok) {
      return res.status(500).json({ message: "Failed to enqueue job." });
    }

    return res.json({ message: "Job enqueued." });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({ Error: "Failed to enqueue job." });
  }
});

app.get("/db-health", async (req, res) => {
  console.log("In the api");
  const response = await pool.query("SELECT * FROM users;");
  return res.json({ message: "Okay" })
});

const server = app.listen(config.port, async () => {
  console.log("BE: Server running.");
  initWebSocket(server);
  await initRedisSubscriber();
});
