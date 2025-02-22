export interface Patient {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_number?: string;
  email?: string;
  symptoms: string;
  vitals?: {
    temperature?: number;
    blood_pressure?: string;
    heart_rate?: number;
    oxygen_saturation?: number;
  };
  triage_score?: number;
  assigned_doctor_id?: string;
  assigned_bed_id?: string;
  status: 'waiting' | 'in_treatment' | 'discharged';
  discharge_date?: string;
  last_updated: string;
}

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  is_available: boolean;
  current_patients: number;
  max_patients: number;
  last_active: string;
}

export interface Bed {
  id: string;
  bed_number: string;
  ward: string;
  is_occupied: boolean;
  current_patient_id?: string;
  last_sanitized: string;
}

export interface EmergencyAlert {
  id: string;
  created_at: string;
  patient_id: string;
  severity: number;
  description: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  resolved_at?: string;
  escalated: boolean;
}

export interface BillingItem {
  description: string;
  amount: number;
  quantity: number;
  total: number;
}

export interface Billing {
  id: string;
  patient_id: string;
  created_at: string;
  discharge_date?: string;
  items: BillingItem[];
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  payment_date?: string;
  invoice_number: string;
}