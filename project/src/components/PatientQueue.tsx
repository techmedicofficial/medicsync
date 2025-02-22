import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Patient } from '../types/database';
import { format } from 'date-fns';

export default function PatientQueue() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('triage_score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching patients:', error);
        return;
      }

      setPatients(data || []);
    };

    fetchPatients();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('patients_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, fetchPatients)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getTriageColor = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 8) return 'bg-red-100 text-red-800';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {patients.map((patient) => (
          <li key={patient.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {patient.first_name} {patient.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(patient.created_at), 'HH:mm')} - {patient.symptoms.slice(0, 50)}...
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTriageColor(
                  patient.triage_score
                )}`}
              >
                Score: {patient.triage_score || 'N/A'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}