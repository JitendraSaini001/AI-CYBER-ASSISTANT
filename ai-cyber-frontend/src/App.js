// src/App.js
import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import "./index.css"; // Tailwind import should be here
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";






function IconShield() {
  return <span className="inline-block">🛡️</span>;
}

export default function App() {
  // Page routing inside single file
  const [page, setPage] = useState("home"); // home, dashboard, how-to-use, blog, about, contact, privacy, disclaimer
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("dark"); // dark, light
  const [recentScans, setRecentScans] = useState([]);

  // Demo / tool states
  const demoInputRef = useRef(null);

  const [urlInput, setUrlInput] = useState("");
  const [urlResult, setUrlResult] = useState(null);
  const [urlLoading, setUrlLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [fileResult, setFileResult] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailResult, setEmailResult] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [ipInput, setIpInput] = useState("");
  const [ipResult, setIpResult] = useState(null);
  const [ipLoading, setIpLoading] = useState(false);

  const [contactStatus, setContactStatus] = useState(null); // { type: 'success'|'error', text }

  // Navbar scroll effect
  useEffect(() => {
    const handler = () => {
      const nav = document.getElementById("navbar");
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add("shadow-lg");
      else nav.classList.remove("shadow-lg");
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Demo scan (hero -> dashboard)
  const startDemoScan = () => {
    const val = demoInputRef.current?.value ?? "";
    if (!val.trim()) return;
    setPage("dashboard");
    setTimeout(() => {
      setUrlInput(val);
      handleScanURL(val);
    }, 150);
  };

  // Replace the tool handlers in App.js with these:

// Utility to add to history
const addToHistory = (type, target, result) => {
  setRecentScans(prev => [{ type, target, result, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
};

// Utility to download PDF report
const exportReport = (title, data) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text(`AI Cyber Assistant - ${title} Scan Report`, 14, 20);
  
  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Status: ${data.status.toUpperCase()}`, 14, 34);

  // Main Text
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Verdict:", 14, 45);
  doc.setFontSize(11);
  doc.setTextColor(data.status === 'malicious' ? 200 : (data.status === 'suspicious' ? 180 : 0), 0, 0);
  doc.text(data.text || "No verdict provided.", 14, 52);

  let currentY = 65;

  // Details
  if (data.details && data.details.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Technical Details:", 14, currentY);
    currentY += 8;
    
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Finding']],
      body: data.details.map((d, i) => [i + 1, d.replace(/[^\x00-\x7F]/g, '')]), // strip emoji for standard font
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] }
    });
    currentY = doc.lastAutoTable.finalY + 15;
  }

  // Recommended Actions
  if (data.safe_actions && data.safe_actions.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Recommended Actions:", 14, currentY);
    currentY += 8;

    autoTable(doc, {
      startY: currentY,
      head: [['Step', 'Action']],
      body: data.safe_actions.map((a, i) => [i + 1, a.replace(/[^\x00-\x7F]/g, '')]),
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [40, 40, 40] }
    });
  }

  doc.save(`${title}_ScanReport_${new Date().getTime()}.pdf`);
};

// URL Scanner
const handleScanURL = async (value = null) => {
  const url = value ?? urlInput;
  if (!url.trim()) {
    setUrlResult({ status: "error", text: "Please enter a URL to scan." });
    return;
  }
  setUrlLoading(true);
  setUrlResult(null);
  try {
    const res = await fetch("http://localhost:5000/api/scan/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setUrlResult(data);
    if(data.status !== 'error') addToHistory('URL', url, data);
  } catch (err) {
    setUrlResult({ status: "error", text: "Server error: Unable to scan URL." });
  }
  setUrlLoading(false);
};

// File Scanner
const handleScanFile = async (f = null) => {
  const fileToScan = f ?? file;
  if (!fileToScan) {
    setFileResult({ status: "error", text: "Please choose a file to scan." });
    return;
  }
  setFileLoading(true);
  setFileResult(null);
  try {
    const formData = new FormData();
    formData.append("file", fileToScan);
    const res = await fetch("http://localhost:5000/api/scan/file", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setFileResult(data);
    if(data.status !== 'error') addToHistory('File', fileToScan.name, data);
  } catch (err) {
    setFileResult({ status: "error", text: "Server error: Unable to scan file." });
  }
  setFileLoading(false);
};

// Email Analyzer
const handleScanEmail = async () => {
  const subject = emailSubject;
  const body = emailBody;
  if (!body.trim()) {
    setEmailResult({ status: "error", text: "Please enter the email/SMS body to analyze." });
    return;
  }
  setEmailLoading(true);
  setEmailResult(null);
  try {
    const res = await fetch("http://localhost:5000/api/scan/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setEmailResult(data);
    if(data.status !== 'error') addToHistory('Email', subject || 'No Subject', data);
  } catch (err) {
    setEmailResult({ status: "error", text: "Server error: Unable to analyze email." });
  }
  setEmailLoading(false);
};

const handleClearEmail = () => {
  setEmailSubject("");
  setEmailBody("");
  setEmailResult(null);
};

// IP Checker
const handleScanIP = async (value = null) => {
  const ip = value ?? ipInput;
  if (!ip.trim()) {
    setIpResult({ status: "error", text: "Please enter an IP address." });
    return;
  }
  setIpLoading(true);
  setIpResult(null);
  try {
    const res = await fetch("http://localhost:5000/api/scan/ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });
    const data = await res.json();
    setIpResult(data);
    if(data.status !== 'error') addToHistory('IP', ip, data);
  } catch (err) {
    setIpResult({ status: "error", text: "Server error: Unable to check IP." });
  }
  setIpLoading(false);
};


  // Contact form
  const onSubmitContact = (e) => {
    e.preventDefault();
    setContactStatus({ type: "success", text: "✅ Thank you — we'll reply within 24 hours." });
    e.target.reset();
  };

  // Mobile nav close on route change
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Element SDK stub integration (if present)
  useEffect(() => {
    async function initSdk() {
      if (window.elementSdk && typeof window.elementSdk.init === "function") {
        // Example: inform SDK about editable fields
        window.elementSdk.init({
          defaultConfig: {},
          onConfigChange: (cfg) => {
            // map config to UI, very small safe example
            if (cfg && cfg.site_name) {
              const el = document.getElementById("site-name");
              if (el) el.textContent = cfg.site_name;
            }
          },
        });
      }
    }
    initSdk();
  }, []);

  // Helper: small reusable stat card
  const Stat = ({ number, label }) => (
    <div className="text-center">
      <span className="block text-2xl md:text-3xl font-bold text-indigo-400">{number}</span>
      <span className="block text-xs text-slate-400 mt-1">{label}</span>
    </div>
  );

  // Nav link component
  const NavLink = ({ to, children }) => (
    <button
      onClick={() => setPage(to)}
      className={`text-sm font-medium px-2 py-1 ${
        page === to ? "text-indigo-400" : "text-slate-300 hover:text-indigo-300"
      }`}
    >
      {children}
    </button>
  );

  // Result Card UI Component for all scanners
  const ResultCard = ({ result, title }) => {
    if (!result) return null;
    if (result.status === "error") {
      return <div className="mt-4 bg-slate-800/60 border border-slate-600 rounded-lg p-4 text-sm text-slate-400">{result.text}</div>;
    }
    
    return (
      <div className={`mt-4 rounded-lg p-4 text-sm border ${
        result.status === 'malicious' ? 'bg-red-950/40 border-red-700/50'
        : result.status === 'suspicious' ? 'bg-yellow-950/40 border-yellow-700/50'
        : 'bg-green-950/40 border-green-700/50'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <div className={`font-bold text-base ${
            result.status === 'malicious' ? 'text-red-400'
            : result.status === 'suspicious' ? 'text-yellow-400'
            : 'text-green-400'
          }`}>
            {result.text}
          </div>
          <button 
            onClick={() => exportReport(title, result)}
            className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 transition-colors bg-indigo-900/30 px-2 py-1 rounded"
            title="Download PDF Report"
          >
            📥 Export
          </button>
        </div>
        
        {result.details && result.details.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {result.details.map((d, i) => (
              <li key={i} className="text-slate-300 text-xs flex items-start gap-1.5">
                <span className="opacity-70 mt-0.5">•</span> <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
        
        {result.safe_actions && result.safe_actions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-xs font-semibold text-slate-400 mb-2 tracking-wide uppercase">Recommended Actions</div>
            <ul className="space-y-1.5">
              {result.safe_actions.map((a, i) => (
                <li key={i} className={`text-xs flex items-start gap-1.5 ${
                  result.status === 'malicious' ? 'text-red-200'
                  : result.status === 'suspicious' ? 'text-yellow-200'
                  : 'text-green-200'
                }`}>
                  <span className="opacity-70 mt-0.5">→</span> <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-b from-[#0a0e1a] to-[#071029] text-slate-100' : 'bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800'}`}>
      {/* Helmet: SEO + AdSense */}
      <Helmet>
        <title>AI Cyber Assistant — AI-powered threat intelligence</title>
        <meta name="description" content="AI Cyber Assistant — scan URLs, files, emails and IPs quickly with AI-backed threat intelligence." />
        <meta name="keywords" content="AI cybersecurity, malware scanner, URL analyzer, phishing detector, IP reputation" />
        <meta name="author" content="AI Cyber Assistant" />
        <meta property="og:title" content="AI Cyber Assistant" />
        <meta property="og:description" content="Protect your digital assets with AI-powered security tools." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* AdSense: replace ca-pub-XXXXXXXXXXXXXXX with your publisher ID */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXX" crossOrigin="anonymous"></script>
      </Helmet>

      {/* NAVBAR */}
      <header
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors ${theme === 'dark' ? 'bg-[rgba(10,14,26,0.88)] border-slate-800' : 'bg-white/80 border-slate-200'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage("home");
                }}
                className={`flex items-center gap-3 no-underline ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)",
                  }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                >
                  <IconShield />
                </div>
                <span id="site-name" className="font-semibold text-lg">
                  AI Cyber Assistant
                </span>
              </a>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="home">Home</NavLink>
              <NavLink to="dashboard">Dashboard</NavLink>
              <NavLink to="how-to-use">How to Use</NavLink>
              <NavLink to="blog">Blog</NavLink>
              <NavLink to="about">About</NavLink>
              <NavLink to="contact">Contact</NavLink>
              <NavLink to="privacy">Privacy Policy</NavLink>
<NavLink to="disclaimer">Disclaimer</NavLink>





              
              <button
                onClick={() => setPage("dashboard")}
                className="ml-4 inline-flex items-center gap-2 px-3 py-1 rounded-md"
                style={{
                  background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)",
                  color: "#071029",
                  fontWeight: 600,
                }}
              >
                Start Scanning
              </button>
            </nav>

            {/* Mobile button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileOpen((s) => !s)}
                className="text-xl p-2"
                aria-label="Toggle menu"
              >
                {mobileOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[rgba(10,14,26,0.95)]">
            <div className="px-4 py-3 flex flex-col gap-2">
              <button onClick={() => setPage("home")} className="text-left">Home</button>
              <button onClick={() => setPage("dashboard")} className="text-left">Dashboard</button>
              <button onClick={() => setPage("how-to-use")} className="text-left">How to Use</button>
              <button onClick={() => setPage("blog")} className="text-left">Blog</button>
              <button onClick={() => setPage("about")} className="text-left">About</button>
              <button onClick={() => setPage("contact")} className="text-left">Contact</button>
            </div>
          </div>
        )}
      </header>

      {/* PAGE INNER - space for fixed header */}
      <div className="pt-20 pb-12">
        {/* HOME */}
        {page === "home" && (
          <main id="home-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* HERO */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pt-6">
              <div className="space-y-6">
                <div className="inline-flex items-center bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.18)] rounded-full px-4 py-1 text-sm text-indigo-200 w-max">
                  <span>🛡️</span>
                  <span className="ml-2">AI-Powered Threat Intelligence</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-transparent"
                    style={{
                      background: "linear-gradient(135deg,#ffffff 0%, #a5b4fc 100%)",
                      WebkitBackgroundClip: "text",
                    }}>
                  Protect Your Digital Assets with AI-Powered Security
                </h1>

                <p className="text-slate-400 max-w-xl">
                  Advanced threat detection and analysis powered by artificial intelligence. Scan URLs, files, emails, and IPs with real-time intelligence from VirusTotal, OTX, AbuseIPDB, and Google Safe Browsing.
                </p>

                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => setPage("dashboard")}
                    className="px-6 py-3 rounded-lg font-semibold"
                    style={{
                      background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)",
                      color: "#fff",
                    }}
                  >
                    Start Free Scan
                  </button>

                  <button
                    onClick={() => setPage("how-to-use")}
                    className="px-6 py-3 rounded-lg border border-white/10 text-slate-200"
                  >
                    Learn More
                  </button>
                </div>
              </div>

              <div>
                <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="bg-[rgba(10,14,26,0.8)] rounded-lg p-4 mb-4">
                    <input
                      ref={demoInputRef}
                      placeholder="Enter URL, IP, or domain to scan..."
                      className="w-full px-4 py-3 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10 text-white"
                    />
                    <div className="mt-3">
                      <button
                        onClick={startDemoScan}
                        className="w-full py-3 rounded-md font-semibold"
                        style={{
                          background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)",
                        }}
                      >
                        🔍 Scan Now
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Stat number="50K+" label="Scans Daily" />
                    <Stat number="99.9%" label="Accuracy" />
                    <Stat number="<2s" label="Avg Response" />
                  </div>
                </div>
              </div>
            </section>

            {/* FEATURES */}
            <section className="pt-8">
              <div className="text-center mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.18)] text-indigo-200">Features</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4">Comprehensive Security Analysis</h2>
                <p className="text-slate-400 max-w-2xl mx-auto mt-2">Everything you need to protect against cyber threats</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: "⚡", title: "Lightning Fast Scans", desc: "Get results in under 2 seconds with optimized scanning and cached threat intelligence." },
                  { icon: "🤖", title: "AI-Powered Analysis", desc: "Clear, actionable insights and remediation steps from ML models." },
                  { icon: "🏢", title: "Enterprise Intelligence", desc: "VirusTotal, OTX, AbuseIPDB and Google Safe Browsing aggregated." },
                  { icon: "🔒", title: "Privacy First", desc: "Scans are ephemeral and anonymized to protect your data." },
                  { icon: "👥", title: "Team Collaboration", desc: "Share reports and collaborate with role-based permissions." },
                  { icon: "📊", title: "Detailed Reports", desc: "Export PDF reports with risk scores and actions." },
                ].map((f, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6 hover:-translate-y-2 transition">
                    <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
                         style={{ background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)" }}>
                      <span className="text-xl">{f.icon}</span>
                    </div>
                    <h3 className="font-semibold text-white">{f.title}</h3>
                    <p className="text-slate-400 mt-2 text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* PAGES / CARDS */}
            <section className="pt-12 bg-[rgba(255,255,255,0.02)] rounded-2xl p-8">
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.18)] text-indigo-200">Explore</span>
                <h2 className="text-3xl font-bold mt-4">Discover All Features</h2>
                <p className="text-slate-400 max-w-2xl mx-auto mt-2">Navigate through our comprehensive security platform</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {[
                  { icon: "🎯", title: "Dashboard", desc: "Access all scanning tools and AI assistant", page: "dashboard" },
                  { icon: "📖", title: "How to Use", desc: "Step-by-step tutorials", page: "how-to-use" },
                  { icon: "📝", title: "Security Blog", desc: "Insights on threats and best practices", page: "blog" },
                  { icon: "ℹ️", title: "About Us", desc: "Learn about our mission", page: "about" },
                  { icon: "🔐", title: "Privacy Policy", desc: "How we handle your data", page: "privacy" },
                  { icon: "⚠️", title: "Disclaimer", desc: "Terms & legal", page: "disclaimer" },
                ].map((p, i) => (
                  <button key={i} onClick={() => setPage(p.page)} className="text-left bg-[rgba(10,14,26,0.8)] border border-white/10 rounded-lg p-5 hover:-translate-y-1 transition">
                    <div className="text-2xl mb-2">{p.icon}</div>
                    <h4 className="font-semibold text-white">{p.title}</h4>
                    <p className="text-slate-400 text-sm mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="pt-12">
              <div className="bg-[linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))] border border-white/10 rounded-2xl p-10 text-center relative overflow-hidden">
                <h3 className="text-2xl md:text-3xl font-bold">Ready to Secure Your Digital Assets?</h3>
                <p className="text-slate-400 mt-3 max-w-2xl mx-auto">Start scanning URLs, files, and IPs today. Get instant threat intelligence powered by AI.</p>
                <div className="mt-6 flex justify-center gap-4">
                  <button onClick={() => setPage("dashboard")} className="px-6 py-3 rounded-md font-semibold" style={{ background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)" }}>Start Free Scan</button>
                  <button onClick={() => setPage("how-to-use")} className="px-6 py-3 rounded-md border border-white/10">View Documentation</button>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <main id="dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="pt-6">
              <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
              <p className="text-slate-400 mt-1">Comprehensive threat analysis tools powered by AI</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                {/* URL Scanner */}
                <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">🔗 URL Scanner</h3>
                      <p className="text-slate-400 text-sm mt-1">Analyze URLs for phishing, malware, and suspicious activity</p>
                    </div>
                    <div>
                      <button onClick={() => { setUrlInput(""); setUrlResult(null); }} className="text-xs text-slate-400">Clear</button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10 text-white"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => handleScanURL()} className="px-4 py-2 rounded-md" style={{ background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)" }}>
                        {urlLoading ? "Scanning..." : "Scan URL"}
                      </button>
                      <button onClick={() => { setUrlInput("http://example.com/malicious"); handleScanURL("http://example.com/malicious"); }} className="px-4 py-2 rounded-md border border-white/10">Demo Malicious</button>
                    </div>

                    <ResultCard result={urlResult} title="URL" />
                  </div>
                </div>

                {/* Chat / Assistant placeholder */}
                <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                  <h3 className="font-semibold text-white">💬 AI Assistant</h3>
                  <p className="text-slate-400 text-sm mt-2">Ask the assistant about results, remediation steps, or next actions.</p>
                  <AssistantWidget context={{ url: urlResult, file: fileResult, email: emailResult, ip: ipResult }} />
                </div>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">


                <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-4">
                  <h4 className="font-semibold text-white">Recent Scans</h4>
                  {recentScans.length === 0 ? (
                    <p className="text-slate-400 text-sm mt-2">No recent scans yet — run a quick URL analysis to try it out.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {recentScans.map((scan, idx) => (
                        <li key={idx} className="bg-[rgba(10,14,26,0.5)] border border-white/5 rounded p-2 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-indigo-300">{scan.type}</span>
                            <span className="text-slate-500 text-[10px]">{scan.time}</span>
                          </div>
                          <div className="truncate text-slate-300" title={scan.target}>{scan.target}</div>
                          <div className={`mt-1 font-medium ${
                            scan.result.status === 'malicious' ? 'text-red-400'
                            : scan.result.status === 'suspicious' ? 'text-yellow-400'
                            : 'text-green-400'
                          }`}>
                            {scan.result.status === 'malicious' ? '🔴 Malicious'
                             : scan.result.status === 'suspicious' ? '🟡 Suspicious'
                             : '✅ Safe'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-4">
                  <h4 className="font-semibold">Security Tips</h4>
                  <ul className="text-slate-400 text-sm mt-2 list-disc list-inside space-y-1">
                    <li>Never upload sensitive documents unless necessary.</li>
                    <li>Verify critical findings manually for important systems.</li>
                    <li>Use exported reports in incident response workflows.</li>
                  </ul>
                </div>
              </aside>
            </div>

            {/* Tools grid below: File, Email, IP */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* File Scanner */}
              <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                <h4 className="font-semibold text-white">📁 File Scanner</h4>
                <p className="text-slate-400 text-sm mt-1">Upload and scan files for viruses and malware</p>
                <div className="mt-3">
                  <input
                    type="file"
                    onChange={(e) => { const f = e.target.files?.[0]; setFile(f ?? null); }}
                    className="w-full"
                  />
                  <div className="mt-3">
                    <button onClick={() => handleScanFile(file)} className="px-4 py-2 rounded-md" style={{ background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)" }}>
                      {fileLoading ? "Scanning..." : "Scan File"}
                    </button>
                  </div>
                  {fileResult && <ResultCard result={fileResult} title="File" />}
                </div>
              </div>

              {/* Email & SMS Analyzer */}
              <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                <h4 className="font-semibold text-white">📧 Email & SMS Analyzer</h4>
                <p className="text-slate-400 text-sm mt-1">Analyze a received email or SMS to understand if it's safe.</p>
                <div className="mt-3 space-y-2">
                  <input type="text" value={emailSubject} onChange={(e)=>setEmailSubject(e.target.value)} placeholder="Subject (Optional)" className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10 text-white" />
                  <textarea value={emailBody} onChange={(e)=>setEmailBody(e.target.value)} placeholder="Email or SMS body..." className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10 text-white min-h-[100px]" />
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleScanEmail} className="px-4 py-2 rounded-md flex-1" style={{ background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)" }}>
                      {emailLoading ? "Analyzing..." : "Analyze Email"}
                    </button>
                    <button onClick={handleClearEmail} className="px-4 py-2 rounded-md border border-white/20 hover:bg-white/5 transition-colors">
                      Clear
                    </button>
                  </div>
                  {emailResult && <ResultCard result={emailResult} title="Email" />}
                </div>
              </div>

              {/* IP Checker */}
              <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                <h4 className="font-semibold text-white">🌐 IP Checker</h4>
                <p className="text-slate-400 text-sm mt-1">Investigate IP addresses for malicious activity</p>
                <div className="mt-3">
                  <input type="text" value={ipInput} onChange={(e)=>setIpInput(e.target.value)} placeholder="192.168.1.1" className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10 text-white" />
                  <div className="mt-3">
                    <button onClick={() => handleScanIP()} className="px-4 py-2 rounded-md" style={{ background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)" }}>
                      {ipLoading ? "Checking..." : "Check IP"}
                    </button>
                  </div>
                  {ipResult && <ResultCard result={ipResult} title="IP" />}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* HOW TO USE */}
        {page === "how-to-use" && (
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-cyan-400">How to Use AI Cyber Assistant</h1>
              <p className="text-slate-400">Complete guide to protecting your digital assets</p>

              <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                <h2 className="font-semibold">1. URL Scanning</h2>
                <ol className="list-decimal list-inside text-slate-300 mt-2 space-y-1">
                  <li>Navigate to the Dashboard</li>
                  <li>Enter the URL into the URL Scanner</li>
                  <li>Click "Scan URL" to initiate analysis</li>
                  <li>Review the AI-generated threat report</li>
                </ol>
              </div>

              <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                <h2 className="font-semibold">2. File Analysis</h2>
                <ol className="list-decimal list-inside text-slate-300 mt-2 space-y-1">
                  <li>Go to File Scanner in Dashboard</li>
                  <li>Upload your file (max 50MB)</li>
                  <li>Wait for the scan to complete</li>
                  <li>Download the detailed PDF report</li>
                </ol>
              </div>

              <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                <h2 className="font-semibold">3. Email Header Analysis</h2>
                <p className="text-slate-300 mt-2">Copy paste email headers into the Email Analyzer and review sender reputation and authentication results.</p>
              </div>

              <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                <h2 className="font-semibold">4. IP Address Investigation</h2>
                <p className="text-slate-300 mt-2">Enter the IP address in the IP Checker to view geolocation and threat intelligence.</p>
              </div>

              <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6">
                <h2 className="font-semibold">Best Practices</h2>
                <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1">
                  <li>Never share sensitive credentials in scans.</li>
                  <li>Verify critical findings manually.</li>
                  <li>Use exported reports for incident response.</li>
                </ul>
              </div>
            </div>
          </main>
        )}

        {/* BLOG */}
        {page === "blog" && (
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-cyan-400">Cybersecurity Blog</h1>
            <p className="text-slate-400 mt-2">Latest insights and best practices</p>

            <div className="grid gap-6 md:grid-cols-2 mt-6">
              {[
                { date: "December 15, 2024", title: "Understanding Phishing Attacks in 2024", excerpt: "Identify and protect against sophisticated phishing campaigns." },
                { date: "December 12, 2024", title: "Malware Detection: AI vs Traditional Methods", excerpt: "How AI improves detection and response." },
                { date: "December 10, 2024", title: "Best Practices for Email Security", excerpt: "Tips to protect from email-based threats." },
                { date: "December 8, 2024", title: "IP Reputation: What You Need to Know", excerpt: "How reputation impacts your network security." },
                { date: "December 5, 2024", title: "Zero-Day Vulnerabilities Explained", excerpt: "What zero-days are and how to prepare." },
                { date: "December 1, 2024", title: "The Future of AI in Cybersecurity", excerpt: "AI shaping the next generation of security tools." },
              ].map((b, i) => (
                <article key={i} className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl overflow-hidden">
                  <div className="h-44 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-4xl">📰</div>
                  <div className="p-6">
                    <div className="text-xs text-slate-400">{b.date}</div>
                    <h3 className="font-semibold text-white mt-2">{b.title}</h3>
                    <p className="text-slate-400 mt-2 text-sm">{b.excerpt}</p>
                    <div className="mt-4">
                      <button onClick={() => alert("Open full post - not implemented")} className="text-indigo-300">Read more →</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>
        )}

        {/* ABOUT */}
        {page === "about" && (
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-cyan-400">About AI Cyber Assistant</h1>
            <p className="text-slate-400 mt-2">Our mission to make cybersecurity accessible to everyone</p>

            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6 mt-6">
              <h2 className="font-semibold">Our Mission</h2>
              <p className="text-slate-300 mt-2">Democratize enterprise-grade threat intelligence for all users.</p>

              <h2 className="font-semibold mt-4">What We Do</h2>
              <p className="text-slate-300 mt-2">Combine multiple threat sources and AI to provide clear, actionable insights.</p>

              <h2 className="font-semibold mt-4">Our Commitment</h2>
              <ul className="list-disc list-inside text-slate-300 mt-2">
                <li>Privacy: scans are ephemeral and anonymized</li>
                <li>Transparency: clear explanations of findings</li>
                <li>Accessibility: free tier for everyone</li>
              </ul>
            </div>
          </main>
        )}

{page === "privacy" && <PrivacyPolicy />}
{page === "disclaimer" && <Disclaimer />}
        {/* CONTACT */}
        {page === "contact" && (
          <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-cyan-400">Contact Us</h1>
            <p className="text-slate-400 mt-2">Have questions or feedback? Fill the form below.</p>

            <form id="contactForm" onSubmit={onSubmitContact} className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-xl p-6 mt-6 space-y-4">
              <div>
                <label className="block text-sm text-white mb-1">Your Name *</label>
                <input required className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Email *</label>
                <input type="email" required className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10" />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Message *</label>
                <textarea required className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10 min-h-[120px]" />
              </div>
              <div>
                <button type="submit" className="w-full py-3 rounded-md font-semibold" style={{ background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)" }}>Send Message</button>
              </div>

              {contactStatus && (
                <div className={`p-3 rounded-md ${contactStatus.type === "success" ? "bg-green-900/50 border border-green-700 text-green-300" : "bg-red-900/50 border border-red-700 text-red-300"}`}>
                  {contactStatus.text}
                </div>
              )}
            </form>
            

            <div className="mt-8 text-slate-400">
              <h3 className="font-semibold">Other Ways to Reach Us</h3>
              <p>Email: contact@aicyberassistant.com</p>
              <p>Support: support@aicyberassistant.com</p>
              <p>Business: business@aicyberassistant.com</p>
            </div>
          </main>
        )}

        {/* FOOTER */}
        <footer className="mt-16 border-t border-white/10 bg-[rgba(10,14,26,0.95)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)" }} className="w-10 h-10 rounded-lg flex items-center justify-center">🛡️</div>
                  <div>
                    <div className="font-semibold text-white">AI Cyber Assistant</div>
                    <div className="text-slate-400 text-sm">Advanced threat intelligence platform powered by AI.</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Product</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><button onClick={() => setPage("dashboard")}>Dashboard</button></li>
                  <li><button onClick={() => setPage("how-to-use")}>How to Use</button></li>
                  <li><button onClick={() => setPage("blog")}>Blog</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Company</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><button onClick={() => setPage("about")}>About</button></li>
                  <li><button onClick={() => setPage("contact")}>Contact</button></li>
                  <li><button onClick={() => setPage("privacy")}>Privacy Policy</button></li>
                  <li><button onClick={() => setPage("disclaimer")}>Disclaimer</button></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
              <div className="text-slate-500 text-sm">© {new Date().getFullYear()} AI Cyber Assistant. All rights reserved.</div>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 flex items-center justify-center rounded-md bg-white/5 text-slate-300">𝕏</a>
                <a href="#" className="w-9 h-9 flex items-center justify-center rounded-md bg-white/5 text-slate-300">in</a>
                <a href="#" className="w-9 h-9 flex items-center justify-center rounded-md bg-white/5 text-slate-300">⚡</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* AssistantWidget: Professional AI Chat with markdown-like formatting */
function AssistantWidget({ context }) {
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = React.useRef(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function formatResponse(text) {
    // Convert markdown-like text to styled JSX
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h3 key={i} className="font-bold text-indigo-300 mt-3 mb-1 text-sm">{line.replace("## ", "")}</h3>;
      if (line.startsWith("### ")) return <h4 key={i} className="font-semibold text-slate-200 mt-2 mb-1 text-xs uppercase tracking-wide">{line.replace("### ", "")}</h4>;
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-white text-xs mt-1">{line.replace(/\*\*/g, "")}</p>;
      if (line.startsWith("- ") || line.startsWith("• ")) return <li key={i} className="text-slate-300 text-xs ml-3 list-disc">{line.replace(/^[-•] /, "")}</li>;
      if (/^\d+\./.test(line)) return <li key={i} className="text-slate-300 text-xs ml-3 list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
      if (line.startsWith("🔴") || line.startsWith("🟡") || line.startsWith("✅") || line.startsWith("⚠️") || line.startsWith("💡") || line.startsWith("🔌") || line.startsWith("⏱️"))
        return <p key={i} className="text-xs mt-1 text-slate-200">{line}</p>;
      if (line.trim() === "") return <div key={i} className="mt-1" />;
      return <p key={i} className="text-slate-300 text-xs mt-1">{line}</p>;
    });
  }

  async function ask(e) {
    if (e) e.preventDefault();
    if (!q.trim() || loading) return;

    const userMsg = q.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setQ("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, context }),
      });
      const data = await res.json();
      const answer = data.answer || "No response received.";
      setMessages(prev => [...prev, { role: "ai", content: answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "⚠️ Could not reach the AI service. Make sure the backend is running on port 5000." }]);
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* Chat history */}
      <div className="bg-[rgba(10,14,26,0.8)] border border-white/10 rounded-lg p-3 min-h-[120px] max-h-[320px] overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-slate-500 text-xs italic">Ask me anything about your scan results, threats, or security best practices...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">🤖</div>
            )}
            <div className={`rounded-lg px-3 py-2 max-w-[85%] ${
              msg.role === "user"
                ? "bg-indigo-600/30 border border-indigo-500/30 text-white text-xs"
                : "bg-slate-800/60 border border-white/10"
            }`}>
              {msg.role === "user"
                ? <span className="text-xs">{msg.content}</span>
                : <div className="text-xs leading-relaxed">{formatResponse(msg.content)}</div>
              }
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs ml-2 flex-shrink-0 mt-1">👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs mr-2">🤖</div>
            <div className="bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={ask} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask about threats, remediation steps, or security tips..."
          className="flex-1 px-3 py-2 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !q.trim()}
          className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#6366f1 0%, #8b5cf6 100%)" }}
        >
          {loading ? "⏳" : "Ask"}
        </button>
      </form>
    </div>
  );
}
