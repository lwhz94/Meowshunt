-- Migration: 007_seed_ranks.sql

-- Upsert desired rank thresholds
INSERT INTO ranks (name, exp_required)
VALUES 
  ('Novice', 0),
  ('Apprentice', 200),
  ('Hunter', 600),
  ('Veteran', 1500),
  ('Master', 4000)
ON CONFLICT (name) DO UPDATE SET exp_required = EXCLUDED.exp_required;


