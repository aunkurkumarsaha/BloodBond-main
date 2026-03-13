-- BloodBond: Supabase Database Setup
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  last_donation TIMESTAMPTZ,
  eligible_to_donate BOOLEAN DEFAULT true,
  donation_history JSONB DEFAULT '[]'::jsonb,
  health_info JSONB DEFAULT '{}'::jsonb,
  notifications JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{"donationReminders": true, "emergencyAlerts": true, "radius": 10}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. HOSPITALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  inventory JSONB DEFAULT '{"aPositive": 0, "aNegative": 0, "bPositive": 0, "bNegative": 0, "abPositive": 0, "abNegative": 0, "oPositive": 0, "oNegative": 0}'::jsonb,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
  operating_hours_open TEXT DEFAULT '09:00',
  operating_hours_close TEXT DEFAULT '18:00',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. BLOOD REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blood_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_required INTEGER NOT NULL CHECK (units_required >= 1),
  priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'URGENT', 'EMERGENCY')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED')),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_date TIMESTAMPTZ DEFAULT now(),
  response_date TIMESTAMPTZ,
  notes TEXT,
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. EMERGENCY REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emergency_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units INTEGER NOT NULL CHECK (units >= 1),
  hospital TEXT,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FULFILLED', 'EXPIRED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_hospitals_email ON hospitals(email);
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital ON blood_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_user ON blood_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_reviews_hospital ON reviews(hospital_id);

-- ============================================
-- DISABLE Row Level Security (for dev)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service key (backend)
CREATE POLICY "Allow all for service role" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON hospitals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON blood_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON emergency_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON reviews FOR ALL USING (true) WITH CHECK (true);
