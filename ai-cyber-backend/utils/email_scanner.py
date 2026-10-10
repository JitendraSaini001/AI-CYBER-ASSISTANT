import requests
import json
from config import OTX_API_KEY, GROQ_API_KEY
from utils.ai_assistant import GROQ_MODEL

def scan_email(subject: str, body: str):
    if not body.strip():
        return {"status": "error", "text": "Message body is empty."}
        
    findings = []
    safe_actions = []
    status = "safe"
    text = ""
    
    # Analyze with LLM if Groq is available
    if GROQ_API_KEY:
        prompt = f"""You are an expert cybersecurity phishing analyst. Analyze the following message (Email/SMS) for phishing, spam, or scams.
        
Subject: {subject}
Body:
{body}

Return a raw JSON object with NO markdown wrapping, containing exactly these keys:
"is_phishing": boolean
"confidence": "high", "medium", or "low"
"findings": list of strings (each a specific reason for suspicion, e.g. "Urgent language used", "Suspicious link to xyz.com")
"actions": list of strings (recommended actions, e.g. "Do not click links", "Verify sender")
"""
        try:
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1
            }
            resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"].get("content", "").strip()
                # strip markdown json block if any
                if content.startswith("```json"):
                    content = content[7:]
                if content.endswith("```"):
                    content = content[:-3]
                
                analysis = json.loads(content)
                if analysis.get("is_phishing"):
                    status = "malicious" if analysis.get("confidence") == "high" else "suspicious"
                    text = f"{'🔴 HIGH RISK' if status == 'malicious' else '🟡 SUSPICIOUS'} — AI detected phishing/scam patterns."
                else:
                    text = "✅ SAFE — No obvious phishing or scam patterns detected by AI."
                
                for f in analysis.get("findings", []):
                    findings.append(f"🤖 AI Finding: {f}")
                for a in analysis.get("actions", []):
                    safe_actions.append(a)
        except Exception as e:
            findings.append("⚠️ AI Analysis failed or timed out.")
            text = "Analysis incomplete."
            
    if not text:
        text = "Analysis incomplete. No AI service configured."
        
    if not findings:
        findings.append("No specific threats identified.")
        
    if not safe_actions:
        safe_actions.append("Always verify the sender before clicking links.")

    return {
        "status": status,
        "text": text,
        "details": findings,
        "safe_actions": safe_actions,
        "email": subject or "Email/SMS"
    }
