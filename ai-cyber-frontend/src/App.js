import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [url, setURL] = useState("");
  const [urlResult, setURLResult] = useState("");
  const [sms, setSMS] = useState("");
  const [smsResult, setSMSResult] = useState("");
  const [file, setFile] = useState(null);
  const [fileResult, setFileResult] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailResult, setEmailResult] = useState("");
  const [history, setHistory] = useState([]);
  const [threats, setThreats] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => { 
    fetchHistory(); 
    fetchThreats(); 
    const timer = setTimeout(() => setShowWelcome(false), 3000); // hide welcome after 3 sec
    return () => clearTimeout(timer);
  }, []);

  const ask = async () => {
    if (!question.trim()) return;
    setAnswer("⏳ Thinking...");
    try {
      const res = await axios.post(`${API_BASE}/ask`, { question });
      setAnswer(res.data.answer || JSON.stringify(res.data));
      fetchHistory();
    } catch { setAnswer("⚠️ Error connecting to backend"); }
  };

  const analyzeURL = async () => {
    if (!url.trim()) return;
    setURLResult("⏳ Analyzing...");
    try {
      const res = await axios.post(`${API_BASE}/analyze/url`, { url });
      setURLResult(res.data.result || JSON.stringify(res.data));
      fetchHistory();
    } catch { setURLResult("⚠️ Error connecting to backend"); }
  };

  const analyzeSMS = async () => {
    if (!sms.trim()) return;
    setSMSResult("⏳ Analyzing...");
    try {
      const res = await axios.post(`${API_BASE}/analyze/sms`, { message: sms });
      setSMSResult(res.data.result || JSON.stringify(res.data));
      fetchHistory();
    } catch { setSMSResult("⚠️ Error connecting to backend"); }
  };

  const analyzeFile = async () => {
    if (!file) return;
    setFileResult("⏳ Analyzing...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API_BASE}/analyze/file`, formData);
      setFileResult(res.data.result || JSON.stringify(res.data));
      fetchHistory();
    } catch { setFileResult("⚠️ Error connecting to backend"); }
  };

  const analyzeEmail = async () => {
    if (!emailSubject.trim() && !emailBody.trim()) return;
    setEmailResult("⏳ Analyzing...");
    try {
      const res = await axios.post(`${API_BASE}/analyze/email`, { subject: emailSubject, body: emailBody });
      setEmailResult(res.data.result || JSON.stringify(res.data));
      fetchHistory();
    } catch { setEmailResult("⚠️ Error connecting to backend"); }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data.history ? res.data.history.slice().reverse() : []);
    } catch { setHistory([]); }
  };

  const fetchThreats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/threat-feed`);
      setThreats(res.data.feed || []);
    } catch { setThreats([]); }
  };

  const getRiskColor = (text) => text.toLowerCase().includes("high") ? "#e74c3c" : text.toLowerCase().includes("medium") ? "#f39c12" : "#27ae60";

  const cardStyle = {
    padding: 16, 
    borderRadius: 14, 
    marginTop: 20, 
    boxShadow: darkMode ? "0 2px 12px rgba(0,0,0,0.6)" : "0 2px 12px rgba(0,0,0,0.1)", 
    transition: "all 0.3s ease"
  };

  const inputStyle = { padding: 10, width: "100%", borderRadius: 8, border: "1px solid #ccc", marginTop: 8 };

  const resultCardStyle = (type) => {
    let bg, border;
    switch (type) {
      case "QnA": bg = darkMode ? "#1a2a4a" : "#e8f1fc"; border = "#3498db"; break;
      case "URL": bg = darkMode ? "#1a4a2a" : "#e8fcee"; border = "#27ae60"; break;
      case "SMS": bg = darkMode ? "#4a2a1a" : "#fce8e0"; border = "#e67e22"; break;
      case "File": bg = darkMode ? "#3a1a4a" : "#f0e8fc"; border = "#8e44ad"; break;
      case "Email": bg = darkMode ? "#4a331a" : "#fcf0e8"; border = "#d35400"; break;
      default: bg = darkMode ? "#3a3a3a" : "#f7f9fc"; border = "#ccc";
    }
    return {
      padding: 14, 
      marginBottom: 12, 
      borderRadius: 12, 
      background: bg, 
      borderLeft: `5px solid ${border}`, 
      lineHeight: 1.7, 
      fontSize: 16,
      transition: "all 0.3s ease",
      cursor: "pointer",
      boxShadow: darkMode ? "0 2px 12px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.1)"
    };
  };

  const markdownComponents = {
    h1: ({node, children}) => <h1 style={{fontSize: 24, fontWeight: 700, margin: '12px 0'}}>{children}</h1>,
    h2: ({node, children}) => <h2 style={{fontSize: 20, fontWeight: 600, margin: '10px 0'}}>{children}</h2>,
    h3: ({node, children}) => <h3 style={{fontSize: 18, fontWeight: 600, margin: '8px 0'}}>{children}</h3>,
    strong: ({node, ...props}) => <strong style={{color: darkMode ? "#ffd700" : "#2c3e50"}} {...props} />,
    a: ({node, children, ...props}) => <a style={{color: "#1a73e8", textDecoration: 'underline'}} {...props} target="_blank" rel="noopener noreferrer">{children}</a>,
    li: ({node, ...props}) => (
      <motion.li initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: 8, padding: 6, borderRadius: 6, background: darkMode ? "#4a4a4a" : "#e8f0fe", listStyleType: "none" }} {...props} />
    ),
    ul: ({node, ...props}) => <ul style={{ paddingLeft: 0, marginBottom: 12 }} {...props} />,
    ol: ({node, ...props}) => <ol style={{ paddingLeft: 0, marginBottom: 12 }} {...props} />,
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 24, minHeight: "100vh", background: darkMode ? "#1e1e1e" : "#eef3fa", color: darkMode ? "#fff" : "#2c3e50", transition: "all 0.5s ease", position: "relative", overflow: "hidden" }}>
      
      {/* Animated Background */}
      <div style={{
        position: "absolute",
        top:0, left:0, width:"100%", height:"100%", zIndex:0,
        background: darkMode ? "linear-gradient(120deg, #0f2027, #203a43, #2c5364)" : "linear-gradient(120deg, #a1c4fd, #c2e9fb, #f0f9ff)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite"
      }} />

      {/* Welcome Overlay */}
      {showWelcome && (
        <motion.div initial={{opacity:1}} animate={{opacity:0}} transition={{duration:3}} style={{
          position: "absolute", top:0, left:0, width:"100%", height:"100%", zIndex:2, display:"flex", justifyContent:"center", alignItems:"center", background: "rgba(0,0,0,0.7)", color:"#fff", fontSize:32, fontWeight:"bold"
        }}>
          Welcome to AI Cyber Assistant
        </motion.div>
      )}

      <div style={{ position:"relative", zIndex:1, textAlign: "center", marginBottom: 24 }}>
        <h1>🔐 AI Cyber Assistant</h1>
        <button onClick={() => setDarkMode(!darkMode)} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", transition:"0.3s all" }}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", position:"relative", zIndex:1 }}>
        {/* QnA */}
        <div style={{ ...cardStyle, background: darkMode ? "#2c2c2c" : "#fff" }}>
          <h3>💡 Ask a Question</h3>
          <textarea rows={3} style={inputStyle} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a cybersecurity question..." />
          <button onClick={ask} style={{ marginTop: 10, padding: "10px 18px", background: "#3498db", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Ask</button>
          {answer && <motion.div whileHover={{scale:1.02}} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={resultCardStyle("QnA")}>
            <ReactMarkdown components={markdownComponents}>{answer}</ReactMarkdown>
          </motion.div>}
        </div>

        {/* URL Analyzer */}
        <div style={{ ...cardStyle, background: darkMode ? "#2c2c2c" : "#fff" }}>
          <h3>🌐 URL Analyzer</h3>
          <input style={inputStyle} value={url} onChange={e => setURL(e.target.value)} placeholder="https://example.com" />
          <button onClick={analyzeURL} style={{ marginTop: 10, padding: "10px 18px", background: "#27ae60", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Analyze URL</button>
          {urlResult && <motion.div whileHover={{scale:1.02}} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={resultCardStyle("URL")}>
            <ReactMarkdown components={markdownComponents}>{urlResult}</ReactMarkdown>
          </motion.div>}
        </div>

        {/* SMS Analyzer */}
        <div style={{ ...cardStyle, background: darkMode ? "#2c2c2c" : "#fff" }}>
          <h3>📩 SMS Analyzer</h3>
          <textarea rows={2} style={inputStyle} value={sms} onChange={e => setSMS(e.target.value)} placeholder="Enter suspicious SMS text..." />
          <button onClick={analyzeSMS} style={{ marginTop: 10, padding: "10px 18px", background: "#e67e22", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Analyze SMS</button>
          {smsResult && <motion.div whileHover={{scale:1.02}} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={resultCardStyle("SMS")}>
            <ReactMarkdown components={markdownComponents}>{smsResult}</ReactMarkdown>
          </motion.div>}
        </div>

        {/* File Analyzer */}
        <div style={{ ...cardStyle, background: darkMode ? "#2c2c2c" : "#fff" }}>
          <h3>📄 File Analyzer</h3>
          <input type="file" onChange={e => setFile(e.target.files[0])} style={{ marginTop: 8 }} />
          <button onClick={analyzeFile} style={{ marginTop: 10, padding: "10px 18px", background: "#8e44ad", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Analyze File</button>
          {fileResult && <motion.div whileHover={{scale:1.02}} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={resultCardStyle("File")}>
            <ReactMarkdown components={markdownComponents}>{fileResult}</ReactMarkdown>
          </motion.div>}
        </div>

        {/* Email Analyzer */}
        <div style={{ ...cardStyle, background: darkMode ? "#2c2c2c" : "#fff" }}>
          <h3>📧 Email Analyzer</h3>
          <input style={inputStyle} value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Subject" />
          <textarea rows={2} style={{ ...inputStyle, marginTop: 8 }} value={emailBody} onChange={e => setEmailBody(e.target.value)} placeholder="Email Body" />
          <button onClick={analyzeEmail} style={{ marginTop: 10, padding: "10px 18px", background: "#d35400", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Analyze Email</button>
          {emailResult && <motion.div whileHover={{scale:1.02}} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={resultCardStyle("Email")}>
            <ReactMarkdown components={markdownComponents}>{emailResult}</ReactMarkdown>
          </motion.div>}
        </div>

        {/* Threat Feed */}
        <div style={{ ...cardStyle, background: darkMode ? "#2c2c2c" : "#fff" }}>
          <h3>⚠️ Live Threat Feed</h3>
          <div>
            {threats.map((t, idx) => (
              <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 10, marginBottom: 8, borderRadius: 8, background: getRiskColor(t.risk), color: "#fff" }}>
                {t.title} ({t.risk})
              </motion.div>
            ))}
          </div>
        </div>

        {/* History */}
        <div style={{ ...cardStyle, background: darkMode ? "#2c2c2c" : "#fff" }}>
          <h3>📜 History</h3>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {history.length === 0 && <p style={{ color: "#888" }}>No history yet...</p>}
            {history.map((it, idx) => (
              <motion.div key={idx} whileHover={{scale:1.02}} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={resultCardStyle(it.type)}>
                {it.type === "QnA" && <div><strong>❓ Q:</strong> {it.question}<br /><strong>✅ A:</strong><ReactMarkdown components={markdownComponents}>{it.answer}</ReactMarkdown></div>}
                {it.type === "URL" && <div><strong>🌍 URL:</strong> {it.url}<br /><strong>🔎 Result:</strong><ReactMarkdown components={markdownComponents}>{it.result}</ReactMarkdown></div>}
                {it.type === "SMS" && <div><strong>✉️ SMS:</strong> {it.message}<br /><strong>🔎 Result:</strong><ReactMarkdown components={markdownComponents}>{it.result}</ReactMarkdown></div>}
                {it.type === "File" && <div><strong>📄 File:</strong> {it.filename}<br /><strong>🔎 Result:</strong><ReactMarkdown components={markdownComponents}>{it.result}</ReactMarkdown></div>}
                {it.type === "Email" && <div><strong>📧 Email:</strong> {it.subject}<br /><strong>🔎 Result:</strong><ReactMarkdown components={markdownComponents}>{it.result}</ReactMarkdown></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes gradientBG {
            0% {background-position:0% 50%}
            50% {background-position:100% 50%}
            100% {background-position:0% 50%}
          }
        `}
      </style>
    </div>
  );
}

export default App;
