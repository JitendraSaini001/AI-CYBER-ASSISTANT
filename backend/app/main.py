import os, requests
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List, Dict

# Load env vars
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found in .env")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

app = FastAPI(title="AI Cyber Assistant Backend")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class Query(BaseModel):
    question: str

class URLRequest(BaseModel):
    url: str

class SMSRequest(BaseModel):
    message: str

class EmailRequest(BaseModel):
    subject: str
    body: str

# In-memory history
history: List[Dict] = []

# Call Groq API
def call_groq(prompt: str, max_tokens: int = 400):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a helpful cybersecurity assistant. Keep answers short, clear, and well-formatted."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
    }

    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=data, timeout=10)
        resp.raise_for_status()
        out = resp.json()
        return out["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"⚠️ Error: {str(e)}"


@app.get("/")
def root():
    return {"message": "✅ AI Cyber Assistant Backend running"}


@app.post("/ask")
def ask_ai(q: Query):
    ans = call_groq(q.question)
    history.append({"type": "QnA", "question": q.question, "answer": ans})
    return {"answer": ans}


@app.post("/analyze/url")
def analyze_url(r: URLRequest):
    prompt = f"Analyze this URL for phishing, spoofing, or malicious intent. Give a short verdict and 3 safe actions:\n\n{r.url}"
    result = call_groq(prompt, max_tokens=220)
    history.append({"type": "URL", "url": r.url, "result": result})
    return {"result": result}


@app.post("/analyze/sms")
def analyze_sms(r: SMSRequest):
    prompt = f"Analyze this SMS for phishing/scam risk. Provide risk level and 3 safety steps:\n\n{r.message}"
    result = call_groq(prompt, max_tokens=220)
    history.append({"type": "SMS", "message": r.message, "result": result})
    return {"result": result}


@app.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".docx", ".txt")):
        return {"result": "⚠️ Error: Unsupported file type. Use PDF, DOCX, or TXT"}
    content = await file.read()
    prompt = f"Analyze this file content for suspicious patterns (malware, phishing, fake invoices). Give a risk level and 3 actions."
    result = call_groq(prompt)
    history.append({"type": "File", "filename": file.filename, "result": result})
    return {"filename": file.filename, "result": result}


@app.post("/analyze/email")
def analyze_email(r: EmailRequest):
    prompt = f"Analyze this email for phishing or scam risk.\n\nSubject: {r.subject}\nBody: {r.body}"
    result = call_groq(prompt)
    history.append({"type": "Email", "subject": r.subject, "result": result})
    return {"subject": r.subject, "result": result}


@app.get("/threat-feed")
def threat_feed():
    # Mock threat feed
    feed = [
        {"title": "New phishing site targeting banks", "risk": "High"},
        {"title": "Suspicious SMS campaign detected", "risk": "Medium"},
        {"title": "Fake invoice PDF circulating", "risk": "High"},
        {"title": "Safe cybersecurity newsletter", "risk": "Low"},
    ]
    return {"feed": feed}


@app.get("/history")
def get_history():
    return {"history": history}
