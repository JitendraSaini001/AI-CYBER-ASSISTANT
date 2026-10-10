import requests
import base64
import os
from dotenv import load_dotenv
load_dotenv()

VT_API_KEY = os.getenv("VT_API_KEY","").strip()
OTX_API_KEY = os.getenv("OTX_API_KEY","").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY","").strip()
ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY","").strip()

print("=" * 50)
print("TEST 1: VirusTotal URL Scan")
print("=" * 50)
try:
    url = "https://www.google.com/"
    url_id = base64.urlsafe_b64encode(url.encode()).decode().rstrip("=")
    r = requests.get(
        f"https://www.virustotal.com/api/v3/urls/{url_id}",
        headers={"x-apikey": VT_API_KEY}, timeout=10
    )
    d = r.json()
    stats = d.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
    print(f"  Status: {r.status_code}")
    print(f"  Malicious: {stats.get('malicious', 0)}")
    print(f"  Harmless: {stats.get('harmless', 0)}")
    print("  RESULT: PASS ✓" if r.status_code == 200 else f"  RESULT: FAIL ✗ ({r.status_code})")
except Exception as e:
    print(f"  RESULT: FAIL ✗ - {e}")

print()
print("=" * 50)
print("TEST 2: VirusTotal File Hash Lookup")
print("=" * 50)
try:
    # EICAR test hash (known test malware hash)
    test_hash = "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f"
    r = requests.get(
        f"https://www.virustotal.com/api/v3/files/{test_hash}",
        headers={"x-apikey": VT_API_KEY}, timeout=10
    )
    print(f"  Status: {r.status_code}")
    if r.status_code == 200:
        stats = r.json().get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
        print(f"  Malicious detections: {stats.get('malicious', 0)}")
        print("  RESULT: PASS ✓")
    else:
        print(f"  RESULT: FAIL ✗ ({r.status_code})")
except Exception as e:
    print(f"  RESULT: FAIL ✗ - {e}")

print()
print("=" * 50)
print("TEST 3: OTX AlienVault Domain Check")
print("=" * 50)
try:
    r = requests.get(
        "https://otx.alienvault.com/api/v1/indicators/domain/malware.com/general",
        headers={"X-OTX-API-KEY": OTX_API_KEY}, timeout=10
    )
    d = r.json()
    pulse = d.get("pulse_info", {}).get("count", "N/A")
    print(f"  Status: {r.status_code}")
    print(f"  Pulse count for malware.com: {pulse}")
    print("  RESULT: PASS ✓" if r.status_code == 200 else f"  RESULT: FAIL ✗")
except Exception as e:
    print(f"  RESULT: FAIL ✗ - {e}")

print()
print("=" * 50)
print("TEST 4: Groq AI Chat")
print("=" * 50)
try:
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
        json={
            "model": "openai/gpt-oss-20b",
            "messages": [{"role": "user", "content": "Reply with exactly: AI_OK"}],
            "max_tokens": 20
        },
        timeout=30
    )
    d = r.json()
    content = d.get("choices", [{}])[0].get("message", {}).get("content", "")
    print(f"  Status: {r.status_code}")
    print(f"  AI Response: {content}")
    print("  RESULT: PASS ✓" if r.status_code == 200 else f"  RESULT: FAIL ✗")
except Exception as e:
    print(f"  RESULT: FAIL ✗ - {e}")

print()
print("=" * 50)
print("TEST 5: AbuseIPDB IP Check")
print("=" * 50)
if not ABUSEIPDB_API_KEY:
    print("  RESULT: SKIP - ABUSEIPDB_API_KEY not in .env")
else:
    try:
        r = requests.get(
            "https://api.abuseipdb.com/api/v2/check",
            headers={"Key": ABUSEIPDB_API_KEY, "Accept": "application/json"},
            params={"ipAddress": "8.8.8.8", "maxAgeInDays": 90},
            timeout=10
        )
        print(f"  Status: {r.status_code}")
        print("  RESULT: PASS ✓" if r.status_code == 200 else f"  RESULT: FAIL ✗")
    except Exception as e:
        print(f"  RESULT: FAIL ✗ - {e}")

print()
print("=" * 50)
print("TEST 6: Flask Backend /status endpoint")
print("=" * 50)
try:
    r = requests.get("http://localhost:5000/status", timeout=5)
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    print("  RESULT: PASS ✓" if r.status_code == 200 else f"  RESULT: FAIL ✗")
except Exception as e:
    print(f"  RESULT: FAIL ✗ - Backend not running: {e}")

print()
print("=" * 50)
print("TEST 7: Backend /api/scan/url endpoint")
print("=" * 50)
try:
    r = requests.post(
        "http://localhost:5000/api/scan/url",
        json={"url": "https://www.google.com/"},
        timeout=20
    )
    d = r.json()
    print(f"  Status: {r.status_code}")
    print(f"  Verdict: {d.get('status')}")
    print(f"  Text: {d.get('text', '')[:80]}")
    print("  RESULT: PASS ✓" if r.status_code == 200 else f"  RESULT: FAIL ✗")
except Exception as e:
    print(f"  RESULT: FAIL ✗ - {e}")

print()
print("=" * 50)
print("TEST 8: Backend /api/assistant endpoint")
print("=" * 50)
try:
    r = requests.post(
        "http://localhost:5000/api/assistant",
        json={"query": "Is google.com safe?"},
        timeout=60
    )
    d = r.json()
    print(f"  Status: {r.status_code}")
    answer = d.get("answer", "")
    print(f"  Answer preview: {answer[:100]}")
    print("  RESULT: PASS ✓" if r.status_code == 200 and answer else f"  RESULT: FAIL ✗")
except Exception as e:
    print(f"  RESULT: FAIL ✗ - {e}")
