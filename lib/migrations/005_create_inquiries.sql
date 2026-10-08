-- Migration 005: Create inquiries table
-- Stores contact form submissions from the public contact page.

CREATE TABLE IF NOT EXISTS inquiries (
  id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  full_name  VARCHAR(255)  NOT NULL,
  email      VARCHAR(255)  NOT NULL,
  phone      VARCHAR(50)   NULL,
  subject    VARCHAR(255)  NULL,
  message    TEXT          NOT NULL,
  status     ENUM('new', 'in_progress', 'resolved', 'archived') NOT NULL DEFAULT 'new',
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_inquiries_status     (status),
  INDEX idx_inquiries_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
