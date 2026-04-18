-- Fix: analytics_events.workshop_id FK blocks workshop (and therefore profile/auth user) deletion.
-- Original FK in 20250416_analytics_events.sql had no ON DELETE action, so deleting a
-- custom-werkstatt profile failed with "Database error deleting user" whenever the
-- workshop had analytics rows (cascade chain auth.users → profiles → workshops → blocked).
-- Analytics events for a deleted workshop are meaningless → cascade delete.

ALTER TABLE analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_workshop_id_fkey;

ALTER TABLE analytics_events
  ADD CONSTRAINT analytics_events_workshop_id_fkey
    FOREIGN KEY (workshop_id)
    REFERENCES workshops(id)
    ON DELETE CASCADE;
