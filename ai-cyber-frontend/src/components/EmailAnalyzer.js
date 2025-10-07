import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import Loader from "./Loader";

const sanitize = s => (s||"").trim();

export default function EmailAnalyzer({ apiBase, onResult }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    const s = sanitize(subject), b = sanitize(body);
    if (!s && !b) return;
    setLoading(true); setResult("");
    try {
      const res = await fetch(`${apiBase}/analyze/email`, {
        method:"POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ subject: s, body: b })
      });
      const data = await res.json();
      const r = data.result || JSON.stringify(data);
      setResult(r);
      onResult && onResult({ type:"Email", subject: s, body: b, result: r, timestamp: Date.now() });
    } catch {
      setResult("⚠️ Error connecting to backend");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header"><h3>Email Analyzer</h3><div className="small muted">Analyze phishing indicators</div></div>
      <input className="input" value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder="Subject" />
      <textarea className="textarea" value={body} onChange={(e)=>setBody(e.target.value)} placeholder="Email body" />
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button className="btn" onClick={analyze} disabled={loading}>Analyze</button>
        <button className="btn ghost" onClick={()=>{ setSubject(""); setBody(""); setResult(""); }} disabled={loading}>Clear</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? <Loader /> : result && (
          <div className="result">
            <div className="title"><strong>Result</strong><span className="small muted">Email analysis</span></div>
            <div style={{ marginTop: 8 }}><ReactMarkdown>{result}</ReactMarkdown></div>
          </div>
        )}
      </div>
    </div>
  );
}
