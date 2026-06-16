-- SQL DDL for corrida_db
-- Run with: mysql -u <user> -p -P <port> < sql/DDL.sql
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP DATABASE IF EXISTS corrida_db;
CREATE DATABASE IF NOT EXISTS corrida_db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
USE corrida_db;

-- Table: usuarios
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  ultimo_login DATETIME NULL,
  total_logins INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: corredores
DROP TABLE IF EXISTS corredores;
CREATE TABLE corredores (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  turma VARCHAR(255) DEFAULT NULL,
  usuario_id INT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY fk_corredores_usuario (usuario_id),
  CONSTRAINT fk_corredores_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: voltas
-- corrida_num: número da corrida (1 a 8)
DROP TABLE IF EXISTS voltas;
CREATE TABLE voltas (
  id INT NOT NULL AUTO_INCREMENT,
  tempo DECIMAL(8,2) NOT NULL,
  data DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  corredores_id INT NOT NULL,
  corrida_num INT NOT NULL DEFAULT 1 COMMENT 'Número da corrida (1 a 8)',
  PRIMARY KEY (id),
  KEY fk_voltas_corredor (corredores_id),
  CONSTRAINT fk_voltas_corredor FOREIGN KEY (corredores_id) REFERENCES corredores(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data
INSERT INTO usuarios (nome, email, senha, role) VALUES
  ('Admin', 'admin@windspeed.com', 'admin123', 'admin'),
  ('User Tester', 'user@example.com', '', 'user');

INSERT INTO corredores (nome, turma, usuario_id) VALUES
('Windspeed', 'Islã', NULL),
('Kerberus', 'Grécia', NULL),
('Lightning McQueen', 'França', NULL),
('Septem Racing', 'Grécia', NULL),
('Apex Storm', 'Estados Unidos', NULL),
('Cowabunga', 'Itália', NULL),
('Sakura Racing', 'Japão', NULL),
('Racing Angels', 'Brasil', NULL);

-- Voltas de exemplo distribuídas em 3 corridas
-- Voltas: 8 tempos por corredor (8 corredores × 8 corridas = 64 voltas)
/*INSERT INTO voltas (tempo, data, corredores_id, corrida_num) VALUES
-- Piloto A (id=1)
(100.35, '2026-06-15 12:00:00', 1, 1),
(71.50, '2026-06-15 12:05:00', 1, 2),
(74.22, '2026-06-15 12:10:00', 1, 3),
(70.80, '2026-06-15 12:15:00', 1, 4),
(73.10, '2026-06-15 12:20:00', 1, 5),
(69.95, '2026-06-15 12:25:00', 1, 6),
(71.40, '2026-06-15 12:30:00', 1, 7),
(68.50, '2026-06-15 12:35:00', 1, 8),
-- Piloto B (id=2)
(74.10, '2026-06-15 12:00:00', 2, 1),
(73.55, '2026-06-15 12:05:00', 2, 2),
(75.30, '2026-06-15 12:10:00', 2, 3),
(72.40, '2026-06-15 12:15:00', 2, 4),
(74.85, '2026-06-15 12:20:00', 2, 5),
(71.20, '2026-06-15 12:25:00', 2, 6),
(73.60, '2026-06-15 12:30:00', 2, 7),
(70.95, '2026-06-15 12:35:00', 2, 8),
-- Piloto C (id=3)
(76.20, '2026-06-15 12:00:00', 3, 1),
(75.45, '2026-06-15 12:05:00', 3, 2),
(77.10, '2026-06-15 12:10:00', 3, 3),
(74.30, '2026-06-15 12:15:00', 3, 4),
(76.55, '2026-06-15 12:20:00', 3, 5),
(73.80, '2026-06-15 12:25:00', 3, 6),
(75.25, '2026-06-15 12:30:00', 3, 7),
(72.60, '2026-06-15 12:35:00', 3, 8),
-- Piloto D (id=4)
(78.50, '2026-06-15 12:00:00', 4, 1),
(77.30, '2026-06-15 12:05:00', 4, 2),
(79.15, '2026-06-15 12:10:00', 4, 3),
(76.80, '2026-06-15 12:15:00', 4, 4),
(78.40, '2026-06-15 12:20:00', 4, 5),
(75.95, '2026-06-15 12:25:00', 4, 6),
(77.70, '2026-06-15 12:30:00', 4, 7),
(74.85, '2026-06-15 12:35:00', 4, 8),
-- Piloto E (id=5)
(80.10, '2026-06-15 12:00:00', 5, 1),
(79.45, '2026-06-15 12:05:00', 5, 2),
(81.20, '2026-06-15 12:10:00', 5, 3),
(78.60, '2026-06-15 12:15:00', 5, 4),
(80.35, '2026-06-15 12:20:00', 5, 5),
(77.90, '2026-06-15 12:25:00', 5, 6),
(79.75, '2026-06-15 12:30:00', 5, 7),
(76.50, '2026-06-15 12:35:00', 5, 8),
-- Piloto F (id=6)
(82.30, '2026-06-15 12:00:00', 6, 1),
(81.55, '2026-06-15 12:05:00', 6, 2),
(83.10, '2026-06-15 12:10:00', 6, 3),
(80.70, '2026-06-15 12:15:00', 6, 4),
(82.45, '2026-06-15 12:20:00', 6, 5),
(79.85, '2026-06-15 12:25:00', 6, 6),
(81.60, '2026-06-15 12:30:00', 6, 7),
(78.90, '2026-06-15 12:35:00', 6, 8),
-- Piloto G (id=7)
(84.20, '2026-06-15 12:00:00', 7, 1),
(83.40, '2026-06-15 12:05:00', 7, 2),
(85.05, '2026-06-15 12:10:00', 7, 3),
(82.60, '2026-06-15 12:15:00', 7, 4),
(84.35, '2026-06-15 12:20:00', 7, 5),
(81.75, '2026-06-15 12:25:00', 7, 6),
(83.50, '2026-06-15 12:30:00', 7, 7),
(80.95, '2026-06-15 12:35:00', 7, 8),
-- Piloto H (id=8)
(86.10, '2026-06-15 12:00:00', 8, 1),
(85.30, '2026-06-15 12:05:00', 8, 2),
(87.00, '2026-06-15 12:10:00', 8, 3),
(84.50, '2026-06-15 12:15:00', 8, 4),
(86.25, '2026-06-15 12:20:00', 8, 5),
(83.70, '2026-06-15 12:25:00', 8, 6),
(85.45, '2026-06-15 12:30:00', 8, 7),
(82.80, '2026-06-15 12:35:00', 8, 8);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;