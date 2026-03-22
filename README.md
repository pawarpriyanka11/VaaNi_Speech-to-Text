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
- Uses Groq Whisper API (whisper-large-v3)
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

### "Groq API key not set" error

**Solution:** Set your Groq API key before starting backend:

```bash
set GROQ_API_KEY=your_key  # Windows
export GROQ_API_KEY=your_key  # Linux/Mac
python backend.py
```

**Get your free Groq API key:**
1. Visit https://console.groq.com
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and use it in your environment

### Microphone not working

**Solution:** Ensure:

- Browser supports Web Speech API (Chrome, Edge, Safari)
- You allowed microphone access when prompted
- Use HTTPS or localhost for secure context

---

## Deployment

### Deploy Frontend (GitHub Pages)

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Source: Deploy from branch `main` → `/ (root)`
4. Your site will be live at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

### Deploy Backend (Render.com)

1. Sign up at [render.com](https://render.com)
2. Create New Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python backend.py`
5. Add Environment Variable:
   - **Key**: `GROQ_API_KEY`
   - **Value**: Your Groq API key from https://console.groq.com
6. Deploy!

### Update Frontend to Use Deployed Backend

In `js/app.js`, update the fetch URL:
```javascript
const response = await fetch('https://your-backend.onrender.com/transcribe', {
```

---

## API Information

### Groq Whisper API

- **Model**: whisper-large-v3
- **Provider**: Groq (https://groq.com)
- **Speed**: Ultra-fast inference
- **Cost**: Free tier available
- **Supported Formats**: wav, mp3, ogg, flac, m4a, webm
- **Max File Size**: 25 MB
- **Languages**: 99+ languages including Hindi, Marathi, English

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
