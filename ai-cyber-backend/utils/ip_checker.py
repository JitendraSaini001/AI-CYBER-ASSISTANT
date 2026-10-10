import requests
import re
from config import ABUSEIPDB_API_KEY, OTX_API_KEY

def analyze_ip(ip):
    # Validate IP format
    if not re.match(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$", ip):
        return {"status": "error", "text": "Invalid IP format."}

    findings = []
    malicious = False

    # 1. AbuseIPDB
    if ABUSEIPDB_API_KEY:
        try:
            headers = {"Key": ABUSEIPDB_API_KEY, "Accept": "application/json"}
            params = {"ipAddress": ip, "maxAgeInDays": 90}
            resp = requests.get("https://api.abuseipdb.com/api/v2/check", headers=headers, params=params, timeout=10)
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                score = data.get("abuseConfidenceScore", 0)
                reports = data.get("totalReports", 0)
                if score > 50:
                    malicious = True
                    findings.append(f"🔴 AbuseIPDB: Confidence Score {score}%. {reports} reports of abuse.")
                elif score > 0:
                    findings.append(f"🟡 AbuseIPDB: Confidence Score {score}%. {reports} reports.")
                else:
                    findings.append("✅ AbuseIPDB: 0% abuse confidence. No recent reports.")
        except Exception:
            pass

    # 2. OTX
    if OTX_API_KEY:
        try:
            headers = {"X-OTX-API-KEY": OTX_API_KEY}
            resp = requests.get(f"https://otx.alienvault.com/api/v1/indicators/IPv4/{ip}/general", headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                pulses = data.get("pulse_info", {}).get("count", 0)
                if pulses > 2:
                    malicious = True
                    findings.append(f"🔴 OTX AlienVault: IP appears in {pulses} threat pulses.")
                elif pulses > 0:
                    findings.append(f"🟡 OTX AlienVault: IP appears in {pulses} threat pulses.")
                else:
                    findings.append("✅ OTX AlienVault: No threat reports found.")
        except Exception:
            pass

    if malicious:
        status = "malicious"
        text = "🔴 HIGH RISK — This IP is flagged for malicious activity."
        actions = ["Block this IP in your firewall immediately.", "Investigate any internal logs for traffic to/from this IP."]
    elif any("🟡" in f for f in findings):
        status = "suspicious"
        text = "🟡 SUSPICIOUS — This IP has some suspicious reports."
        actions = ["Monitor traffic associated with this IP.", "Consider temporarily blocking if anomalous activity is seen."]
    else:
        status = "safe"
        text = "✅ SAFE — This IP appears to be clean."
        actions = ["No immediate action required.", "Continue standard monitoring."]

    return {
        "status": status,
        "text": text,
        "details": findings if findings else ["No intelligence data could be retrieved."],
        "safe_actions": actions,
        "ip": ip
    }
