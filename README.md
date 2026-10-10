# 🛡️ AI Cyber Assistant

> An advanced, AI-powered cybersecurity threat intelligence platform. Analyze URLs, files, emails, IPs, and SMS messages in real-time using multiple threat intelligence APIs and a built-in AI assistant.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11-green)](https://python.org)
[![React](https://img.shields.io/badge/React-19-cyan)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.x-orange)](https://flask.palletsprojects.com)

---

## 🚀 Features

| Scanner | Description |
|--------|-------------|
| 🔗 **URL Scanner** | Scan URLs using VirusTotal, Google Safe Browsing & OTX AlienVault |
| 📁 **File Scanner** | Upload and hash-check files against VirusTotal malware database |
| 📧 **Email & SMS Analyzer** | AI-powered phishing & scam detection from raw email/SMS text |
| 🌐 **IP Checker** | Analyze IP addresses using AbuseIPDB & OTX threat intelligence |
| 💬 **AI Assistant** | Groq-powered conversational AI chatbot for cybersecurity Q&A |
| 📥 **PDF Export** | Download professional scan reports as formatted PDF files |
| 🕓 **Recent Scans** | Live sidebar history of your last 5 scans |
| 🌙 **Dark / Light Mode** | Toggle between dark and light themes instantly |

---

## 🖥️ Tech Stack

**Frontend**
- React 19 (Single-Page Application)
- TailwindCSS (Utility-first styling)
- jsPDF + jspdf-autotable (PDF report generation)
- React Helmet (SEO meta tags)

**Backend**
- Python + Flask (REST API)
- VirusTotal API v3
- Google Safe Browsing API
- OTX AlienVault API
- AbuseIPDB API
- Groq AI API (LLM-powered analysis & chat)

---

## 📂 Project Structure

```
AI-CYBER-ASSISTANT/
├── ai-cyber-backend/
│   ├── app.py                  # Flask app entry point
│   ├── config.py               # API key loader from .env
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Example environment variables
│   ├── routes/
│   │   └── scan.py             # All API route definitions
│   └── utils/
│       ├── url_scanner.py      # URL threat analysis logic
│       ├── file_scanner.py     # File hash + VT lookup
│       ├── email_scanner.py    # AI-powered email/SMS analysis
│       ├── ip_checker.py       # AbuseIPDB + OTX IP analysis
│       └── ai_assistant.py     # Groq LLM chat integration
└── ai-cyber-frontend/
    ├── public/
    └── src/
        ├── App.js              # Main React application
        ├── index.css           # Global styles
        └── pages/
            ├── PrivacyPolicy.js
            └── Disclaimer.js
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/JitendraSaini001/AI-CYBER-ASSISTANT.git
cd AI-CYBER-ASSISTANT
```

### 2. Backend Setup

```bash
cd ai-cyber-backend
python -m venv venv
venv\Scripts\activate       # Windows
# or: source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

Create your `.env` file (copy from example):

```bash
cp .env.example .env
```

Fill in your API keys in `.env`:

```env
VT_API_KEY=your_virustotal_key
GOOGLE_SAFE_BROWSING_KEY=your_google_key
OTX_API_KEY=your_otx_key
ABUSEIPDB_API_KEY=your_abuseipdb_key
GROQ_API_KEY=your_groq_key
```

Start the backend:

```bash
python app.py
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ai-cyber-frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3001`

---

## 🔑 Getting API Keys (All Free Tiers Available)

| API | Sign Up Link | Free Tier |
|-----|-------------|-----------|
| VirusTotal | [virustotal.com](https://www.virustotal.com/gui/join-us) | 500 req/day |
| Google Safe Browsing | [console.cloud.google.com](https://console.cloud.google.com) | Free |
| OTX AlienVault | [otx.alienvault.com](https://otx.alienvault.com) | Free |
| AbuseIPDB | [abuseipdb.com](https://www.abuseipdb.com/register) | 1000 req/day |
| Groq | [console.groq.com](https://console.groq.com) | Free |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scan/url` | Scan a URL for threats |
| `POST` | `/api/scan/file` | Upload and scan a file |
| `POST` | `/api/scan/email` | Analyze email/SMS text |
| `POST` | `/api/scan/ip` | Check an IP address |
| `POST` | `/api/assistant` | Chat with AI assistant |

---

## 📸 Screenshots

> Dashboard with URL Scanner, AI Assistant, Recent Scans sidebar, and File/Email/IP tools all on one page.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📬 Contact

- GitHub: [@JitendraSaini001](https://github.com/JitendraSaini001)
- Email: contact@aicyberassistant.com
