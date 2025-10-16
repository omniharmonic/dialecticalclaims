-- Database migration to support synthesis claims and archiving
-- Run this script to update your database schema

-- Add synthesis_claim column to syntheses table
ALTER TABLE syntheses
ADD COLUMN synthesis_claim TEXT NULL;

-- Add archived_at column to dialectics table
ALTER TABLE dialectics
ADD COLUMN archived_at TIMESTAMPTZ NULL;

-- Create index for archived dialectics for efficient querying
CREATE INDEX idx_dialectics_archived_at ON dialectics(archived_at) WHERE archived_at IS NOT NULL;

-- Create index for efficient synthesis claim searches
CREATE INDEX idx_syntheses_synthesis_claim ON syntheses USING gin(to_tsvector('english', synthesis_claim)) WHERE synthesis_claim IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN syntheses.synthesis_claim IS 'Single synthesis claim summarizing the core insight';
COMMENT ON COLUMN dialectics.archived_at IS 'Timestamp when dialectic was archived by user';