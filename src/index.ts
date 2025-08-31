import express from "express";
import cors from "cors";
import config from "./config.js";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

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
		const videoId = uuidv4();
		const ext = fileName?.split(".").pop();
		const key = ext ? `uploads/${videoId}.${ext}` : `uploads/${videoId}`;
		const command = new PutObjectCommand({
			Bucket: config.aws.s3Bucket,
			Key: key,
			ContentType: contentType,
		});

		const uploadURL = await getSignedUrl(s3, command, { expiresIn: 3600 });

		return res.json({ url: uploadURL });
	} catch (error) {
		console.log("Error generating url: ", error);
		res.status(500).json({ error: "Failed to generate upload URL." });
	}
});

const server = app.listen(config.port, () => {
	console.log("Server running.");
});
