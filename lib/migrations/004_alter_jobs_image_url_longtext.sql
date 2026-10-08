-- Migration 004: Change image_url from TEXT to LONGTEXT
-- Base64-encoded images exceed TEXT limit (64KB).
-- LONGTEXT supports up to 4GB which is sufficient for any image.

ALTER TABLE jobs MODIFY COLUMN image_url LONGTEXT NULL;
