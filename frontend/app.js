const startBtn = document.getElementById('startBtn');
const transcriptDiv = document.getElementById('transcript');
const statusDiv = document.getElementById('status');

let mediaRecorder;
let audioChunks = [];

startBtn.onclick = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Microphone not supported');
    return;
  }

  startBtn.disabled = true;
  startBtn.innerText = 'Recording...';

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(blob);

    // Send audio file to backend
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav');

    transcriptDiv.innerText = 'Transcribing...';

    const uploadResp = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    });
    
    const res = await fetch('http://localhost:3000/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl: fileUrl }),
    });

    const result = await res.json();
    transcriptDiv.innerText = result.transcript;
    statusDiv.innerText = result.calendarResponse.message;
    startBtn.innerText = 'Start Recording';
    startBtn.disabled = false;
  };

  audioChunks = [];
  mediaRecorder.start();

  // Stop after 10 seconds
  setTimeout(() => mediaRecorder.stop(), 10000);
};
