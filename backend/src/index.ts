import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 4000;
const groqApiKey = process.env.GROQ_API_KEY;

// Health check
app.get("/", (req: Request, res: Response) => {
  res.send("UPSC Evaluator API running");
});

// AI evaluation endpoint
app.post("/api/evaluate", async (req: Request, res: Response) => {
  try {
    if (!groqApiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY not configured" });
    }

    const { question, answer, maxMarks = 15 } = req.body || {};

    if (!question || !answer) {
      return res
        .status(400)
        .json({ error: "question and answer are required" });
    }

    const prompt = `
You are an expert UPSC mains examiner.

Evaluate the candidate's answer strictly in UPSC style.

Return ONLY valid JSON. No explanation outside JSON.

The JSON format must be:

{
  "score": number,          // marks awarded, 0 to maxMarks
  "max_score": number,      // equal to maxMarks
  "strengths": string[],    // bullet points of good things
  "weaknesses": string[],   // bullet points of issues
  "improvements": string[]  // actionable suggestions
}

Question:
${question}

Max marks: ${maxMarks}

Candidate's answer:
${answer}
`.trim();

    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-70b-versatile",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You are a strict but fair UPSC Mains examiner. Always answer with pure JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content =
      groqResponse.data.choices?.[0]?.message?.content || "";

    // Try to parse JSON result
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse Groq JSON:", content);
      return res.status(500).json({
        error: "Failed to parse AI response",
        raw: content,
      });
    }

    return res.json(result);
  } catch (err: any) {
    console.error("Error in /api/evaluate:", err?.message || err);
    return res.status(500).json({
      error: "Evaluation failed",
      details: err?.message || "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
