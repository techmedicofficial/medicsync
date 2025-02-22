import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getTriageScore(symptoms: string, vitals: any): Promise<number> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a medical triage expert. Analyze the patient's symptoms and vitals to assign a triage score from 1-10, where 10 is most severe. Return only the number."
        },
        {
          role: "user",
          content: `Patient Symptoms: ${symptoms}\nVitals: ${JSON.stringify(vitals)}`
        }
      ],
      temperature: 0,
      max_tokens: 2
    });

    const score = parseInt(completion.choices[0].message.content || "5");
    return isNaN(score) ? 5 : Math.min(Math.max(score, 1), 10);
  } catch (error) {
    console.error('AI Triage Error:', error);
    return 5; // Default moderate score on error
  }
}