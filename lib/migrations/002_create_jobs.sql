-- Migration 002: Create jobs table
-- Stores all job postings created by the admin.
-- Fields map 1:1 to the Admin PositionFormModal UI inputs.

CREATE TABLE IF NOT EXISTS jobs (
  id               INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,

  -- "Role Name" input in PositionFormModal
  title            VARCHAR(255)   NOT NULL,

  -- "Employment Type" dropdown: 'Full Time' | 'Part Time'
  employment_type  VARCHAR(100)   NOT NULL DEFAULT 'Full Time',

  -- "Experience" dropdown: '0–2 Years' | '1 - 2 years' | '2–4 Years' | '4+ Years'
  experience       VARCHAR(100)   NOT NULL DEFAULT '1 - 2 years',

  -- "Notice Period" dropdown: 'Immediate' | '15 Days' | '30 Days' | '60 Days' | '90 Days'
  notice_period    VARCHAR(50)    NOT NULL DEFAULT '30 Days',

  -- "Languages" multi-select + custom input — stored as JSON array
  -- e.g. ["English", "Japanese"]
  languages        JSON           NOT NULL,

  -- "Job Description" textarea
  description      TEXT           NOT NULL,

  -- "Key Responsibilities" repeater — stored as JSON array of strings
  -- e.g. ["Develop web apps.", "Collaborate with design team."]
  responsibilities JSON           NOT NULL,

  -- Position logo uploaded by admin via file input in PositionFormModal
  -- Stored as base64 data URI or a path string
  image_url        TEXT           NULL,

  -- Featured ribbon star shown on job card (default on)
  is_featured      TINYINT(1)     NOT NULL DEFAULT 1,

  -- Soft activate/deactivate — 1 = visible to customers, 0 = hidden
  -- Use this instead of deleting when a job has applications
  is_active        TINYINT(1)     NOT NULL DEFAULT 1,

  created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes for common query patterns
  INDEX idx_jobs_is_active    (is_active),
  INDEX idx_jobs_is_featured  (is_featured),
  INDEX idx_jobs_created_at   (created_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
