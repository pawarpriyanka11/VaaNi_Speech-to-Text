// =====================================================
//  VaaNi — Multilingual STT — app.js
// =====================================================

const LANG_DATA = {
  hi: { name: 'Hindi', native: 'हिन्दी' },
  mr: { name: 'Marathi', native: 'मराठी' },
  en: { name: 'English', native: 'English' }
};

// Demo texts per language
const DEMO_TEXTS = {
  hi: 'नमस्ते मेरा नाम योगेश है मैं भारत से हूँ और मुझे हिंदी भाषा बहुत पसंद है',
  mr: 'नमस्कार माझे नाव आकांक्षा आहे मी पुण्याहून आहे आणि मला मराठी भाषा आवडते',
  en: 'Hello, my name is Yogesh. I speak English and this is a live demo transcription.'
};

let selectedLang = 'hi';
let activeTab = 'upload';
let audioReady = false;
let demoText = null;
let transcriptionResult = null;
let mediaRecorder = null;
let recordingTimer = null;
let recordingSeconds = 0;
let audioBlob = null;
let uploadedFile = null;

// ─── Language Selection ───────────────────────────
document.querySelectorAll('.lb').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lb').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedLang = btn.dataset.lang;
  });
});

// ─── Tab Switching ────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
  document.getElementById('panel' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
  demoText = null;
  audioReady = false;
  audioBlob = null;
}

// ─── File Upload ──────────────────────────────────
const dropzone = document.getElementById('dropzone');

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('drag-over');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

function handleFileSelect(input) {
  if (input.files[0]) processFile(input.files[0]);
}

function processFile(file) {
  if (!file.type.startsWith('audio/')) {
    showToast('Please upload an audio file.', 'error');
    return;
  }
  const url = URL.createObjectURL(file);
  const sizeStr = file.size > 1024 * 1024
    ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    : Math.round(file.size / 1024) + ' KB';

  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = sizeStr + ' · ' + file.type;
  document.getElementById('fileRow').classList.remove('hidden');
  document.getElementById('dropzone').style.display = 'none';

  const player = document.getElementById('audioPlayer');
  player.src = url;
  player.classList.remove('hidden');

  audioReady = true;
  demoText = null;
  uploadedFile = file;
}

function removeFile() {
  document.getElementById('fileRow').classList.add('hidden');
  document.getElementById('audioPlayer').classList.add('hidden');
  document.getElementById('audioPlayer').src = '';
  document.getElementById('dropzone').style.display = '';
  document.getElementById('fileInput').value = '';
  audioReady = false;
  uploadedFile = null;
}

// ─── Microphone ───────────────────────────────────
async function toggleMic() {
  const btn = document.getElementById('micBtn');
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        audioBlob = new Blob(chunks, { type: 'audio/wav' });
        audioReady = true;
        document.getElementById('micLabel').textContent = 'Recording saved — ready to transcribe';
        document.getElementById('waveRow').classList.add('hidden');
        document.getElementById('recTime').classList.add('hidden');
        clearInterval(recordingTimer);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      btn.classList.add('recording');
      document.getElementById('micLabel').textContent = 'Recording… tap to stop';
      document.getElementById('waveRow').classList.remove('hidden');
      document.getElementById('recTime').classList.remove('hidden');
      recordingSeconds = 0;
      recordingTimer = setInterval(() => {
        recordingSeconds++;
        const m = Math.floor(recordingSeconds / 60);
        const s = recordingSeconds % 60;
        document.getElementById('recTime').textContent = m + ':' + String(s).padStart(2, '0');
      }, 1000);
    } catch (err) {
      showToast('Microphone access denied. Please allow mic access.', 'error');
    }
  } else {
    mediaRecorder.stop();
    btn.classList.remove('recording');
  }
}

// ─── Demo Samples ─────────────────────────────────
function loadDemo(lang, text) {
  selectedLang = lang;
  demoText = text;
  audioReady = true;
  document.querySelectorAll('.lb').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.querySelectorAll('.demo-item').forEach(d => d.classList.remove('active-demo'));
  event.currentTarget.classList.add('active-demo');
  showToast('Demo sample loaded: ' + LANG_DATA[lang].name, 'success');
}

