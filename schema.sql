-- ==========================================
-- GREENMAP PHARMA DATABASE SCHEMA (PostgreSQL / Supabase)
-- ==========================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE PROFILES / UTILISATEURS
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'pharmacist', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE PHARMACIES
CREATE TABLE IF NOT EXISTS pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL, -- Lomé, Cotonou, Kara, Parakou, etc.
    country VARCHAR(10) DEFAULT 'TG', -- TG ou BJ
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    license_number VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLE PRODUITS (Catalogue Global)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cip_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100), -- Analgésique, Antibiotique, Vitamine, etc.
    dosage VARCHAR(100),
    form VARCHAR(100), -- Comprimé, Sirop, Injectable, etc.
    requires_prescription BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLE STOCKS (Par Pharmacie)
CREATE TABLE IF NOT EXISTS stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    unit_price NUMERIC(10, 2) NOT NULL, -- Prix en FCFA (XOF)
    expiry_date DATE,
    batch_number VARCHAR(100),
    alert_threshold INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pharmacy_id, product_id)
);

-- 5. TABLE VENTES (Caisse POS)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    pharmacist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mobile_money', 'card')),
    payment_reference VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    customer_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLE VENTE ITEMS
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 7. TABLE PHARMACIES DE GARDE
CREATE TABLE IF NOT EXISTS guard_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    city VARCHAR(100) NOT NULL,
    zone VARCHAR(100), -- Quartier ou Zone de garde
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES POUR PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_pharmacies_city ON pharmacies(city);
CREATE INDEX IF NOT EXISTS idx_stocks_pharmacy ON stocks(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_guard_dates ON guard_schedules(start_date, end_date);
