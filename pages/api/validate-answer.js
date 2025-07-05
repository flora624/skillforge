import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { studentSummary, originalSolution } = req.body;

  if (!studentSummary || !originalSolution) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const prompt = `
    You are an expert project evaluator for a student learning platform.
    Your task is to determine if a student's summary of their work aligns with the official solution's approach.
    The student does not need to be perfect, but they must mention the key concepts and steps.
    For example, for a data analysis project, they should mention cleaning data and using specific analysis methods. For a web project, they should mention HTML/CSS and responsiveness.

    Official Solution Approach: "${originalSolution}"

    Student's Summary: "${studentSummary}"

    Based on the student's summary, does their approach correctly follow the key steps outlined in the official solution?
    Answer with only a single word: "Correct" or "Incorrect".
  `;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 5,
    });

    let verdict = completion.data.choices[0].message.content.trim();
    // Clean up the response to ensure it's only the word we want
    if (verdict.toLowerCase().includes('correct')) {
        verdict = 'Correct';
    } else {
        verdict = 'Incorrect';
    }

    res.status(200).json({ verdict: verdict });

  } catch (error) {
    console.error("Error calling OpenAI API:", error.response?.data || error.message);
    res.status(500).json({ message: "Error communicating with the AI." });
  }
}