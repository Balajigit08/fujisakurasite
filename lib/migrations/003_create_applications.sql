-- Migration 003: Create applications table
-- Stores candidate applications submitted through the public careers form.
-- Fields map 1:1 to the customer application form in career/[id]/page.jsx.

CREATE TABLE IF NOT EXISTS applications (
  id               INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,

  -- FK to jobs.id — which job this application is for
  job_id           INT UNSIGNED   NOT NULL,

  -- "Your Name" text input
  full_name        VARCHAR(255)   NOT NULL,

  -- "E-mail address" email input
  email            VARCHAR(255)   NOT NULL,

  -- "Phone Number" tel input
  phone            VARCHAR(50)    NOT NULL,

  -- "Date of birth" date input
  date_of_birth    DATE           NOT NULL,

  -- "Qualification" text input
  qualification    VARCHAR(255)   NOT NULL,

  -- "JPBilingual" checkbox — 0 = not bilingual, 1 = bilingual
  is_jp_bilingual  TINYINT(1)     NOT NULL DEFAULT 0,

  -- "Level" select (N1–N5) — only populated when is_jp_bilingual = 1
  -- NULL when is_jp_bilingual = 0 (enforced server-side in API)
  jp_level         VARCHAR(10)    NULL,

  -- Relative path to uploaded resume/PDF file
  -- e.g. resumes/2026/08/550e8400-e29b-41d4-a716-446655440000.pdf
  -- Full path = UPLOAD_DIR + '/' + resume_path (resolved server-side only)
  -- Never stored as absolute path or binary data
  resume_path      VARCHAR(500)   NOT NULL,

  -- Application status managed by admin
  -- Starts as 'new', admin updates to reviewed / shortlisted / rejected
  status           ENUM(
                     'new',
                     'reviewed',
                     'shortlisted',
                     'rejected'
                   )              NOT NULL DEFAULT 'new',

  created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,

  -- FK constraint — cannot delete a job that has applications
  CONSTRAINT fk_applications_job
    FOREIGN KEY (job_id)
    REFERENCES jobs(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  -- Indexes for common query patterns
  INDEX idx_applications_job_id    (job_id),
  INDEX idx_applications_status    (status),
  INDEX idx_applications_email     (email),
  INDEX idx_applications_created_at (created_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
