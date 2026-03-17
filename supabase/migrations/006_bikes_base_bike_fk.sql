-- Verknüpft Custom Builds mit ihrem Basisbike aus der base_bikes Tabelle
ALTER TABLE bikes
  ADD COLUMN base_bike_id uuid REFERENCES base_bikes(id) ON DELETE SET NULL;

CREATE INDEX bikes_base_bike_idx ON bikes (base_bike_id);
