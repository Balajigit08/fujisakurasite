/**
 * Migration runner
 * Usage: npx tsx lib/db/migrate.ts
 *
 * - Reads all .sql files from lib/migrations/ in filename order
 * - Creates the migrations tracking table if it doesn't exist
 * - Skips migrations already recorded in the tracking table
 * - Runs each pending migration inside a transaction
 * - Records successful migrations
 * - Safe to run multiple times (idempotent)
 */

import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load .env.local for local development
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const MIGRATIONS_DIR = path.join(process.cwd(), "lib", "migrations");

async function run() {
  const dbName = process.env.DB_NAME || "fujisakura_db";

  // First connect to MySQL server without selecting a specific database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
    timezone: "+00:00",
    charset: "utf8mb4",
  });

  console.log("✔ Connected to MySQL server");

  // Create database if it doesn't exist yet and select it
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.query(`USE \`${dbName}\`;`);
  console.log(`✔ Using database "${dbName}"`);

  try {
    // Always create the migrations tracking table first (idempotent)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
        filename   VARCHAR(255)  NOT NULL UNIQUE,
        applied_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Get list of already-applied migrations
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT filename FROM migrations ORDER BY filename ASC"
    );
    const applied = new Set(rows.map((r) => r.filename as string));

    // Read migration files sorted by filename
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let ranCount = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  ⏭  Skipping (already applied): ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

      await connection.beginTransaction();

      try {
        await connection.query(sql);
        await connection.execute(
          "INSERT INTO migrations (filename) VALUES (?)",
          [file]
        );
        await connection.commit();
        console.log(`  ✔  Applied: ${file}`);
        ranCount++;
      } catch (err) {
        await connection.rollback();
        console.error(`  ✖  Failed: ${file}`);
        throw err;
      }
    }

    if (ranCount === 0) {
      console.log("  ✔  All migrations already applied. Nothing to run.");
    } else {
      console.log(`\n✔ Migration complete. ${ranCount} migration(s) applied.`);
    }
  } finally {
    await connection.end();
    console.log("✔ Connection closed.");
  }
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
