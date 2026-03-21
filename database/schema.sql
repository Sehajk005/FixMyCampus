-- Fix My Campus — Full Database Schema
-- MySQL 8.0 | utf8mb4 | InnoDB
-- Run: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS fixmycampus_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fixmycampus_db;

-- ─── 1. users ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  password_hash TEXT        NOT NULL,
  role         ENUM('student','technician','admin') NOT NULL DEFAULT 'student',
  is_verified  TINYINT(1)   NOT NULL DEFAULT 0,
  department   VARCHAR(100),
  phone        VARCHAR(20),
  avatar_url   TEXT,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_email (email),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. otp_tokens ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_tokens (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  email      VARCHAR(150) NOT NULL,
  otp        VARCHAR(6)   NOT NULL,
  expires_at DATETIME     NOT NULL,
  used       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_otp_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 3. refresh_tokens ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36) NOT NULL,
  token      TEXT     NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY fk_rt_user (user_id),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. staff_skills ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_skills (
  id           CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id      CHAR(36) NOT NULL,
  skill        VARCHAR(100) NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_ss_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 5. tickets ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  title        VARCHAR(200) NOT NULL,
  description  TEXT         NOT NULL,
  category     ENUM('electrical','wifi','plumbing','cleanliness','furniture','ac_hvac','security','other') NOT NULL,
  location     VARCHAR(200) NOT NULL,
  status       ENUM('submitted','verified','assigned','in_progress','resolved','closed') NOT NULL DEFAULT 'submitted',
  priority     ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  submitter_id CHAR(36)     NOT NULL,
  assigned_to  CHAR(36)     DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_status (status),
  KEY idx_category (category),
  KEY idx_assigned_to (assigned_to),
  CONSTRAINT fk_ticket_submitter FOREIGN KEY (submitter_id) REFERENCES users (id),
  CONSTRAINT fk_ticket_assignee  FOREIGN KEY (assigned_to)  REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 6. ticket_updates ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_updates (
  id           CHAR(36) NOT NULL DEFAULT (UUID()),
  ticket_id    CHAR(36) NOT NULL,
  updated_by   CHAR(36) NOT NULL,
  old_status   ENUM('submitted','verified','assigned','in_progress','resolved','closed'),
  new_status   ENUM('submitted','verified','assigned','in_progress','resolved','closed'),
  note         TEXT,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_tu_ticket FOREIGN KEY (ticket_id)  REFERENCES tickets (id) ON DELETE CASCADE,
  CONSTRAINT fk_tu_user   FOREIGN KEY (updated_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 7. messages ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         CHAR(36) NOT NULL DEFAULT (UUID()),
  ticket_id  CHAR(36) NOT NULL,
  sender_id  CHAR(36) NOT NULL,
  content    TEXT     NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_msg_ticket (ticket_id),
  CONSTRAINT fk_msg_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 8. notifications ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)     NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 9. feedback ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id         CHAR(36) NOT NULL DEFAULT (UUID()),
  ticket_id  CHAR(36) NOT NULL,
  user_id    CHAR(36) NOT NULL,
  rating     TINYINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback (ticket_id, user_id),
  CONSTRAINT fk_fb_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
  CONSTRAINT fk_fb_user   FOREIGN KEY (user_id)   REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 10. job_queue ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_queue (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  job_type     VARCHAR(100) NOT NULL,
  payload      JSON         NOT NULL,
  status       ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
  attempts     INT          NOT NULL DEFAULT 0,
  max_attempts INT          NOT NULL DEFAULT 3,
  run_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_queue (status, run_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 11. audit_logs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36),
  action     VARCHAR(100) NOT NULL,
  entity     VARCHAR(100),
  entity_id  CHAR(36),
  meta       JSON,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Schema created successfully — all 10 tables ready.' AS status;
