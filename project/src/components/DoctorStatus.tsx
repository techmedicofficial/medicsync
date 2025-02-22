import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Doctor } from '../types/database';
import { format } from 'date-fns';

export default function DoctorStatus() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('last_active', { ascending: false });

      if (error) {
        console.error('Error fetching doctors:', error);
        return;
      }

      setDoctors(data || []);
    };

    fetchDoctors();

    const subscription = supabase
      .channel('doctors_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, fetchDoctors)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {doctors.map((doctor) => (
          <li key={doctor.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Dr. {doctor.first_name} {doctor.last_name}
                </p>
                <p className="text-sm text-gray-500">{doctor.specialty}</p>
              </div>
              <div className="flex items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doctor.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {doctor.is_available ? 'Available' : 'Busy'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {doctor.current_patients}/{doctor.max_patients} patients
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Last active: {format(new Date(doctor.last_active), 'HH:mm')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}