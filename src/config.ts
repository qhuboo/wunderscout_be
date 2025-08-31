import path from "node:path";
import dotenv from "dotenv";
import * as z from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "./.env") });

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]).default("development"),
	PORT: z.string().default("4000"),
	AWS_ACCESS_KEY_ID: z.string(),
	AWS_SECRET_ACCESS_KEY: z.string(),
	AWS_REGION: z.string(),
	S3_BUCKET: z.string(),
});

const env = envSchema.parse(process.env);

const config = {
	nodeEnv: env.NODE_ENV,
	port: env.PORT,
	aws: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		region: env.AWS_REGION,
		s3Bucket: env.S3_BUCKET,
	},
};

export default config;
