-- Insert a complete test dialectic
INSERT INTO dialectics (
  id, 
  fighter1_id, 
  fighter2_id, 
  thesis, 
  status, 
  round_count, 
  completed_at,
  created_at,
  view_count
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '4724ac92-218f-4fd3-a3d9-a5e8a20bd976',
  'b12cc821-a724-48bd-9d41-352eba0f4931',
  'Technology inherently improves human flourishing',
  'complete',
  3,
  NOW(),
  NOW(),
  0
);

-- Insert some test syntheses
INSERT INTO syntheses (
  id,
  dialectic_id,
  type,
  title,
  content,
  synthesis_claim,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'final',
  'Technology and Human Flourishing Synthesis',
  'A comprehensive synthesis of the dialectical exchange on technology and human flourishing...',
  'Technology''s impact on human flourishing depends on conscious design choices that prioritize human agency over efficiency.',
  NOW()
);
