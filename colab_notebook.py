# ================================================
# Multilingual Speech-to-Text System
# Using HuggingFace + Wav2Vec2
# Project: VaaNi — Speech-to-Text for Indian Languages
# ================================================

# Install required libraries
# Run this in Google Colab

# !pip -q install transformers torchaudio jiwer

import torch
import torchaudio
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
from jiwer import wer

print("=" * 60)
print("  VaaNi — Multilingual Speech-to-Text")
print("  Powered by Wav2Vec 2.0 (HuggingFace)")
print("=" * 60)

# -----------------------------------------------
# CONFIGURATION — Choose your model
# -----------------------------------------------
# Available Indian language models (AI4Bharat):
#   Hindi:   "ai4bharat/indicwav2vec-hindi"
#   Marathi: "ai4bharat/indicwav2vec-marathi"
#   Tamil:   "vasista22/wav2vec2-tamil"
#   Telugu:  "ai4bharat/indicwav2vec-telugu"
#   Bengali: "ai4bharat/indicwav2vec-bengali"
# English (default/fallback):
#   "jonatasgrosman/wav2vec2-large-xlsr-53-english"

LANGUAGE = "English"
MODEL_NAME = "jonatasgrosman/wav2vec2-large-xlsr-53-english"
SAMPLE_RATE = 16000  # Wav2Vec2 requires 16kHz

# -----------------------------------------------
# 1. Load Pretrained Model
# -----------------------------------------------
print(f"\n[1/5] Loading model: {MODEL_NAME}")
processor = Wav2Vec2Processor.from_pretrained(MODEL_NAME)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_NAME)
model.eval()
print(f"      Model loaded for language: {LANGUAGE}")

# -----------------------------------------------
# 2. Upload Audio File (Google Colab)
# -----------------------------------------------
print("\n[2/5] Audio Upload")

# Uncomment below if running in Google Colab:
# from google.colab import files
# print("      Please upload a .wav or .mp3 audio file...")
# uploaded = files.upload()
# file_name = list(uploaded.keys())[0]

# For local testing, set file_name directly:
file_name = "sample.wav"  # Replace with your audio file path
print(f"      Using audio file: {file_name}")

# -----------------------------------------------
# 3. Load & Preprocess Audio
# -----------------------------------------------
print("\n[3/5] Preprocessing Audio")

speech_array, sampling_rate = torchaudio.load(file_name)
print(f"      Original: {speech_array.shape}, sampling_rate={sampling_rate} Hz")

# Convert stereo to mono (average channels)
if speech_array.shape[0] > 1:
    speech_array = torch.mean(speech_array, dim=0, keepdim=True)
    print("      Stereo → Mono conversion applied")

# Resample to 16kHz if needed
if sampling_rate != SAMPLE_RATE:
    resampler = torchaudio.transforms.Resample(
        orig_freq=sampling_rate,
        new_freq=SAMPLE_RATE
    )
    speech_array = resampler(speech_array)
    print(f"      Resampled: {sampling_rate} Hz → {SAMPLE_RATE} Hz")

speech = speech_array.squeeze().numpy()
duration = len(speech) / SAMPLE_RATE
print(f"      Duration: {duration:.2f} seconds")
print(f"      Final shape: {speech.shape}")

# -----------------------------------------------
# 4. Speech-to-Text Inference
# -----------------------------------------------
print("\n[4/5] Running Speech-to-Text Inference")

inputs = processor(
    speech,
    sampling_rate=SAMPLE_RATE,
    return_tensors="pt",
    padding=True
)

with torch.no_grad():
    logits = model(**inputs).logits

predicted_ids = torch.argmax(logits, dim=-1)
transcription = processor.decode(predicted_ids[0])

print("\n" + "─" * 60)
print(f"  LANGUAGE  : {LANGUAGE}")
print(f"  MODEL     : {MODEL_NAME}")
print(f"  PREDICTED : {transcription}")
print("─" * 60)

# -----------------------------------------------
# 5. Word Error Rate (WER) Evaluation
# -----------------------------------------------
print("\n[5/5] WER Evaluation")
ref = input("\n  Enter the reference/actual sentence (press Enter to skip): ").strip()

if ref:
    error_rate = wer(ref.lower(), transcription.lower())
    accuracy = (1 - error_rate) * 100

    word_count_ref = len(ref.split())
    word_count_hyp = len(transcription.split())

    print("\n" + "=" * 60)
    print("  EVALUATION RESULTS")
    print("=" * 60)
    print(f"  Reference Text   : {ref}")
    print(f"  Predicted Text   : {transcription}")
    print(f"  Word Error Rate  : {error_rate:.4f} ({error_rate*100:.2f}%)")
    print(f"  Accuracy         : {accuracy:.2f}%")
    print(f"  Words (Ref.)     : {word_count_ref}")
    print(f"  Words (Pred.)    : {word_count_hyp}")
    print("=" * 60)
else:
    print("  WER evaluation skipped.")

print("\n✓ Speech-to-Text Completed")
print("  For demo UI, open index.html in your browser.")
