-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('person', 'entity')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    specialized_in VARCHAR(255),
    experience VARCHAR(50),
    address TEXT,
    offline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_type ON members(type);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_created_at ON members(created_at DESC);

