-- ============================================================
-- MotoDigital — Update user roles
-- rider | builder (inkl. workshop) | superadmin
-- ============================================================

-- Add superadmin to existing enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';

-- Migrate all existing 'workshop' users → 'builder'
UPDATE profiles SET role = 'builder' WHERE role = 'workshop';
