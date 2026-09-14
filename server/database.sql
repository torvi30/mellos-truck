-- =========================================================
-- Base de Datos: Mellos Truck (V3 - Final: Arquitectura & Medios)
-- =========================================================
CREATE DATABASE IF NOT EXISTS mellos_trucks;
USE mellos_trucks;

-- 1. Usuarios del Sistema (Admin, Taller, Ventas)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rol ENUM('admin', 'taller', 'ventas') NOT NULL DEFAULT 'taller',
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla heredada para compatibilidad
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clientes
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  city VARCHAR(100),
  company VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehículos (Tractomulas, Camiones, Volquetas)
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  plate VARCHAR(30) NOT NULL UNIQUE,
  brand VARCHAR(100) NOT NULL,
  line VARCHAR(100),
  model VARCHAR(50),
  vehicle_type VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 4. Cotizaciones
CREATE TABLE IF NOT EXISTS quotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL,
  plate VARCHAR(30),
  service VARCHAR(120) NOT NULL,
  details TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'nueva',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Inventario Inteligente (Container & Taller)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(180) NOT NULL,
  sku VARCHAR(60) NOT NULL UNIQUE,
  precio DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  min_stock_alert INT NOT NULL DEFAULT 5,
  categoria ENUM('Lujos', 'Iluminación', 'Estructura', 'Acero Inoxidable', 'Escapes y Cornetas', 'Accesorios') NOT NULL DEFAULT 'Lujos',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Órdenes de Trabajo (Trazabilidad Taller)
CREATE TABLE IF NOT EXISTS work_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente VARCHAR(150) NOT NULL,
  placa VARCHAR(30) NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('Ingreso', 'Taller', 'Pintura', 'Terminado', 'Entregado') NOT NULL DEFAULT 'Ingreso',
  slug VARCHAR(255) UNIQUE,
  magic_token VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Descuento Automático de Inventario por Orden
CREATE TABLE IF NOT EXISTS work_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12, 2) DEFAULT 0.00,
  FOREIGN KEY (order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 8. Showroom Cinematográfico y Multimedia (Fotos, Streaming de Videos, Antes/Después)
CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_order_id INT NULL,
  type ENUM('photo', 'video') NOT NULL DEFAULT 'photo',
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NULL,
  is_before_after TINYINT(1) NOT NULL DEFAULT 0,
  before_url VARCHAR(500) NULL,
  after_url VARCHAR(500) NULL,
  title VARCHAR(200) NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE SET NULL
);