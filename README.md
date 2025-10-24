<h1 align="center">🧠 AI Cyber Assistant – Intelligent Threat Detection & Analysis ⚡</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI-blue?style=for-the-badge&logo=python&logoColor=white">
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Next.js-orange?style=for-the-badge&logo=react&logoColor=white">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=github">
</p>

<p align="center">
  🚀 Live threat feed • File / URL / Email / SMS analysis • AI-powered insights  
</p>

---

## 🧩 Overview

**AI Cybersecurity Assistant** is an intelligent security analysis platform built using **FastAPI** (backend) and **React/Next.js** (frontend).  
It provides **real-time threat detection**, **automated analysis**, and an **AI assistant** for learning cybersecurity concepts.

> “AI Cybersecurity Assistant — Live threat feed, file, email, URL, and SMS analysis with AI-powered insights.”

---

## 🚀 Features

- 🔍 **Threat Analysis** – Detect malicious patterns in files or code  
- 🌐 **URL & IP Analysis** – Identify phishing or blacklisted domains  
- 🧾 **Log Inspection** – Parse and analyze system logs for anomalies  
- 🤖 **AI Chat Assistant** – Get expert cybersecurity explanations & solutions  
- 🧠 **Learning Mode** – Helps students/professionals understand attacks & defences  
- 📡 **API Based Architecture** – RESTful FastAPI backend for scalable use  
- 🪪 **Secure Environment Handling** – Sensitive keys managed via `.env` file  

---

## 🧱 Tech Stack

### 🧠 Backend
- Python 3.11+  
- FastAPI  
- Uvicorn  
- Pydantic  
- python-dotenv  
- python-multipart  

### 💻 Frontend
- React / Next.js  
- Tailwind CSS  
- Axios (for API calls)  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/JitendraSaini001/AI-CYBER-ASSISTANT.git
cd AI-CYBER-ASSISTANT/backend
2️⃣ Create & Activate Virtual Environment
bash
Copy code
python -m venv venv
venv\Scripts\activate   # On Windows
# or
source venv/bin/activate   # On Linux/Mac
3️⃣ Install Dependencies
bash
Copy code
pip install -r requirements.txt
If requirements.txt isn’t available yet:

bash
Copy code
pip install fastapi uvicorn pydantic python-dotenv python-multipart
4️⃣ Create .env File
Create a .env file inside the backend/ folder (not committed to GitHub):

ini
Copy code
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
5️⃣ Run Backend Server
bash
Copy code
uvicorn app.main:app --reload
Server will run at 👉 http://127.0.0.1:8000
API docs available at 👉 http://127.0.0.1:8000/docs

🗂️ Folder Structure
pgsql
Copy code
AI-CYBER-ASSISTANT/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── utils/
│   │   └── models/
│   ├── .env                # Not committed
│   ├── .env.example
│   ├── requirements.txt
│   └── venv/
│
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── README.md
🧠 Example Usage
1️⃣ Analyze a File
Upload a suspicious file via /analyze/file endpoint or through the frontend UI.

2️⃣ Ask AI Assistant
Use the chat interface to ask:

“Explain how SQL Injection works and how to prevent it.”

3️⃣ Real-Time Logs
Monitor system logs and detect anomalies as they occur.

🔒 Security Notes
Never commit your .env file or API keys to GitHub.

.gitignore already includes .env for protection.

Rotate your keys immediately if leaked.

💡 Future Enhancements
🔐 Integration with VirusTotal or Hybrid Analysis APIs

🧰 Local threat signature scanning

📊 Interactive dashboard for analysis results

📱 Mobile-friendly responsive UI

🧬 AI model fine-tuning for deeper malware insights

👨‍💻 Author
Jitendra Saini
🚀 Cybersecurity Enthusiast & Developer
🌐 Portfolio: https://jitendra-saini-portfolio.netlify.app/
📧 Email: sainijeetu711@gmail.com

⚡ GitHub Stats
<p align="center"> <img src="https://github-readme-stats.vercel.app/api?username=JitendraSaini001&show_icons=true&theme=radical&hide_border=true" width="48%"> <img src="https://github-readme-streak-stats.herokuapp.com?user=JitendraSaini001&theme=radical&hide_border=true" width="48%"> </p> <p align="center"> <img src="https://github-readme-activity-graph.vercel.app/graph?username=JitendraSaini001&theme=react-dark&hide_border=true"> </p>
<h3 align="center">⭐ If this project inspires you, please give it a star — it keeps me motivated to build more! ⚙️</h3>
