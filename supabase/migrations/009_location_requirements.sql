-- Add requirements field to locations table
ALTER TABLE locations ADD COLUMN requirements JSONB DEFAULT '{}';

-- Add index for requirements queries
CREATE INDEX idx_locations_requirements ON locations USING GIN (requirements);

-- Example requirements structure:
-- {
--   "items": ["uuid1", "uuid2"],  -- Required item IDs
--   "rank": "Apprentice",          -- Required rank name
--   "min_level": 5                 -- Minimum level requirement
-- }

-- Update existing locations with default empty requirements
UPDATE locations SET requirements = '{}' WHERE requirements IS NULL;