// ─── Transcription Pipeline (simulated) ──────────
async function runTranscription() {
  if (!audioReady) {
    showToast('Please provide audio input first.', 'error');
    return;
  }

  const btn = document.getElementById('runBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-text">Processing…</span>';
  document.getElementById('pipelineSteps').classList.remove('hidden');
  document.getElementById('progressTrack').classList.remove('hidden');

  // For demo sample, show the text directly
  if (demoText) {
    transcriptionResult = demoText;
    showResults(transcriptionResult);
    finishRun(btn);
    return;
  }

  if (activeTab === 'mic') {
    // For mic mode, we don't need pre-recorded audio, just start listening
    audioReady = true;
    await runMicRecognition(btn);
    return;
  }

  if (activeTab === 'upload') {
    if (!uploadedFile) {
      showToast('No file uploaded for transcription.', 'error');
      finishRun(btn);
      return;
    }
    await transcribeUploadedFile(uploadedFile, btn);
    return;
  }

  showToast('Unknown input mode.', 'error');
  finishRun(btn);
}

function finishRun(btn) {
  document.getElementById('pipelineSteps').classList.add('hidden');
  document.getElementById('progressTrack').classList.add('hidden');
  document.getElementById('progressFill').style.width = '0%';
  document.querySelectorAll('.ps-step').forEach(s => s.classList.remove('active', 'done'));
  btn.disabled = false;
  btn.innerHTML = '<span class="btn-text">Run Transcription</span><span class="run-arrow">→</span>';
}

async function runMicRecognition(btn) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('SpeechRecognition is not supported in this browser. Use Chrome/Edge.', 'error');
    finishRun(btn);
    return;
  }

  const recognizer = new SpeechRecognition();
  recognizer.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'mr' ? 'mr-IN' : 'en-US';
  recognizer.interimResults = true;
  recognizer.continuous = false;
  recognizer.maxAlternatives = 1;

  showToast('Speak now... (listening for ' + LANG_DATA[selectedLang].name + ')', 'success');

  let finalTranscript = '';

  recognizer.onresult = event => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    // Show live preview
    if (finalTranscript || interim) {
      document.getElementById('transContent').textContent = (finalTranscript + interim).trim();
    }
  };

  recognizer.onend = () => {
    transcriptionResult = finalTranscript.trim();
    if (!transcriptionResult) {
      showToast('No speech detected. Please try again and speak clearly.', 'error');
      finishRun(btn);
      return;
    }
    showResults(transcriptionResult);
    showToast('Microphone transcription complete!', 'success');
    finishRun(btn);
  };

  recognizer.onerror = err => {
    if (err.error === 'no-speech') {
      showToast('No speech detected. Please try again.', 'error');
    } else if (err.error === 'not-allowed') {
      showToast('Microphone permission denied. Please allow access.', 'error');
    } else {
      showToast('Speech recognition error: ' + err.error, 'error');
    }
    finishRun(btn);
  };

  try {
    recognizer.start();
  } catch (err) {
    showToast('Failed to start speech recognition: ' + err.message, 'error');
    finishRun(btn);
  }
}

async function transcribeUploadedFile(file, btn) {
  try {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch('https://vaani-speech-to-text.onrender.com/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Backend error');
    }

    const data = await response.json();
    transcriptionResult = data.text || 'Could not decode audio.';
    showResults(transcriptionResult);
    showToast('File transcription complete.', 'success');
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      showToast('Backend server not running. Start it with: python backend.py', 'error');
    } else {
      showToast('Error: ' + error.message, 'error');
    }
  } finally {
    finishRun(btn);
  }
}

