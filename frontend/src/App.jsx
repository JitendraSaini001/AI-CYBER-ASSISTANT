import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [url, setURL] = useState("");
  const [urlResult, setURLResult] = useState("");
  const [sms, setSMS] = useState("");
  const [smsResult, setSMSResult] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => { fetchHistory(); }, []);

  const ask = async () => {
    if (!question.trim()) return;
    setAnswer("Loading...");
    try {
      const res = await axios.post(`${API_BASE}/ask`, { question });
      setAnswer(res.data.answer || JSON.stringify(res.data));
      fetchHistory();
    } catch (e) {
      setAnswer("⚠️ Error connecting to backend");
      console.error(e);
    }
  };

  const analyzeURL = async () => {
    if (!url.trim()) return;
    setURLResult("Loading...");
    try {
      const res = await axios.post(`${API_BASE}/analyze/url`, { url });
      setURLResult(res.data.result || JSON.stringify(res.data));
      fetchHistory();
    } catch {
      setURLResult("⚠️ Error connecting to backend");
    }
  };

  const analyzeSMS = async () => {
    if (!sms.trim()) return;
    setSMSResult("Loading...");
    try {
      const res = await axios.post(`${API_BASE}/analyze/sms`, { message: sms });
      setSMSResult(res.data.result || JSON.stringify(res.data));
      fetchHistory();
    } catch {
      setSMSResult("⚠️ Error connecting to backend");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data.history.slice().reverse());
    } catch {}
  };

  const box = { padding: "10px", borderRadius: 8, background: "#fff", marginTop: 8 };
  const input = { padding: 10, width: 360, borderRadius: 8, marginRight: 8 };

  return (
    <div style={{ fontFamily: "Arial", padding: 24, background: "#f0f6ff", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>AI Cyber Assistant</h1>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: 20, borderRadius: 12 }}>
        <div style={box}>
          <h3>QnA</h3>
          <textarea rows={3} style={{ ...input, width: "100%" }} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a cybersecurity question..." />
          <button onClick={ask} style={{ marginTop: 8, padding: "8px 16px" }}>Ask</button>
          {answer && <div style={{ marginTop: 10 }}><strong>Answer:</strong><div style={{ marginTop:6 }}>{answer}</div></div>}
        </div>

        <div style={box}>
          <h3>URL Analyzer</h3>
          <input style={input} value={url} onChange={e => setURL(e.target.value)} placeholder="https://..." />
          <button onClick={analyzeURL}>Analyze URL</button>
          {urlResult && <div style={{ marginTop: 8 }}>{urlResult}</div>}
        </div>

        <div style={box}>
          <h3>SMS Analyzer</h3>
          <textarea rows={2} style={{ ...input, width: "100%" }} value={sms} onChange={e=>setSMS(e.target.value)} placeholder="Enter SMS text..." />
          <button onClick={analyzeSMS}>Analyze SMS</button>
          {smsResult && <div style={{ marginTop:8 }}>{smsResult}</div>}
        </div>

        <div style={box}>
          <h3>History</h3>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {history.map((it, idx) => (
              <div key={idx} style={{ padding:8, borderBottom: "1px solid #eee" }}>
                {it.type === "QnA" && <div><strong>Q:</strong> {it.question}<br/><strong>A:</strong> {it.answer}</div>}
                {it.type === "URL" && <div><strong>URL:</strong> {it.url}<br/><strong>Result:</strong> {it.result}</div>}
                {it.type === "SMS" && <div><strong>SMS:</strong> {it.message}<br/><strong>Result:</strong> {it.result}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
