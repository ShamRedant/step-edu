-- Migration: Add PPT file path and quiz link to lessons table
-- Run this migration to add support for PPT uploads and quiz links at lesson level

-- Add ppt_file_path column to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS ppt_file_path TEXT;

-- Add quiz_link column to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS quiz_link TEXT;

