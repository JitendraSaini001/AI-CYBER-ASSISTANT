# app/main.py
import os
import json
import hashlib
import secrets
import requests
from datetime import datetime
from typing import Optional
from io import BytesIO
import csv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",  # for local frontend testing
    "https://ai-cyber-frontend.vercel.app"  # deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Query as FastAPIQuery
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import logging

# -------------------------
# Logging setup
# -------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-cyber-assistant")

# -------------------------
# Load environment variables
# -------------------------
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found in .env")

VT_API_KEY = os.getenv("VT_API_KEY")            # VirusTotal optional
OTX_API_KEY = os.getenv("OTX_API_KEY")          # AlienVault optional
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")    # Google Safe Browsing optional
ABUSEIPDB_KEY = os.getenv("ABUSEIPDB_KEY")      # AbuseIPDB optional

# -------------------------
# FastAPI app setup
# -------------------------
app = FastAPI(title="AI Cyber Assistant Backend (Enhanced)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Models
# -------------------------
class Query(BaseModel):
    question: str

class URLRequest(BaseModel):
    url: str

class SMSRequest(BaseModel):
    message: str

class EmailRequest(BaseModel):
    subject: str
    body: str

# -------------------------
# Session storage
# -------------------------
SESSION_FILE = "scan_history.json"

def save_session(scan):
    try:
        if os.path.exists(SESSION_FILE):
            with open(SESSION_FILE, "r") as f:
                data = json.load(f)
        else:
            data = []
        data.append(scan)
        with open(SESSION_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error(f"save_session error: {e}")

def load_session():
    try:
        if os.path.exists(SESSION_FILE):
            with open(SESSION_FILE, "r") as f:
                return json.load(f)
        return []
    except Exception as e:
        logger.error(f"load_session error: {e}")
        return []

# -------------------------
# Helper functions
# -------------------------
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
        resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=30)
        resp.raise_for_status()
        out = resp.json()
        if "choices" in out and len(out["choices"]) > 0:
            return out["choices"][0]["message"]["content"].strip()
        return json.dumps(out)[:1000]
    except Exception as e:
        logger.error(f"call_groq error: {e}")
        raise HTTPException(status_code=502, detail=f"Groq API Error: {str(e)}")


def check_virustotal_by_hash(file_hash: str):
    if not VT_API_KEY:
        return None
    url = f"https://www.virustotal.com/api/v3/files/{file_hash}"
    headers = {"x-apikey": VT_API_KEY}
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 200:
            return r.json()
        return {"vt_status_code": r.status_code, "detail": r.text[:400]}
    except Exception as e:
        logger.error(f"check_virustotal_by_hash error: {e}")
        return {"error": str(e)}


def fetch_otx_feed():
    if not OTX_API_KEY:
        return [
            {"title": "New phishing site targeting banks", "risk": "High"},
            {"title": "Suspicious SMS campaign detected", "risk": "Medium"},
            {"title": "Fake invoice PDF circulating", "risk": "High"},
            {"title": "Safe cybersecurity newsletter", "risk": "Low"},
        ]
    try:
        headers = {"X-OTX-API-KEY": OTX_API_KEY}
        r = requests.get("https://otx.alienvault.com/api/v1/pulses", headers=headers, timeout=15)
        if r.status_code == 200:
            items = r.json().get("results", [])[:15]
            feed = []
            for it in items:
                title = it.get("name") or it.get("description") or "OTX Pulse"
                feed.append({"title": title, "risk": "Medium"})
            if feed:
                return feed
        return [{"title": "OTX returned status " + str(r.status_code), "risk": "Low"}]
    except Exception as ex:
        logger.error(f"fetch_otx_feed error: {ex}")
        return [{"title": "Could not fetch OTX feed", "risk": "Low"}]


def google_safe_browsing_check(url_to_check: str):
    if not GOOGLE_API_KEY:
        return None
    api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_API_KEY}"
    body = {
        "client": {"clientId": "ai-cyber-assistant", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE","SOCIAL_ENGINEERING","UNWANTED_SOFTWARE","POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url_to_check}]
        }
    }
    try:
        r = requests.post(api_url, json=body, timeout=12)
        if r.status_code == 200:
            return r.json()
        return {"status_code": r.status_code, "detail": r.text[:500]}
    except Exception as e:
        logger.error(f"google_safe_browsing_check error: {e}")
        return {"error": str(e)}

# -------------------------
# Root endpoint
# -------------------------
@app.get("/")
def root():
    return {"message": "✅ AI Cyber Assistant Backend running (enhanced)"}

# -------------------------
# Ask AI endpoint
# -------------------------
@app.post("/ask")
def ask_ai(q: Query):
    prompt = f"You are a helpful cybersecurity assistant. Answer this question clearly and concisely:\n\n{q.question}"
    ans = call_groq(prompt)
    save_session({"type": "QnA", "question": q.question, "result": ans, "time": str(datetime.now())})
    return {"answer": ans}

# -------------------------
# Analyze URL
# -------------------------
@app.post("/analyze/url")
def analyze_url(r: URLRequest):
    gs = google_safe_browsing_check(r.url)
    if gs and gs.get("matches"):
        result = "High risk (Google Safe Browsing match)"
        save_session({"type": "URL", "url": r.url, "result": result, "time": str(datetime.now())})
        return {"result": result, "google_safe_browsing": gs}
    prompt = f"Analyze this URL for phishing, spoofing, or malicious intent. Give a short verdict and 3 safe actions:\n\n{r.url}"
    result = call_groq(prompt, max_tokens=220)
    save_session({"type": "URL", "url": r.url, "result": result, "time": str(datetime.now())})
    return {"result": result}

