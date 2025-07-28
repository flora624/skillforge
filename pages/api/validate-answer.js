import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { studentSummary, originalSolution } = req.body;

  if (!studentSummary || !originalSolution) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // --- NEW: "FEW-SHOT" PROMPT ---
  // We provide clear examples of what we want. This is far more
  // effective than just describing the task.
  const prompt = `
    You are an expert project evaluator. Your task is to determine if a student's summary aligns with the official solution's key steps.
    You must only respond with a single word: "Correct" or "Incorrect".

    ---
    Example 1:
    Official Solution: "The user should first clean the data by removing null values, then use a linear regression model to predict sales."
    Student's Summary: "I loaded the data and made a prediction."
    Your Answer:
    Incorrect

    ---
    Example 2:
    Official Solution: "The user should first clean the data by removing null values, then use a linear regression model to predict sales."
    Student's Summary: "After tidying up the dataset by handling missing values, I implemented a linear regression to forecast sales figures."
    Your Answer:
    Correct

    ---
    Example 3:
    Official Solution: "Build a responsive website using HTML for structure, CSS for styling, and JavaScript for interactivity."
    Student's Summary: "random words car boat plane"
    Your Answer:
    Incorrect

    ---
    Task to Evaluate:
    Official Solution: "${originalSolution}"
    Student's Summary: "${studentSummary}"
    Your Answer:
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.0, // Keep temperature at 0 for maximum predictability
        maxOutputTokens: 5,   // The answer should be very short
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let verdict = response.text().trim();

    // Stricter cleanup: Only accept the exact word "Correct".
    // Anything else, including longer sentences or variations, becomes "Incorrect".
    if (verdict.toLowerCase() === 'correct') {
      verdict = 'Correct';
    } else {
      verdict = 'Incorrect';
    }

    res.status(200).json({ verdict: verdict });

  } catch (error) {
    console.error("Error calling Google API:", error);
    res.status(500).json({ message: "Error communicating with the AI." });
  }
}