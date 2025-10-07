import React, { useState } from "react";
import Loader from "./Loader";
import ReactMarkdown from "react-markdown";

export default function FileScanner({ apiBase, onResult }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!file) return;
    setLoading(true); setResult("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${apiBase}/analyze/file`, { method: "POST", body: fd });
      const data = await res.json();
      const r = data.result || JSON.stringify(data);
      setResult(r);
      onResult && onResult({ type:"File", filename: file.name, result: r, timestamp: Date.now() });
    } catch {
      setResult("⚠️ Error connecting to backend");
    } finally { setLoading(false); setFile(null); }
  }

  return (
    <div>
      <div className="page-header"><h3>File Scanner</h3><div className="small muted">Upload file to scan for malware</div></div>
      <input className="input" type="file" onChange={(e)=>setFile(e.target.files[0])} />
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button className="btn" onClick={analyze} disabled={!file || loading}>Scan</button>
        <button className="btn ghost" onClick={()=>{ setFile(null); setResult(""); }} disabled={loading}>Clear</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? <Loader /> : result && (
          <div className="result">
            <div className="title"><strong>Result</strong><span className="small muted">File analysis</span></div>
            <div style={{ marginTop: 8 }}><ReactMarkdown>{result}</ReactMarkdown></div>
          </div>
        )}
      </div>
    </div>
  );
}
