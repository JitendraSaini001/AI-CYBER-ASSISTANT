import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import Loader from "./Loader";

const sanitizeUrl = u => (u||"").trim();

export default function URLScanner({ apiBase, onResult }) {
  const [url, setURL] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    const u = sanitizeUrl(url);
    if(!u) return;
    setLoading(true); setResult("");
    try {
      const res = await fetch(`${apiBase}/analyze/url`, {
        method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ url: u })
      });
      const data = await res.json();
      const r = data.result || JSON.stringify(data);
      setResult(r);
      onResult && onResult({ type:"URL", url: u, result: r, timestamp: Date.now() });
    } catch(e) {
      setResult("⚠️ Error connecting to backend");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <h3>URL Scanner</h3>
        <div className="small muted">Check links for phishing or malware</div>
      </div>

      <input className="input" value={url} onChange={(e)=>setURL(e.target.value)} placeholder="https://example.com" />
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <button className="btn" onClick={analyze} disabled={loading}>Scan</button>
        <button className="btn ghost" onClick={()=>{ setURL(""); setResult(""); }} disabled={loading}>Clear</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? <Loader /> : result && (
          <div className="result">
            <div className="title"><strong>Result</strong><span className="small muted">URL analysis</span></div>
            <div style={{ marginTop: 8 }}><ReactMarkdown>{result}</ReactMarkdown></div>
          </div>
        )}
      </div>
    </div>
  );
}
