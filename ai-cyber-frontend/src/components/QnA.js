import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import Loader from "./Loader";

function sanitize(s){ return (s||"").trim(); }

export default function QnA({ apiBase, onResult }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    const q = sanitize(question);
    if (!q) return;
    setLoading(true); setAnswer("");
    try {
      const res = await fetch(`${apiBase}/ask`, {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      const ans = data.answer || JSON.stringify(data);
      setAnswer(ans);
      const item = { type: "QnA", question: q, answer: ans, timestamp: Date.now() };
      onResult && onResult(item);
    } catch (e) {
      setAnswer("⚠️ Error connecting to backend");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <h3>AI Q&A Chat</h3>
        <div className="small muted">Ask the assistant about cybersecurity</div>
      </div>

      <textarea className="textarea" value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="How to secure my React app?" />
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button className="btn" onClick={ask} disabled={loading}>Ask AI</button>
        <button className="btn ghost" onClick={()=>{ setQuestion(""); setAnswer(""); }} disabled={loading}>Clear</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? <Loader /> : answer && (
          <div className="result">
            <div className="title">
              <strong>Answer</strong>
              <span className="small muted">AI response</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
