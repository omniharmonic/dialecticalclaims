-- Dialectical.Claims Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- FIGHTERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS fighters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  fighter_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  era VARCHAR(100) NOT NULL,
  tradition TEXT[] NOT NULL,
  style VARCHAR(100) NOT NULL,
  special_move VARCHAR(255) NOT NULL,
  attributes TEXT[] NOT NULL,
  system_prompt TEXT NOT NULL,
  bio TEXT,
  portrait_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fighters
CREATE INDEX IF NOT EXISTS idx_fighters_slug ON fighters(slug);
CREATE INDEX IF NOT EXISTS idx_fighters_era ON fighters(era);
CREATE INDEX IF NOT EXISTS idx_fighters_name_search ON fighters USING gin(name gin_trgm_ops);

-- =============================================
-- DIALECTICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dialectics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fighter1_id UUID NOT NULL REFERENCES fighters(id),
  fighter2_id UUID NOT NULL REFERENCES fighters(id),
  thesis TEXT NOT NULL,
  round_count INTEGER NOT NULL CHECK (round_count >= 2 AND round_count <= 8),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT different_fighters CHECK (fighter1_id != fighter2_id)
);

-- Indexes for dialectics
CREATE INDEX IF NOT EXISTS idx_dialectics_fighter1 ON dialectics(fighter1_id);
CREATE INDEX IF NOT EXISTS idx_dialectics_fighter2 ON dialectics(fighter2_id);
CREATE INDEX IF NOT EXISTS idx_dialectics_status ON dialectics(status);
CREATE INDEX IF NOT EXISTS idx_dialectics_created_at ON dialectics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dialectics_thesis_search ON dialectics USING gin(thesis gin_trgm_ops);

-- =============================================
-- ROUNDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dialectic_id UUID NOT NULL REFERENCES dialectics(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  fighter1_response TEXT NOT NULL,
  fighter2_response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dialectic_id, round_number)
);

-- Indexes for rounds
CREATE INDEX IF NOT EXISTS idx_rounds_dialectic ON rounds(dialectic_id, round_number);

-- =============================================
-- SYNTHESES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS syntheses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dialectic_id UUID NOT NULL REFERENCES dialectics(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  concept_tags TEXT[] NOT NULL,
  used_as_thesis_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for syntheses
CREATE INDEX IF NOT EXISTS idx_syntheses_dialectic ON syntheses(dialectic_id);
CREATE INDEX IF NOT EXISTS idx_syntheses_type ON syntheses(type);
CREATE INDEX IF NOT EXISTS idx_syntheses_used_count ON syntheses(used_as_thesis_count DESC);
CREATE INDEX IF NOT EXISTS idx_syntheses_tags ON syntheses USING gin(concept_tags);

-- =============================================
-- PROVOCATION DECK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS provocation_deck (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thesis TEXT NOT NULL UNIQUE,
  domain VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'intermediate',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for provocation deck
CREATE INDEX IF NOT EXISTS idx_provocation_domain ON provocation_deck(domain);
CREATE INDEX IF NOT EXISTS idx_provocation_usage ON provocation_deck(usage_count DESC);

-- =============================================
-- LINEAGE TABLE (Knowledge Graph Edges)
-- =============================================
CREATE TABLE IF NOT EXISTS dialectic_lineage (
  parent_synthesis_id UUID NOT NULL REFERENCES syntheses(id) ON DELETE CASCADE,
  child_dialectic_id UUID NOT NULL REFERENCES dialectics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (parent_synthesis_id, child_dialectic_id)
);

-- Indexes for lineage
CREATE INDEX IF NOT EXISTS idx_lineage_parent ON dialectic_lineage(parent_synthesis_id);
CREATE INDEX IF NOT EXISTS idx_lineage_child ON dialectic_lineage(child_dialectic_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_fighters_updated_at ON fighters;
CREATE TRIGGER update_fighters_updated_at 
  BEFORE UPDATE ON fighters
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Increment view count function
CREATE OR REPLACE FUNCTION increment_view_count(dialectic_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE dialectics 
  SET view_count = view_count + 1 
  WHERE id = dialectic_uuid;
END;
$$ LANGUAGE plpgsql;

-- Increment synthesis usage count
CREATE OR REPLACE FUNCTION increment_synthesis_usage(synthesis_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE syntheses 
  SET used_as_thesis_count = used_as_thesis_count + 1 
  WHERE id = synthesis_uuid;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE fighters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialectics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE syntheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE provocation_deck ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialectic_lineage ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read on fighters" ON fighters;
CREATE POLICY "Allow public read on fighters" ON fighters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on dialectics" ON dialectics;
CREATE POLICY "Allow public read on dialectics" ON dialectics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on rounds" ON rounds;
CREATE POLICY "Allow public read on rounds" ON rounds FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on syntheses" ON syntheses;
CREATE POLICY "Allow public read on syntheses" ON syntheses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on provocation_deck" ON provocation_deck;
CREATE POLICY "Allow public read on provocation_deck" ON provocation_deck FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on lineage" ON dialectic_lineage;
CREATE POLICY "Allow public read on lineage" ON dialectic_lineage FOR SELECT USING (true);

-- Service role can write (backend API only)
DROP POLICY IF EXISTS "Service role write on dialectics" ON dialectics;
CREATE POLICY "Service role write on dialectics" ON dialectics 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role update on dialectics" ON dialectics;
CREATE POLICY "Service role update on dialectics" ON dialectics 
  FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Service role write on rounds" ON rounds;
CREATE POLICY "Service role write on rounds" ON rounds 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write on syntheses" ON syntheses;
CREATE POLICY "Service role write on syntheses" ON syntheses 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write on lineage" ON dialectic_lineage;
CREATE POLICY "Service role write on lineage" ON dialectic_lineage 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write on fighters" ON fighters;
CREATE POLICY "Service role write on fighters" ON fighters 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write on provocation_deck" ON provocation_deck;
CREATE POLICY "Service role write on provocation_deck" ON provocation_deck 
  FOR INSERT 
  WITH CHECK (true);

-- =============================================
-- COMPLETE!
-- =============================================

-- You can now run: pnpm db:seed
-- to populate the database with sample fighters and provocations