# -------------------------
# Analyze SMS
# -------------------------
@app.post("/analyze/sms")
def analyze_sms(r: SMSRequest):
    suspicious_keywords = ["win", "prize", "lottery", "urgent", "free", "password", "verify", "bank", "account"]
    quick_flag = any(k in r.message.lower() for k in suspicious_keywords)
    quick_result = "Suspected scam/urgent phishing. Recommend caution." if quick_flag else None
    prompt = f"Analyze this SMS for phishing/scam risk. Provide risk level and 3 safety steps:\n\n{r.message}"
    result = call_groq(prompt, max_tokens=220)
    combined = quick_result + "\n\n" + result if quick_result else result
    save_session({"type": "SMS", "message": r.message, "result": combined, "time": str(datetime.now())})
    return {"result": combined}

# -------------------------
# Analyze File
# -------------------------
@app.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    allowed_ext = (".pdf", ".docx", ".txt", ".exe", ".zip", ".jpg", ".png", ".xlsx")
    if not file.filename.lower().endswith(allowed_ext):
        raise HTTPException(status_code=400, detail=f"⚠️ Unsupported file type. Allowed: {', '.join(allowed_ext)}")
    content = await file.read()
    sha256_hash = hashlib.sha256(content).hexdigest()
    vt_report = check_virustotal_by_hash(sha256_hash)
    prompt = f"Analyze file named {file.filename} with SHA256 {sha256_hash} for suspicious patterns. Give a risk level and 3 actions."
    groq_result = call_groq(prompt, max_tokens=400)
    save_session({"type": "File", "filename": file.filename, "hash": sha256_hash, "result": groq_result, "time": str(datetime.now())})
    return {
        "filename": file.filename,
        "hash": sha256_hash,
        "virustotal": vt_report,
        "groq_analysis": groq_result,
        "result": groq_result
    }

# -------------------------
# Analyze Email
# -------------------------
@app.post("/analyze/email")
def analyze_email(r: EmailRequest):
    suspicious_keywords = ["paypal", "account locked", "reset password", "click here", "urgent", "wire transfer", "invoice"]
    quick_flag = any(k in (r.subject + " " + r.body).lower() for k in suspicious_keywords)
    quick_note = "Quick flagged: suspicious keywords present." if quick_flag else None
    prompt = f"Analyze this email for phishing or scam risk.\n\nSubject: {r.subject}\nBody: {r.body}"
    result = call_groq(prompt)
    combined = (quick_note + "\n\n" + result) if quick_note else result
    save_session({"type": "Email", "subject": r.subject, "body": r.body, "result": combined, "time": str(datetime.now())})
    return {"subject": r.subject, "result": combined}

# -------------------------
# Threat Feed
# -------------------------
@app.get("/threat-feed")
def threat_feed():
    feed = fetch_otx_feed()
    return {"feed": feed}

# -------------------------
# IP Check
# -------------------------
@app.get("/check/ip/{ip}")
def check_ip(ip: str):
    if ABUSEIPDB_KEY:
        try:
            url = f"https://api.abuseipdb.com/api/v2/check?ipAddress={ip}&maxAgeInDays=90"
            headers = {"Key": ABUSEIPDB_KEY, "Accept": "application/json"}
            r = requests.get(url, headers=headers, timeout=10)
            if r.ok:
                data = r.json().get("data", {})
                score = data.get("abuseConfidenceScore", None)
                return {"ip": ip, "abuseConfidenceScore": score, "raw": data}
            return {"ip": ip, "error": "AbuseIPDB request failed", "status": r.status_code}
        except Exception as e:
            logger.error(f"check_ip error: {e}")
            return {"ip": ip, "error": str(e)}
    return {"ip": ip, "abuseConfidenceScore": 0, "note": "No ABUSEIPDB_KEY configured — running in mock mode"}

# -------------------------
# Darkweb check (simulated)
# -------------------------
@app.get("/darkweb/check")
def darkweb_check(email: str = FastAPIQuery(..., description="Email to check (simulation)")):
    sample_breaches = {
        "leaked@example.com": ["SampleCorp Breach 2020", "AnotherLeak 2019"],
        "compromised@domain.com": ["InvoiceLeaks 2022"]
    }
    found = sample_breaches.get(email.lower())
    if found:
        return {"email": email, "found": True, "breaches": found}
    return {"email": email, "found": False, "note": "No results in local demo dataset. For real checks, integrate HaveIBeenPwned API."}

# -------------------------
# Download scan history as CSV
# -------------------------
@app.get("/report/download")
def download_report():
    session = load_session()
    if not session:
        raise HTTPException(status_code=404, detail="No scan history found")
    output = BytesIO()
    writer = csv.writer(output)
    writer.writerow(["Type","Details","Result","Time"])
    for s in session:
        details = s.get("question") or s.get("url") or s.get("message") or s.get("filename") or s.get("subject","")
        writer.writerow([s.get("type"), details, s.get("result"), s.get("time")])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=scan_history.csv"})
