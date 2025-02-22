/*
  # Add Billing System

  1. New Tables
    - `billing`
      - Tracks patient bills
      - Links to patient records
      - Stores payment status
      - Includes itemized charges

  2. Security
    - Enable RLS on billing table
    - Add policies for authenticated access
*/

CREATE TABLE IF NOT EXISTS billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  discharge_date timestamptz,
  items jsonb NOT NULL DEFAULT '[]',
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_date timestamptz,
  invoice_number text UNIQUE NOT NULL DEFAULT 'INV-' || gen_random_uuid()
);

ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access to billing"
  ON billing FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_billing_patient_id ON billing(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(status);