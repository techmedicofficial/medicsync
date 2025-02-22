import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, content: string) {
  try {
    await resend.emails.send({
      from: 'noreply@medisync.com',
      to,
      subject,
      html: content,
    });
    return { error: null };
  } catch (error) {
    console.error('Email Error:', error);
    return { error };
  }
}

export async function notifyDoctor(doctorEmail: string, patientInfo: any) {
  const subject = `New Patient Assignment - Triage Score: ${patientInfo.triage_score}`;
  const content = `
    <h2>New Patient Assigned</h2>
    <p>Patient: ${patientInfo.first_name} ${patientInfo.last_name}</p>
    <p>Triage Score: ${patientInfo.triage_score}</p>
    <p>Symptoms: ${patientInfo.symptoms}</p>
    <p>Please check your dashboard for complete details.</p>
  `;
  return await sendEmail(doctorEmail, subject, content);
}