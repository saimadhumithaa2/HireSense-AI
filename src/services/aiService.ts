import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface HistoryContext {
  score: number;
  date: string;
}

export interface InterviewAnalysis {
  summary: string;
  starFeedback: string;
  improvedAnswer: string;
  score: number;
  starScores: { s: number; t: number; a: number; r: number };
  nextStep: string;
}

export const analyzeInterview = async (
  transcript: string, 
  history: HistoryContext[] = [],
  resume: string = "",
  isExpertMode: boolean = false
): Promise<InterviewAnalysis> => {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not defined in your .env file");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const historyContext = history.length > 0 
    ? `The candidate's recent performance trend (last ${history.length} scores): ${history.map(h => `${h.score}% on ${new Date(h.date).toLocaleDateString()}`).join(', ')}.`
    : 'This is the candidate\'s first recorded session.';

  const resumeContext = resume 
    ? `CANDIDATE RESUME SUMMARY: "${resume}". Use specific details from their resume (projects, roles, skills) to personalize the evaluation and mention if they effectively showcased their background.`
    : 'No resume provided.';

    const modelType = isExpertMode ? "Expert Hard-Line Assessor" : "Supportive Senior Manager";
    const difficultyLevel = isExpertMode ? "EXTREME: Be brutally honest, point out all logical fallacies, and expect senior-level precision." : "PROFESSIONAL: Be encouraging but thorough in technical gaps.";

    const prompt = `
    You are a ${modelType} at a top-tier tech firm. 
    Analyze this interview transcript: "${transcript}"
    
    CRITICALITY LEVEL: ${difficultyLevel}
    ${historyContext}
    ${resumeContext}
    
    Evaluate the response and provide a professional breakdown.
    
    Return the response strictly as a JSON object with these keys: 
    { 
      "summary": "professional assessment including progress from previous sessions",
      "starFeedback": "detailed feedback on SITUATION, TASK, ACTION, and RESULT",
      "improvedAnswer": "a world-class version of this response",
      "score": number (0-100),
      "starScores": { "s": 0-25, "t": 0-25, "a": 0-25, "r": 0-25 },
      "nextStep": "specific technical topic or behavioral area to focus on next"
    }

    Return ONLY the JSON string.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(jsonString) as InterviewAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};