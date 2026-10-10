import validators
import tldextract
import requests
import base64
from config import OTX_API_KEY, VT_API_KEY

# Known suspicious URL patterns
SUSPICIOUS_KEYWORDS = ["login", "verify", "secure", "account", "update", "bank", "paypal", "signin", "confirm", "password", "credential"]
SUSPICIOUS_TLDS = [".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".click", ".pw", ".work", ".loan"]

def scan_url(url: str):
    if not validators.url(url):
        return {"status": "error", "text": "Invalid URL format. Please enter a valid URL (e.g. https://example.com)."}

    # Track severity of findings separately
    malicious_findings = []
    suspicious_findings = []
    info_findings = []

    parsed = tldextract.extract(url)
    domain = f"{parsed.domain}.{parsed.suffix}"

    # --- Heuristic checks ---
    for kw in SUSPICIOUS_KEYWORDS:
        if kw in url.lower() and domain not in ["google.com", "microsoft.com", "apple.com", "amazon.com", "facebook.com"]:
            suspicious_findings.append(f"⚠️ Suspicious keyword found in URL: `{kw}`")

    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            suspicious_findings.append(f"⚠️ Suspicious TLD detected: `{tld}` (commonly used in spam/phishing)")

    if len(url) > 150:
        suspicious_findings.append("⚠️ URL is unusually long — possible obfuscation technique.")

    if url.count(".") > 5:
        suspicious_findings.append("⚠️ Many subdomains detected — possible phishing trick.")

    # --- OTX AlienVault check ---
    if OTX_API_KEY:
        try:
            headers = {"X-OTX-API-KEY": OTX_API_KEY}
            resp = requests.get(
                f"https://otx.alienvault.com/api/v1/indicators/domain/{domain}/general",
                headers=headers, timeout=10
            )
            if resp.status_code == 200:
                data = resp.json()
                pulse_count = data.get("pulse_info", {}).get("count", 0)
                if pulse_count > 5:
                    malicious_findings.append(f"🔴 OTX AlienVault: Domain found in {pulse_count} threat intelligence reports — HIGH RISK.")
                elif pulse_count > 0:
                    suspicious_findings.append(f"🟡 OTX AlienVault: Domain appears in {pulse_count} threat pulse(s).")
                else:
                    info_findings.append("✅ OTX AlienVault: No threat reports found for this domain.")
        except Exception:
            pass  # silently skip on error

    # --- VirusTotal check ---
    vt_flagged = False
    if VT_API_KEY:
        try:
            url_id = base64.urlsafe_b64encode(url.encode()).decode().rstrip("=")
            headers = {"x-apikey": VT_API_KEY}
            vt_resp = requests.get(
                f"https://www.virustotal.com/api/v3/urls/{url_id}",
                headers=headers, timeout=10
            )
            if vt_resp.status_code == 200:
                vt_data = vt_resp.json()
                stats = vt_data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                malicious_count = stats.get("malicious", 0)
                suspicious_count = stats.get("suspicious", 0)
                harmless_count = stats.get("harmless", 0)

                if malicious_count > 0:
                    vt_flagged = True
                    malicious_findings.append(f"🔴 VirusTotal: {malicious_count} security vendor(s) flagged this URL as malicious.")
                elif suspicious_count > 0:
                    suspicious_findings.append(f"🟡 VirusTotal: {suspicious_count} vendor(s) flagged this URL as suspicious.")
                else:
                    info_findings.append(f"✅ VirusTotal: Clean — {harmless_count} vendor(s) confirmed safe, 0 flagged malicious.")
            elif vt_resp.status_code == 404:
                info_findings.append("ℹ️ VirusTotal: URL not previously scanned. No historical data available.")
        except Exception:
            pass

    # --- Determine final verdict ---
    all_findings = malicious_findings + suspicious_findings + info_findings

    if malicious_findings or vt_flagged:
        verdict = "malicious"
        summary = "🔴 THREAT DETECTED — This URL has been flagged as malicious by threat intelligence sources."
    elif suspicious_findings:
        verdict = "suspicious"
        summary = "🟡 SUSPICIOUS — This URL shows suspicious characteristics. Exercise caution."
    else:
        verdict = "safe"
        summary = "✅ SAFE — No threats detected. This URL appears to be safe."

    return {
        "status": verdict,
        "text": summary,
        "url": url,
        "details": all_findings if all_findings else ["No threats detected."],
        "safe_actions": (
            [
                "1️⃣ Do NOT open or click this link.",
                "2️⃣ If already opened, close the tab immediately.",
                "3️⃣ Do NOT enter any credentials, passwords, or personal information.",
                "4️⃣ Run a full antivirus scan on your device.",
                "5️⃣ Report the URL as phishing/malware to your browser.",
                "6️⃣ If you entered credentials, change them immediately."
            ]
            if verdict == "malicious" else
            [
                "1️⃣ Proceed with extreme caution.",
                "2️⃣ Verify the website's legitimacy through official channels.",
                "3️⃣ Do NOT provide sensitive information.",
                "4️⃣ Check the URL carefully for misspellings."
            ]
            if verdict == "suspicious" else
            [
                "✅ URL appears safe to visit.",
                "💡 Always check for HTTPS (padlock icon) in your browser.",
                "💡 Never share passwords even on trusted sites.",
            ]
        )
    }
