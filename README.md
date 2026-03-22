# VaaNi — Multilingual Speech-to-Text for Indian Languages

> Real-time browser-based speech recognition with microphone & file upload.
> Supports 3 languages: Hindi, Marathi & English.

---

## Project Contents

```
stt_project/
├── index.html          ← Interactive demo UI (open in browser)
├── css/
│   └── style.css       ← Stylesheet
├── js/
│   └── app.js          ← Frontend application logic
├── backend.py          ← Flask server (for file transcription)
├── colab_notebook.py   ← Python script for Google Colab
└── README.md           ← This file
```

---

## Quick Start

### Frontend Only (Microphone + Demo)

**Works immediately, no backend needed:**

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge)
2. Select your language
3. Choose **Microphone** or **Demo Samples**
4. Click **Run Transcription**
5. See live results

### With File Upload Support (Requires Backend)

1. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Set your Groq API key:**

   ```bash
   # Windows
   set GROQ_API_KEY=your_actual_groq_token

   # Linux/Mac
   export GROQ_API_KEY=your_actual_groq_token
   ```

   > Get a free key: https://console.groq.com

3. **Start the backend server:**

   ```bash
   python backend.py
   ```

   Output:

   ```
   🎤 VaaNi Backend Server
   ==================================================
   Server running on http://localhost:5000
   ```

4. **Open `index.html` and test file upload tab**
   - The frontend will POST audio to `http://localhost:5000/transcribe`
   - Results appear instantly

---

## Supported Languages

| Code | Language | Native  |
| ---- | -------- | ------- |
| hi   | Hindi    | हिन्दी  |
| mr   | Marathi  | मराठी   |
| en   | English  | English |

---

## Features

✅ **Real-time Microphone Recognition**

- Uses browser Web Speech API
- No backend required
- Works offline (language dependent)

✅ **File Upload Transcription**

- Supports any audio format (wav, mp3, ogg, etc.)
- Uses HuggingFace Whisper API (via local backend)
- CORS-safe proxy architecture

✅ **Demo Samples**

- Pre-loaded phrases in all languages
- No internet required
- Instant results

✅ **Responsive Design**

- Mobile, tablet, desktop
- Touch-friendly controls

✅ **Word Error Rate (WER) Analysis**

- Compare transcription vs reference text
- Accuracy percentage
- Visual gauge

---

## Troubleshooting

### "Backend server not running" error

**Solution:** Start the backend:

```bash
python backend.py
```

### "HuggingFace API key not set" error

**Solution:** Set your Groq API key before starting backend:

```bash
set GROQ_API_KEY=your_key  # Windows
export GROQ_API_KEY=your_key  # Linux/Mac
python backend.py
```

### Microphone not working

**Solution:** Ensure:

- Browser supports Web Speech API (Chrome, Edge, Safari)
- You allowed microphone access when prompted
- Use HTTPS or localhost for secure context

---

## Technology Stack

- **Frontend:** Vanilla HTML5 / CSS3 / JavaScript
- **Microphone API:** Web Speech API (W3C standard)
- **File ASR:** Groq Whisper API (whisper-large-v3)
- **Backend Proxy:** Flask + Flask-CORS
- **Fonts:** Google Fonts (Playfair Display, DM Sans, JetBrains Mono)

---

## License & Attribution

Built as a demonstration project.  
Audio inference powered by Groq & OpenAI Whisper model.

---

| bn | Bengali | বাংলা | ai4bharat/indicwav2vec-bengali |
| kn | Kannada | ಕನ್ನಡ | ai4bharat/indicwav2vec-kannada |
| gu | Gujarati | ગુજરાતી | ai4bharat/indicwav2vec-gujarati |
| pa | Punjabi | ਪੰਜਾਬੀ | ai4bharat/indicwav2vec-punjabi |

---

## Tech Stack

| Tool                     | Role                                 |
| ------------------------ | ------------------------------------ |
| PyTorch                  | Deep learning framework              |
| HuggingFace Transformers | Model loading & inference            |
| Wav2Vec 2.0 XLSR-53      | Core speech recognition architecture |
| torchaudio               | Audio loading & resampling           |
| jiwer                    | WER computation                      |
| AI4Bharat Indic Corpus   | Training & evaluation data           |
| Google Colab             | Cloud execution environment          |

---

## Audio Requirements

- Format: `.wav` (preferred) or `.mp3`
- Sampling rate: any (auto-resampled to 16kHz)
- Channels: mono or stereo (auto-converted to mono)
- Duration: up to ~60 seconds for best results

---

## Pipeline

```
Audio Input (.wav/.mp3)
       ↓
Stereo → Mono Conversion
       ↓
Resample to 16kHz
       ↓
Wav2Vec2Processor (feature extraction)
       ↓
Wav2Vec2ForCTC (forward pass)
       ↓
Argmax → Token IDs
       ↓
processor.decode() → Transcription Text
       ↓
WER Analysis (optional)
```

---

## WER Metrics

- **WER (Word Error Rate)**: fraction of words incorrectly transcribed
- **Accuracy**: `(1 - WER) × 100%`
- Lower WER = better performance

---

## Keywords

Multilingual Speech Recognition · Indian Languages · Deep Learning · Wav2Vec 2.0  
Speech-to-Text · Digital Inclusion · Indic Speech Corpus · Transformer Models

---

_Built for AI4Bharat Digital Inclusion Hackathon_
