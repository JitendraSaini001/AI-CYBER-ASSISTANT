import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import Loader from "./Loader";

const sanitize = s => (s||"").trim();

export default function SMSAnalyzer({ apiBase, onResult }) {
  const [sms, setSMS] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    const m = sanitize(sms);
    if(!m) return;
    setLoading(true); setResult("");
    try {
      const res = await fetch(`${apiBase}/analyze/sms`, {
        method:"POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ message: m })
      });
      const data = await res.json();
      const r = data.result || JSON.stringify(data);
      setResult(r);
      onResult && onResult({ type:"SMS", message: m, result: r, timestamp: Date.now() });
    } catch {
      setResult("⚠️ Error connecting to backend");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header"><h3>SMS Analyzer</h3><div className="small muted">Detect phishing or scam messages</div></div>

      <textarea className="textarea" value={sms} onChange={(e)=>setSMS(e.target.value)} placeholder="Enter suspicious SMS content" />
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button className="btn" onClick={analyze} disabled={loading}>Analyze</button>
        <button className="btn ghost" onClick={()=>{ setSMS(""); setResult(""); }} disabled={loading}>Clear</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? <Loader /> : result && (
          <div className="result">
            <div className="title"><strong>Result</strong><span className="small muted">SMS analysis</span></div>
            <div style={{ marginTop: 8 }}><ReactMarkdown>{result}</ReactMarkdown></div>
          </div>
        )}
      </div>
    </div>
  );
}
