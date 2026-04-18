-- Full-text search indexes for unified /search page
-- Uses 'german' text search config for proper stemming

-- Bikes: search on title, make, model
CREATE INDEX IF NOT EXISTS bikes_search_idx
  ON bikes
  USING GIN (to_tsvector('german', coalesce(title, '') || ' ' || coalesce(make, '') || ' ' || coalesce(model, '')));

-- Workshops: search on name, city, description
CREATE INDEX IF NOT EXISTS workshops_search_idx
  ON workshops
  USING GIN (to_tsvector('german', coalesce(name, '') || ' ' || coalesce(city, '') || ' ' || coalesce(description, '')));

-- Profiles (Rider): search on username, full_name
CREATE INDEX IF NOT EXISTS profiles_search_idx
  ON profiles
  USING GIN (to_tsvector('german', coalesce(username, '') || ' ' || coalesce(full_name, '')));
