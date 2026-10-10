from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# register routes
from routes.scan import scan_bp
app.register_blueprint(scan_bp, url_prefix="/api")

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status":"ok","message":"Server is running"})

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
