-- Migration: 002_collections.sql

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meow_id UUID NOT NULL REFERENCES meows(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, meow_id)
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- RLS: users can manage only their own collections
CREATE POLICY "Users can view own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_meow ON collections(meow_id);