function showResults(text) {
  const lang = LANG_DATA[selectedLang];
  document.getElementById('resultLang').textContent = lang.name + ' · ' + lang.native;
  document.getElementById('transContent').textContent = text;
  document.getElementById('cardResults').classList.remove('hidden');
  document.getElementById('cardResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── WER Calculation ──────────────────────────────
function calculateWER() {
  const ref = document.getElementById('refInput').value.trim();
  if (!ref || !transcriptionResult) {
    showToast('Please enter a reference sentence.', 'error');
    return;
  }

  const refWords = ref.toLowerCase().split(/\s+/).filter(Boolean);
  const hypWords = transcriptionResult.toLowerCase().split(/\s+/).filter(Boolean);

  const werScore = computeWER(refWords, hypWords);
  const acc = Math.max(0, (1 - werScore) * 100);

  document.getElementById('mvWER').textContent = (werScore * 100).toFixed(1) + '%';
  document.getElementById('mvAcc').textContent = acc.toFixed(1) + '%';
  document.getElementById('mvRef').textContent = refWords.length;
  document.getElementById('mvPred').textContent = hypWords.length;

  document.getElementById('metricsRow').classList.remove('hidden');
  document.getElementById('gaugeWrap').classList.remove('hidden');
  document.getElementById('gaugeAcc').textContent = acc.toFixed(1) + '% accurate';
  drawGauge(acc);
}

function computeWER(ref, hyp) {
  const n = ref.length, m = hyp.length;
  const dp = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (ref[i-1] === hyp[j-1]) dp[i][j] = dp[i-1][j-1];
      else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return n === 0 ? 0 : dp[n][m] / n;
}

function drawGauge(acc) {
  const canvas = document.getElementById('gaugeCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2, cy = H - 20;
  const r = 100;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const fillAngle = startAngle + (acc / 100) * Math.PI;

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = '#f0ebe0';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Fill
  const color = acc >= 80 ? '#1a7a4a' : acc >= 50 ? '#E8621A' : '#c0392b';
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, fillAngle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#7a6a55';
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('0%', cx - r - 8, cy + 16);
  ctx.fillText('100%', cx + r + 8, cy + 16);
}

// ─── Copy & Download ──────────────────────────────
function copyText() {
  if (!transcriptionResult) return;
  navigator.clipboard.writeText(transcriptionResult).then(() => {
    showToast('Transcription copied!', 'success');
  });
}

function downloadTxt() {
  if (!transcriptionResult) return;
  const lang = LANG_DATA[selectedLang];
  const content = [
    'VaaNi — Multilingual Speech-to-Text',
    '====================================',
    '',
    'Language: ' + lang.name + ' (' + lang.native + ')',
    'Model: Browser Web Speech / Whisper API',
    'Date: ' + new Date().toLocaleString(),
    '',
    'Transcription:',
    '--------------',
    transcriptionResult,
    '',
    'WER Analysis:',
    '-------------',
    (() => {
      const ref = document.getElementById('refInput').value.trim();
      if (!ref) return 'Reference text not provided.';
      const refWords = ref.toLowerCase().split(/\s+/).filter(Boolean);
      const hypWords = transcriptionResult.toLowerCase().split(/\s+/).filter(Boolean);
      const w = computeWER(refWords, hypWords);
      const a = Math.max(0, (1 - w) * 100);
      return 'WER: ' + (w * 100).toFixed(1) + '%\nAccuracy: ' + a.toFixed(1) + '%';
    })()
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vaani_transcription_' + selectedLang + '_' + Date.now() + '.txt';
  a.click();
}

function resetApp() {
  transcriptionResult = null;
  audioReady = false;
  demoText = null;
  audioBlob = null;
  uploadedFile = null;

  document.getElementById('cardResults').classList.add('hidden');
  document.getElementById('pipelineSteps').classList.add('hidden');
  document.getElementById('progressTrack').classList.add('hidden');
  document.getElementById('progressFill').style.width = '0%';
  document.querySelectorAll('.ps-step').forEach(s => s.classList.remove('active','done'));

  removeFile();
  document.getElementById('refInput').value = '';
  document.getElementById('metricsRow').classList.add('hidden');
  document.getElementById('gaugeWrap').classList.add('hidden');
  document.getElementById('micLabel').textContent = 'Tap to record';
  document.getElementById('waveRow').classList.add('hidden');
  document.getElementById('recTime').classList.add('hidden');
  recordingSeconds = 0;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Toast notifications ──────────────────────────
function showToast(msg, type) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.id = 'toast';
  t.textContent = msg;
  t.style.cssText = [
    'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
    'padding:10px 20px', 'border-radius:99px',
    'font-family:"DM Sans",sans-serif', 'font-size:13px', 'font-weight:500',
    'z-index:9999', 'animation:toastIn 0.2s ease',
    type === 'error'
      ? 'background:#fdeaea;color:#c0392b;border:1px solid rgba(192,57,43,0.2)'
      : 'background:#e8f5ee;color:#1a7a4a;border:1px solid rgba(26,122,74,0.2)'
  ].join(';');

  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(s);
  }

  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─── Add active-demo style ────────────────────────
const demoStyle = document.createElement('style');
demoStyle.textContent = '.active-demo{border-color:var(--saffron)!important;background:var(--saffron-pale)!important;}';
document.head.appendChild(demoStyle);
