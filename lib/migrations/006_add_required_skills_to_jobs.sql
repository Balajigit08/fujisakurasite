-- Migration 006: Add required_skills column to jobs table
-- Adds the missing required_skills column as JSON.

ALTER TABLE jobs ADD COLUMN required_skills JSON NULL AFTER responsibilities;
