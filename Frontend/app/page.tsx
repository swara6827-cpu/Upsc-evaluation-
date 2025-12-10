"use client";

import React, { useState } from "react";

type EvalResult = {
  score: number;
  max_score: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
};

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://upsc-evaluation.onrender.com";

const API_BASE = rawBase.replace(/\/+$/, "");

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [maxMarks, setMaxMarks] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvalResult | null>(null);

  async function handleEvaluate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, maxMarks }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `API error: ${res.status}`);
      }

      const data = (await res.json()) as EvalResult;
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem",
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
        UPSC Answer Evaluator
      </h1>
      <p style={{ marginBottom: "1.5rem" }}>
        Paste a UPSC mains question and your answer. The AI (via Groq) will
        evaluate it and give marks + feedback.
      </p>

      <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
        Question
      </label>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 16,
          borderRadius: 4,
          border: "1px solid #ccc",
          fontFamily: "inherit",
        }}
        placeholder="Write the UPSC mains question here..."
      />

      <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
        Your Answer
      </label>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={8}
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 16,
          borderRadius: 4,
          border: "1px solid #ccc",
          fontFamily: "inherit",
        }}
        placeholder="Write or paste your answer here..."
      />

      <label style={{ display: "inline-block", marginRight: 8, fontWeight: 600 }}>
        Max Marks
      </label>
      <input
        type="number"
        value={maxMarks}
        onChange={(e) => setMaxMarks(Number(e.target.value) || 0)}
        style={{
          width: 80,
          padding: 4,
          marginBottom: 16,
          borderRadius: 4,
          border: "1px solid #ccc",
        }}
      />

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={handleEvaluate}
          disabled={loading || !answer || !question}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: 4,
            border: "none",
            backgroundColor: loading ? "#999" : "#111827",
            color: "white",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Evaluating..." : "Evaluate Answer"}
        </button>
      </div>

      {error && (
        <div
          style={{
            color: "#b91c1c",
            background: "#fee2e2",
            borderRadius: 4,
            padding: 8,
            marginBottom: 16,
          }}
        >
          Error: {error}
        </div>
      )}

      {result && (
        <section
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>
            Result
          </h2>
          <p style={{ marginBottom: 8 }}>
            <strong>Score:</strong> {result.score} / {result.max_score}
          </p>

          <div style={{ marginBottom: 8 }}>
            <strong>Strengths:</strong>
            <ul>
              {result.strengths?.map((s, i) => (
                <li key={`s-${i}`}>{s}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: 8 }}>
            <strong>Weaknesses:</strong>
            <ul>
              {result.weaknesses?.map((w, i) => (
                <li key={`w-${i}`}>{w}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Improvements:</strong>
            <ul>
              {result.improvements?.map((im, i) => (
                <li key={`im-${i}`}>{im}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
