import os
import hashlib
import requests
from werkzeug.utils import secure_filename
from config import UPLOAD_FOLDER, VT_API_KEY

def get_file_hash(file_path):
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def scan_file(file_storage):
    filename = secure_filename(file_storage.filename)
    if not filename:
        return {"status": "error", "text": "Invalid filename."}
        
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file_storage.save(save_path)

    file_hash = get_file_hash(save_path)
    findings = [f"ℹ️ File Hash (SHA-256): {file_hash}"]
    malicious = False
    suspicious = False

    if VT_API_KEY:
        try:
            headers = {"x-apikey": VT_API_KEY}
            resp = requests.get(f"https://www.virustotal.com/api/v3/files/{file_hash}", headers=headers, timeout=15)
            
            if resp.status_code == 200:
                stats = resp.json().get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                mal_count = stats.get("malicious", 0)
                sus_count = stats.get("suspicious", 0)
                clean_count = stats.get("harmless", 0) + stats.get("undetected", 0)

                if mal_count > 0:
                    malicious = True
                    findings.append(f"🔴 VirusTotal: {mal_count} vendor(s) flagged this file as malware.")
                elif sus_count > 0:
                    suspicious = True
                    findings.append(f"🟡 VirusTotal: {sus_count} vendor(s) flagged this file as suspicious.")
                else:
                    findings.append(f"✅ VirusTotal: {clean_count} vendor(s) found no threats.")
            elif resp.status_code == 404:
                findings.append("ℹ️ VirusTotal: Hash not found in database. File has never been scanned by VT.")
        except Exception:
            findings.append("⚠️ Could not connect to VirusTotal.")
    
    try:
        os.remove(save_path)
    except:
        pass

    if malicious:
        status = "malicious"
        text = "🔴 HIGH RISK — This file contains known malware."
        actions = ["Do NOT execute or open this file.", "Delete it from your system immediately.", "Run a full system antivirus scan."]
    elif suspicious:
        status = "suspicious"
        text = "🟡 SUSPICIOUS — This file exhibits suspicious traits."
        actions = ["Do not open the file unless you completely trust the source.", "Consider scanning it in a sandboxed environment."]
    else:
        status = "safe"
        text = "✅ SAFE — No malicious signatures detected."
        actions = ["File appears clean based on hash reputation.", "Always stay vigilant with email attachments."]

    return {
        "status": status,
        "text": text,
        "details": findings,
        "safe_actions": actions,
        "filename": filename,
        "hash": file_hash
    }
