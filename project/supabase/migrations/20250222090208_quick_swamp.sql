/*
  # Initial MEDI-Sync Schema

  1. New Tables
    - `patients`
      - Basic patient information
      - Triage data
      - Assignment details
    - `doctors`
      - Doctor profiles
      - Availability status
      - Specialties
    - `beds`
      - Bed tracking
      - Occupancy status
    - `emergency_alerts`
      - Critical patient alerts
      - Response tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  contact_number text,
  email text,
  symptoms text NOT NULL,
  vitals jsonb,
  triage_score integer,
  assigned_doctor_id uuid REFERENCES auth.users(id),
  assigned_bed_id uuid,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_treatment', 'discharged')),
  discharge_date timestamptz,
  last_updated timestamptz DEFAULT now()
);

-- Doctors Table (extends auth.users)
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  specialty text NOT NULL,
  is_available boolean DEFAULT true,
  current_patients integer DEFAULT 0,
  max_patients integer DEFAULT 10,
  last_active timestamptz DEFAULT now()
);

-- Beds Table
CREATE TABLE IF NOT EXISTS beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_number text NOT NULL UNIQUE,
  ward text NOT NULL,
  is_occupied boolean DEFAULT false,
  current_patient_id uuid REFERENCES patients(id),
  last_sanitized timestamptz DEFAULT now()
);

-- Emergency Alerts Table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  patient_id uuid REFERENCES patients(id) NOT NULL,
  severity integer NOT NULL CHECK (severity >= 1 AND severity <= 10),
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
  acknowledged_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  escalated boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated read access to patients"
  ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access to doctors"
  ON doctors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access to beds"
  ON beds FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access to emergency alerts"
  ON emergency_alerts FOR SELECT TO authenticated USING (true);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_triage_score ON patients(triage_score);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_availability ON doctors(is_available);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);

-- Functions
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_patients_last_updated
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated();