#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
CORS(app)

# Using Groq's free Whisper API instead of HuggingFace
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions"


@app.route("/transcribe", methods=["POST"])
def transcribe():
    if not GROQ_API_KEY:
        return jsonify({"error": "GROQ_API_KEY not set. Get free key at https://console.groq.com"}), 401

    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided."}), 400

    f = request.files["audio"]

    try:
        audio_data = f.read()
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
            },
            files={
                "file": (f.filename or "audio.wav", audio_data, f.mimetype or "audio/wav")
            },
            data={
                "model": "whisper-large-v3"
            },
            timeout=120
        )
    except Exception as ex:
        return jsonify({"error": f"Cannot reach Groq API: {ex}"}), 502

    print("Groq status:", response.status_code)
    print("Groq response:", response.text)

    if not response.ok:
        return jsonify({
            "error": f"Groq API error ({response.status_code}): {response.text}"
        }), response.status_code

    try:
        data = response.json()
    except Exception:
        return jsonify({"error": "Invalid JSON returned by Groq API."}), 500

    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No transcription produced.", "raw": data}), 500

    return jsonify({"text": text}), 200


if __name__ == "__main__":
    print("🎤 VaaNi Backend Server")
    print("="*50)
    print("Using Groq Whisper API (free)")
    print("Get API key: https://console.groq.com")
    print("Server running on http://localhost:5000")
    print("="*50)
    app.run(host="0.0.0.0", port=5000, debug=False)
