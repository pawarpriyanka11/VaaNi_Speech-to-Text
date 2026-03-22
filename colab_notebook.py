# ================================================
# Multilingual Speech-to-Text System
# Using Groq Whisper API
# Project: VaaNi — Speech-to-Text for Indian Languages
# ================================================

# Install required libraries
# Run this in Google Colab

# !pip -q install requests

import os
import requests
from google.colab import files

print("=" * 60)
print("  VaaNi — Multilingual Speech-to-Text")
print("  Powered by Groq Whisper API")
print("=" * 60)

# -----------------------------------------------
# CONFIGURATION
# -----------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

if not GROQ_API_KEY:
    print("\n⚠️  GROQ_API_KEY not set!")
    print("   Get your free API key from: https://console.groq.com")
    GROQ_API_KEY = input("   Enter your Groq API key: ").strip()

print(f"\n✓ API Key configured")

# -----------------------------------------------
# 1. Upload Audio File
# -----------------------------------------------
print("\n[1/3] Audio Upload")
print("      Please upload a .wav, .mp3, or any audio file...")
uploaded = files.upload()
file_name = list(uploaded.keys())[0]
print(f"      ✓ Uploaded: {file_name}")

# -----------------------------------------------
# 2. Transcribe using Groq Whisper API
# -----------------------------------------------
print("\n[2/3] Transcribing with Groq Whisper API...")

try:
    with open(file_name, 'rb') as audio_file:
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
            },
            files={
                "file": (file_name, audio_file, "audio/wav")
            },
            data={
                "model": "whisper-large-v3"
            },
            timeout=120
        )
    
    if response.ok:
        data = response.json()
        transcription = data.get("text", "")
        
        print("\n" + "─" * 60)
        print(f"  MODEL     : whisper-large-v3 (Groq)")
        print(f"  PREDICTED : {transcription}")
        print("─" * 60)
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(f"   {response.text}")
        transcription = None
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    transcription = None

# -----------------------------------------------
# 3. Word Error Rate (WER) Evaluation (Optional)
# -----------------------------------------------
if transcription:
    print("\n[3/3] WER Evaluation (Optional)")
    ref = input("\n  Enter the reference/actual sentence (press Enter to skip): ").strip()
    
    if ref:
        # Simple WER calculation
        ref_words = ref.lower().split()
        hyp_words = transcription.lower().split()
        
        # Levenshtein distance for WER
        def levenshtein(s1, s2):
            if len(s1) < len(s2):
                return levenshtein(s2, s1)
            if len(s2) == 0:
                return len(s1)
            previous_row = range(len(s2) + 1)
            for i, c1 in enumerate(s1):
                current_row = [i + 1]
                for j, c2 in enumerate(s2):
                    insertions = previous_row[j + 1] + 1
                    deletions = current_row[j] + 1
                    substitutions = previous_row[j] + (c1 != c2)
                    current_row.append(min(insertions, deletions, substitutions))
                previous_row = current_row
            return previous_row[-1]
        
        distance = levenshtein(ref_words, hyp_words)
        error_rate = distance / len(ref_words) if len(ref_words) > 0 else 0
        accuracy = (1 - error_rate) * 100
        
        print("\n" + "=" * 60)
        print("  EVALUATION RESULTS")
        print("=" * 60)
        print(f"  Reference Text   : {ref}")
        print(f"  Predicted Text   : {transcription}")
        print(f"  Word Error Rate  : {error_rate:.4f} ({error_rate*100:.2f}%)")
        print(f"  Accuracy         : {accuracy:.2f}%")
        print(f"  Words (Ref.)     : {len(ref_words)}")
        print(f"  Words (Pred.)    : {len(hyp_words)}")
        print("=" * 60)
    else:
        print("  WER evaluation skipped.")

print("\n✓ Speech-to-Text Completed")
print("  Supported Languages: Hindi, Marathi, English (and 99+ more)")
print("  For demo UI, visit: https://pawarpriyanka11.github.io/VaaNi_Speech-to-Text/")
