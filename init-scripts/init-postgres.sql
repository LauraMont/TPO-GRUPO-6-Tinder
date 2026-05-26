-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Limpiar la tabla por si el script se ejecuta más de una vez (evita duplicados)
TRUNCATE TABLE users CASCADE;

INSERT INTO users (id, name, email, password_hash) VALUES 
('a1b2c3d4-0000-0000-0000-000000000001', 'Miguel Zambrano', 'miguel@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000002', 'Federico Egea', 'federico@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000003', 'Santiago Paglino', 'santiago@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000004', 'Andres Mazzucco', 'andres@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000005', 'Laura Montaño', 'laura@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000006', 'Valentina Rossi', 'valentina@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000007', 'Camila Gomez', 'camila@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000008', 'Lucia Fernandez', 'lucia@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000009', 'Florencia Silva', 'florencia@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000010', 'Micaela Torres', 'micaela@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000011', 'Carlos Perez', 'carlos@example.com', 'hash_123'),
('a1b2c3d4-0000-0000-0000-000000000012', 'Sofia Gonzalez', 'sofia@example.com', 'hash_123');