import requests
import json
from config import GROQ_API_KEY

GROQ_MODEL = "openai/gpt-oss-20b"

def answer_with_ai(query, context=None):
    if not GROQ_API_KEY:
        return "⚠️ AI service is not configured. Please add a GROQ_API_KEY to your .env file."

    context_section = ""
    if context and isinstance(context, dict):
        context_section = f"\n\n**Scan Context:**\n```json\n{json.dumps(context, indent=2)}\n```"

    system_prompt = """You are 'AI Cyber Assistant', a helpful, friendly, and expert cybersecurity assistant built into this dashboard.
Your job is to chat with the user, answer their cybersecurity questions, and help them understand their scan results (URLs, Files, IPs, Emails).

Rules for your responses:
1. **Be conversational and natural**: If the user says "hi" or asks about you, reply normally like a friendly chatbot. Don't force heavy formatting on casual chat.
2. **Scan Results**: IF the user is asking about a specific scan result (context provided below), THEN you should be highly structured:
   - Use markdown headers, bullet points, and bold text.
   - If SAFE: confirm it's safe and give general best practices.
   - If SUSPICIOUS/MALICIOUS: give clear, numbered steps the user MUST take to stay safe (e.g., "1. Do not click the link.").
3. **Identity**: You are the AI Cyber Assistant. You can analyze URLs, files, emails, and IPs using real threat intelligence APIs integrated into this app.
4. Keep answers concise and avoid robotic repetitions."""

    user_message = f"{query}{context_section}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": 800,
        "temperature": 0.3
    }

    try:
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"].get("content", "")
        # Also check reasoning field (some models put answer there)
        if not content.strip():
            content = data["choices"][0]["message"].get("reasoning", "No response generated.")
        return content
    except requests.exceptions.Timeout:
        return "⏱️ The AI service took too long to respond. Please try again."
    except requests.exceptions.ConnectionError:
        return "🔌 Could not connect to the AI service. Please check your internet connection and try again."
    except Exception as e:
        return f"⚠️ AI service error: {str(e)}"
