import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import "./index.css";

const API_BASE = "https://ai-cyber-assistant-1.onrender.com/";

// Small SVG PieChart component
function PieChart({ values = [], size = 160, inner = 60, colors = ["#27ae60", "#e74c3c"] }) {
  const total = values.reduce((s, v) => s + v, 0) || 1;
  let angle = -90;
  const segments = values.map((v, i) => {
    const portion = (v / total) * 360;
    const start = angle;
    const end = angle + portion;
    angle = end;
    const large = portion > 180 ? 1 : 0;
    const r = size / 2;
    const rad = Math.PI / 180;
    const x1 = r + r * Math.cos(start * rad);
    const y1 = r + r * Math.sin(start * rad);
    const x2 = r + r * Math.cos(end * rad);
    const y2 = r + r * Math.sin(end * rad);
    const d = `M ${r} ${r} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { d, color: colors[i % colors.length], key: i };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="pie-chart" aria-hidden>
      {segments.map((s) => (
        <path key={s.key} d={s.d} fill={s.color} stroke={s.color} strokeWidth="0.2" />
      ))}
      <circle cx={size / 2} cy={size / 2} r={inner} fill="var(--panel)" />
    </svg>
  );
}

export default function App() {
  // Inputs & results
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

  // Dashboard & UI
  const [darkMode, setDarkMode] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [showWelcome, setShowWelcome] = useState(true);
  const [threats, setThreats] = useState([]);
  const [sessionScans, setSessionScans] = useState([]);

  // Stats
  const stats = useMemo(() => {
    const s = { total: sessionScans.length, risky: 0, safe: 0 };
    sessionScans.forEach((scan) => {
      const txt = ((scan.result || "") + " " + (scan.risk || "")).toLowerCase();
      if (txt.includes("high") || txt.includes("malware") || txt.includes("phish") || txt.includes("danger")) s.risky++;
      else s.safe++;
    });
    return s;
  }, [sessionScans]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("light-mode", !darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchThreats();
    fetchSession();
    const welcomeTimer = setTimeout(() => setShowWelcome(false), 1800);
    const threatInterval = setInterval(fetchThreats, 30000); // auto-refresh every 30s
    return () => {
      clearTimeout(welcomeTimer);
      clearInterval(threatInterval);
    };
  }, []);

  const getRiskColor = (text) =>
    text?.toLowerCase().includes("high")
      ? "#e74c3c"
      : text?.toLowerCase().includes("medium")
      ? "#f39c12"
      : "#27ae60";

  const markdownComponents = {
    h1: ({ children }) => <h1 style={{ fontSize: 20 }}>{children}</h1>,
    h2: ({ children }) => <h2 style={{ fontSize: 18 }}>{children}</h2>,
    a: ({ children, ...props }) => (
      <a {...props} style={{ color: darkMode ? "#7afcff" : "#0b63ff" }} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
  };

  // API calls
  const handleAPICall = async (endpoint, payloadSetter, payload) => {
    payloadSetter("⏳ Processing...");
    try {
      const res = await axios.post(`${API_BASE}/${endpoint}`, payload);
      const result = res.data.result || res.data.answer || JSON.stringify(res.data);
      payloadSetter(result);
      setSessionScans((prev) => [...prev, { result, type: endpoint }]);
    } catch {
      payloadSetter("⚠️ Backend error");
    }
  };

  const ask = () => handleAPICall("ask", setAnswer, { question });
  const analyzeURL = () => handleAPICall("analyze/url", setURLResult, { url });
  const analyzeSMS = () => handleAPICall("analyze/sms", setSMSResult, { message: sms });
  const analyzeEmail = () => handleAPICall("analyze/email", setEmailResult, { subject: emailSubject, body: emailBody });
  const analyzeFile = async () => {
    if (!file) return;
    setFileResult("⏳ Processing...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${API_BASE}/analyze/file`, fd);
      const result = res.data.result || JSON.stringify(res.data);
      setFileResult(result);
      setSessionScans((prev) => [...prev, { result, type: "file" }]);
    } catch {
      setFileResult("⚠️ Backend error");
    }
  };

  const fetchThreats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/threat-feed`);
      setThreats(res.data.feed || []);
    } catch {
      setThreats([]);
    }
  };

  const fetchSession = async () => {
    // Fetch saved session from backend if implemented
    // Otherwise keep local
    setSessionScans([]);
  };

  const handleEnter = (e, fn) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fn();
    }
  };

  const panelHeader = (title, subtitle) => (
    <div className="panel-header">
      <div>
        <h4>{title}</h4>
        {subtitle && <small className="muted">{subtitle}</small>}
      </div>
    </div>
  );

  const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 }, transition: { duration: 0.28 } };

  return (
    <div className="dashboard-wrap">
      {/* Sidebar */}
      <aside className="sidebar-glass" role="navigation" aria-label="Sidebar">
        <div className="brand">
          <span className="logo" aria-hidden>🔐</span>
          <div>
            <div className="brand-title">Cyber Assistant</div>
            <div className="brand-sub">AI Security</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main panels">
          {["Dashboard", "QnA", "URL", "SMS", "File", "Email", "Threat Feed"].map((p) => (
            <button key={p} className={`nav-btn ${active === p ? "active" : ""}`} onClick={() => setActive(p)} aria-pressed={active === p}>
              {p}
            </button>
          ))}
        </nav>

        <div className="sidebar-stats" aria-hidden={false}>
          <div className="stat">
            <div className="stat-title">Total</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Risky</div>
            <div className="stat-value risky">{stats.risky}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Safe</div>
            <div className="stat-value safe">{stats.safe}</div>
          </div>

          <div className="mode-row">
            <button className="mode-btn" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">
              {darkMode ? "🌞 Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-area">
        <AnimatePresence>{showWelcome && (
          <motion.div {...fadeUp} className="welcome-card" key="welcome">
            <h2>Welcome 👋</h2>
            <p>AI Cyber Assistant — your security co-pilot</p>
          </motion.div>
        )}</AnimatePresence>

        {/* Dashboard */}
        {active === "Dashboard" && (
          <section className="grid" aria-live="polite">
            <motion.div {...fadeUp} className="card large glass">
              {panelHeader("Overview")}
              <div className="overview-grid">
                <div className="overview-stats">
                  <div className="tag">Total Scans: <span>{stats.total}</span></div>
                  <div className="tag">Risky: <span className="risky">{stats.risky}</span></div>
                  <div className="tag">Safe: <span className="safe">{stats.safe}</span></div>
                </div>
                <div className="overview-chart">
                  <PieChart values={[stats.safe, stats.risky]} />
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* QnA panel */}
        {active === "QnA" && (
          <section className="single-panel" aria-live="polite">
            <motion.div {...fadeUp} className="card glass">
              {panelHeader("Ask a Question")}
              <textarea rows={4} placeholder="Ask a cybersecurity question..." value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => handleEnter(e, ask)} />
              <div className="row"><button className="btn primary" disabled={!question.trim()} onClick={ask}>Ask</button></div>
              {answer && <div className="result-block"><ReactMarkdown components={markdownComponents}>{answer}</ReactMarkdown></div>}
            </motion.div>
          </section>
        )}

        {/* URL, SMS, File, Email panels */}
        {active === "URL" && (
          <section className="single-panel" aria-live="polite">
            <motion.div {...fadeUp} className="card glass">
              {panelHeader("URL Analyzer")}
              <input placeholder="https://example.com" value={url} onChange={e => setURL(e.target.value)} onKeyDown={e => handleEnter(e, analyzeURL)} />
              <button className="btn success" disabled={!url.trim()} onClick={analyzeURL}>Analyze URL</button>
              {urlResult && <div className="result-block"><ReactMarkdown components={markdownComponents}>{urlResult}</ReactMarkdown></div>}
            </motion.div>
          </section>
        )}

        {active === "SMS" && (
          <section className="single-panel" aria-live="polite">
            <motion.div {...fadeUp} className="card glass">
              {panelHeader("SMS Analyzer")}
              <textarea rows={3} placeholder="Enter suspicious SMS..." value={sms} onChange={e => setSMS(e.target.value)} onKeyDown={e => handleEnter(e, analyzeSMS)} />
              <button className="btn warn" disabled={!sms.trim()} onClick={analyzeSMS}>Analyze SMS</button>
              {smsResult && <div className="result-block"><ReactMarkdown components={markdownComponents}>{smsResult}</ReactMarkdown></div>}
            </motion.div>
          </section>
        )}

        {active === "File" && (
          <section className="single-panel" aria-live="polite">
            <motion.div {...fadeUp} className="card glass">
              {panelHeader("File Analyzer")}
              <input type="file" onChange={e => setFile(e.target.files[0])} />
              <button className="btn purple" disabled={!file} onClick={analyzeFile}>Analyze File</button>
              {fileResult && <div className="result-block"><ReactMarkdown components={markdownComponents}>{fileResult}</ReactMarkdown></div>}
            </motion.div>
          </section>
        )}

        {active === "Email" && (
          <section className="single-panel" aria-live="polite">
            <motion.div {...fadeUp} className="card glass">
              {panelHeader("Email Analyzer")}
              <input placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} onKeyDown={e => handleEnter(e, analyzeEmail)} />
              <textarea rows={3} placeholder="Email body" value={emailBody} onChange={e => setEmailBody(e.target.value)} onKeyDown={e => handleEnter(e, analyzeEmail)} />
              <button className="btn orange" disabled={!emailSubject.trim() && !emailBody.trim()} onClick={analyzeEmail}>Analyze Email</button>
              {emailResult && <div className="result-block"><ReactMarkdown components={markdownComponents}>{emailResult}</ReactMarkdown></div>}
            </motion.div>
          </section>
        )}

        {/* Threat Feed */}
        {active === "Threat Feed" && (
          <section className="single-panel" aria-live="polite">
            <motion.div {...fadeUp} className="card glass">
              {panelHeader("Live Threat Feed")}
              <div className="scroll-container">
                {threats.length === 0 ? <p className="muted">No threats right now</p> :
                  threats.map((t, i) => (
                    <div key={i} className="threat-card" style={{ background: getRiskColor(t.risk) }}>
                      {t.title} <span className="muted">({t.risk})</span>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          </section>
        )}
      </main>
    </div>
  );
}
