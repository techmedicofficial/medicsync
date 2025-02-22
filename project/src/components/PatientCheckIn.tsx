import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTriageScore } from '../lib/ai';
import { assignDoctor } from '../lib/doctor-assignment';
import { notifyDoctor } from '../lib/notifications';

interface PatientForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_number: string;
  email: string;
  symptoms: string;
  vitals: {
    temperature?: number;
    blood_pressure?: string;
    heart_rate?: number;
    oxygen_saturation?: number;
  };
}

const initialForm: PatientForm = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  contact_number: '',
  email: '',
  symptoms: '',
  vitals: {},
};

export default function PatientCheckIn() {
  const [form, setForm] = useState<PatientForm>(initialForm);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert patient data
      const { data, error } = await supabase.from('patients').insert([
        {
          ...form,
          status: 'waiting',
        },
      ]).select().single();

      if (error) throw error;

      // Get AI-based triage score
      const triageScore = await getTriageScore(form.symptoms, form.vitals);

      // Update patient with triage score
      await supabase
        .from('patients')
        .update({ triage_score: triageScore })
        .eq('id', data.id);

      // For high triage scores, create emergency alert
      if (triageScore >= 8) {
        await supabase.from('emergency_alerts').insert([
          {
            patient_id: data.id,
            severity: triageScore,
            description: `High risk patient: ${form.symptoms}`,
            status: 'pending',
          },
        ]);
      }

      // Assign doctor based on triage score
      const { doctor, error: assignError } = await assignDoctor(data.id, triageScore);
      
      if (doctor) {
        await notifyDoctor(doctor.email, {
          ...data,
          triage_score: triageScore,
        });
      }

      toast.success('Patient check-in successful');
      setForm(initialForm);
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Failed to complete check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            id="date_of_birth"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <input
            type="tel"
            id="contact_number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
            Symptoms
          </label>
          <textarea
            id="symptoms"
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Vitals</h3>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                Temperature (°C)
              </label>
              <input
                type="number"
                id="temperature"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={form.vitals.temperature || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vitals: { ...form.vitals, temperature: parseFloat(e.target.value) || undefined },
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="blood_pressure" className="block text-sm font-medium text-gray-700">
                Blood Pressure
              </label>
              <input
                type="text"
                id="blood_pressure"
                placeholder="120/80"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={form.vitals.blood_pressure || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vitals: { ...form.vitals, blood_pressure: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="heart_rate" className="block text-sm font-medium text-gray-700">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                id="heart_rate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={form.vitals.heart_rate || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vitals: { ...form.vitals, heart_rate: parseInt(e.target.value) || undefined },
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="oxygen_saturation" className="block text-sm font-medium text-gray-700">
                Oxygen Saturation (%)
              </label>
              <input
                type="number"
                id="oxygen_saturation"
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={form.vitals.oxygen_saturation || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vitals: {
                      ...form.vitals,
                      oxygen_saturation: parseInt(e.target.value) || undefined,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center text-blue-600">
          <AlertCircle className="animate-spin h-5 w-5 mr-2" />
          Processing...
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Complete Check-in
        </button>
      </div>
    </form>
  );
}