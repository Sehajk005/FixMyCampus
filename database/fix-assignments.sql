-- Fix My Campus — Fix ticket assignments
-- Run this after seed.sql to assign tickets to technicians
-- Usage: Get-Content "...\fix-assignments.sql" | mysql -u root -p fixmycampus_db

USE fixmycampus_db;

-- Assign tickets to technicians using their known seed IDs
UPDATE tickets SET assigned_to = 'u-tech-000001' WHERE id = 't-000003'; -- Water leakage → Rahul (plumbing)
UPDATE tickets SET assigned_to = 'u-tech-000002' WHERE id = 't-000002'; -- Broken light → Pooja (electrical)
UPDATE tickets SET assigned_to = 'u-tech-000001' WHERE id = 't-000001'; -- Wi-Fi → Rahul

-- Confirm
SELECT t.id, t.title, t.status, t.assigned_to, u.name AS assigned_name
FROM tickets t
LEFT JOIN users u ON u.id = t.assigned_to;