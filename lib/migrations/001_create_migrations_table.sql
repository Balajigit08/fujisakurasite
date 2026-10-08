-- Migration 001: Create the migrations tracking table
-- This table records which migration files have been applied.
-- The runner checks this table before executing any migration.

CREATE TABLE IF NOT EXISTS migrations (
  id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  filename   VARCHAR(255)  NOT NULL UNIQUE,
  applied_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
