-- Enable Realtime for notifications table (needed for live badge updates)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER TABLE notifications REPLICA IDENTITY FULL;
