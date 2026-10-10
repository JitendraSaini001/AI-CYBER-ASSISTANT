from flask import Blueprint, request, jsonify
import os

from utils.url_scanner import scan_url
from utils.file_scanner import scan_file
from utils.email_scanner import scan_email
from utils.ip_checker import analyze_ip
from utils.ai_assistant import answer_with_ai

scan_bp = Blueprint("scan", __name__)

@scan_bp.route("/scan/url", methods=["POST"])
def route_url_scan():
    data = request.get_json() or {}
    url = data.get("url")
    if not url:
        return jsonify({"status":"error","message":"No url provided"}), 400
    result = scan_url(url)
    return jsonify(result)

@scan_bp.route("/scan/file", methods=["POST"])
def route_file_scan():
    if "file" not in request.files:
        return jsonify({"status":"error","message":"No file uploaded"}), 400
    f = request.files["file"]
    result = scan_file(f)
    return jsonify(result)

@scan_bp.route("/scan/email", methods=["POST"])
def route_email_scan():
    data = request.get_json() or {}
    subject = data.get("subject", "")
    body = data.get("body", "")
    if not body:
        return jsonify({"status":"error","message":"No email/sms body provided"}), 400
    result = scan_email(subject, body)
    return jsonify(result)

@scan_bp.route("/scan/ip", methods=["POST"])
def route_ip_scan():
    data = request.get_json() or {}
    ip = data.get("ip")
    if not ip:
        return jsonify({"status":"error","message":"No ip provided"}), 400
    result = analyze_ip(ip)
    return jsonify(result)

# AI assistant endpoint: accepts { query: "...", context: {...} }
@scan_bp.route("/assistant", methods=["POST"])
def route_assistant():
    data = request.get_json() or {}
    query = data.get("query", "")
    context = data.get("context", {})  # e.g. scan results
    if not query:
        return jsonify({"status":"error","message":"No query provided"}), 400
    answer = answer_with_ai(query, context)
    return jsonify({"status":"ok","answer": answer})
