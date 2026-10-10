import os

VT_API_KEY = os.getenv("VT_API_KEY", "").strip()
OTX_API_KEY = os.getenv("OTX_API_KEY", "").strip()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY", "").strip()
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
