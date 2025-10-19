# AI-CYBER-ASSISTANT
“AI Cybersecurity Assistant — Live threat feed, file, email, URL, and SMS analysis with AI-powered insights”


🧠 AI Cyber Assistant

An AI-powered cybersecurity assistant that analyzes files, URLs, and system data to detect potential threats.
Built using FastAPI (backend) and React/Next.js (frontend), it provides a smart interface for real-time security analysis, automation, and learning assistance.

🚀 Features

🔍 Threat Analysis – Detect malicious patterns in files or code

🌐 URL & IP Analysis – Identify phishing or blacklisted domains

🧾 Log Inspection – Parse and analyze log files for anomalies

🤖 AI Chat Assistant – Interact with an AI trained in cybersecurity topics

🧠 Learning Mode – Helps students or professionals understand attacks and defences

📡 API Based Architecture – Fully RESTful backend with FastAPI

🪪 Secure Environment Handling – Sensitive keys managed via .env file

🏗️ Tech Stack

Backend:

Python 3.11+

FastAPI

Uvicorn

Pydantic

python-dotenv

python-multipart

Frontend:

React / Next.js

Tailwind CSS

Axios (for API calls)


⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/JitendraSaini001/AI-CYBER-ASSISTANT.git
cd AI-CYBER-ASSISTANT/backend

2️⃣ Create & Activate Virtual Environment
python -m venv venv
venv\Scripts\activate    # On Windows
# or
source venv/bin/activate  # On Linux/Mac

3️⃣ Install Dependencies
pip install -r requirements.txt


If requirements.txt isn’t available yet:

pip install fastapi uvicorn pydantic python-dotenv python-multipart

4️⃣ Create .env File

In the backend/ folder, create a .env file (not committed to GitHub):

GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

5️⃣ Run Backend Server
uvicorn app.main:app --reload


Server will run on:
👉 http://127.0.0.1:8000

Docs available at:
👉 http://127.0.0.1:8000/docs

🧩 Folder Structure
AI-CYBER-ASSISTANT/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── utils/
│   │   └── models/
│   ├── .env               # Not committed
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

Upload a suspicious file via /analyze/file endpoint or UI.

2️⃣ Ask AI Assistant

Use the chat interface to ask:

“Explain how SQL Injection works and how to prevent it.”

3️⃣ Real-Time Logs

Monitor logs and system reports for anomalies.

🔒 Security Notes

Never commit your .env file or API keys to GitHub.

.gitignore already includes .env for protection.

Rotate keys if leaked.

💡 Future Enhancements

🔐 Integration with VirusTotal or Hybrid Analysis APIs

🧰 Local threat signature scanning

📊 Dashboard for analysis results

📱 Mobile-friendly responsive UI

👨‍💻 Author

Jitendra Saini

