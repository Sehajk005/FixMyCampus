-- Fix My Campus — Seed Data
-- Run after schema.sql: mysql -u root -p fixmycampus_db < seed.sql
-- Passwords are all: Test@1234 (bcrypt hashed)

USE fixmycampus_db;

-- ─── Users (1 admin, 2 technicians, 3 students) ─────────────────────────────
-- NOTE: Passwords are intentionally stored as plaintext 'Test@1234' here.
-- The fix-passwords.js script MUST be run after this seed to hash them properly.
-- Run: node backend/scripts/fix-passwords.js
INSERT INTO users (id, name, email, password_hash, role, is_verified, department) VALUES
  ('u-admin-00001', 'Admin User',   'admin@chitkara.edu',   'Test@1234', 'admin',      1, 'Administration'),
  ('u-tech-000001', 'Rahul Verma',  'rahul.v@chitkara.edu', 'Test@1234', 'technician', 1, 'Facilities'),
  ('u-tech-000002', 'Pooja Sharma', 'pooja.s@chitkara.edu', 'Test@1234', 'technician', 1, 'Electrical'),
  ('u-stu-0000001', 'Arjun Mehta',  'arjun.m@chitkara.edu', 'Test@1234', 'student',    1, 'Computer Science'),
  ('u-stu-0000002', 'Priya Nair',   'priya.n@chitkara.edu', 'Test@1234', 'student',    1, 'Electronics'),
  ('u-stu-0000003', 'Karan Singh',  'karan.s@chitkara.edu', 'Test@1234', 'student',    1, 'Mechanical')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ─── Staff Skills ────────────────────────────────────────────────────────────
INSERT INTO staff_skills (id, user_id, skill) VALUES
  (UUID(), 'u-tech-000001', 'Plumbing'),
  (UUID(), 'u-tech-000001', 'HVAC'),
  (UUID(), 'u-tech-000002', 'Electrical'),
  (UUID(), 'u-tech-000002', 'Wi-Fi Networking')
ON DUPLICATE KEY UPDATE skill = VALUES(skill);

-- ─── Test Tickets ────────────────────────────────────────────────────────────
INSERT INTO tickets (id, title, description, category, location, status, priority, submitter_id) VALUES
  ('t-000001', 'Wi-Fi not working in Lab 3',   'Cannot connect to campus Wi-Fi in Computer Lab 3 since morning.', 'wifi',        'Block A - Lab 3',    'submitted',   'high',     'u-stu-0000001'),
  ('t-000002', 'Broken light in corridor',      'Two tube lights are fused on the 2nd floor corridor near Room 204.', 'electrical', 'Block B - 2nd Floor','in_progress', 'medium',   'u-stu-0000002'),
  ('t-000003', 'Water leakage in washroom',     'Pipe is leaking near the sink in Boys washroom, Block C.',  'plumbing',    'Block C - Ground',   'assigned',    'critical',  'u-stu-0000003'),
  ('t-000004', 'AC not cooling in seminar hall','Air conditioner in Seminar Hall 1 is not cooling effectively.','ac_hvac',   'Seminar Hall 1',     'verified',    'medium',   'u-stu-0000001'),
  ('t-000005', 'Garbage bins overflowing',      'Bins near the canteen have not been emptied for 2 days.',   'cleanliness', 'Canteen Area',       'resolved',    'low',      'u-stu-0000002')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ─── Sample Messages ─────────────────────────────────────────────────────────
INSERT INTO messages (id, ticket_id, sender_id, content) VALUES
  (UUID(), 't-000001', 'u-stu-0000001', 'Still unable to connect even after restarting my laptop.'),
  (UUID(), 't-000001', 'u-tech-000001', 'We are aware of the issue. The router in Lab 3 is being replaced today.'),
  (UUID(), 't-000002', 'u-tech-000002', 'Lights have been replaced. Please confirm if the issue is resolved.');

SELECT 'Seed data inserted successfully.' AS status;
SELECT 'Login with any user using password: Test@1234' AS note;
