import mysql from "mysql2/promise";

// Validate required env vars at startup — fail fast
const required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER"] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Single connection pool shared across all API route invocations.
// mysql2 pool handles connection reuse, timeouts, and reconnects.
const pool = mysql.createPool({
  host:              process.env.DB_HOST,
  port:              Number(process.env.DB_PORT) || 3306,
  database:          process.env.DB_NAME,
  user:              process.env.DB_USER,
  password:          process.env.DB_PASSWORD ?? "",
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
  timezone:          "+00:00",        // store/retrieve all datetimes as UTC
  charset:           "utf8mb4",
});

export default pool;
