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

-- Voltas: 8 tempos por corredor (8 corredores × 8 corridas = 64 voltas)


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;