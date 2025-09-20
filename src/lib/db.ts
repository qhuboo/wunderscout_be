import { Pool } from "pg"
import config from "./config.js"

if (!config.postgres.url) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({
  connectionString: config.postgres.url,
});

export default pool;

