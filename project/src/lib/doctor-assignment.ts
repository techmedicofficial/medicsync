import { supabase } from './supabase';
import { notifyDoctor } from './notifications';

export async function findAvailableDoctor(triageScore: number) {
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_available', true)
    .lt('current_patients', 'max_patients')
    .order('current_patients');

  if (error || !doctors?.length) return null;

  // Prioritize doctors with fewer current patients
  return doctors[0];
}

export async function assignDoctor(patientId: string, triageScore: number) {
  try {
    const doctor = await findAvailableDoctor(triageScore);
    if (!doctor) return { error: 'No available doctors' };

    // Update patient record with assigned doctor
    const { error: updateError } = await supabase
      .from('patients')
      .update({ assigned_doctor_id: doctor.id })
      .eq('id', patientId);

    if (updateError) throw updateError;

    // Update doctor's current patient count
    const { error: doctorError } = await supabase
      .from('doctors')
      .update({ current_patients: doctor.current_patients + 1 })
      .eq('id', doctor.id);

    if (doctorError) throw doctorError;

    // Get patient info for notification
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patient) {
      await notifyDoctor(doctor.email, patient);
    }

    return { doctor, error: null };
  } catch (error) {
    console.error('Doctor Assignment Error:', error);
    return { doctor: null, error };
  }
}