const output = document.getElementById('output');
const form = document.getElementById('promptForm');
const input = document.getElementById('promptInput');
const installBtn = document.getElementById('installBtn');

let deferredPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-flex';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

function appendMessage(type, text) {
  const el = document.createElement('div');
  el.className = `msg ${type}`;
  el.textContent = text;
  output.appendChild(el);
  output.scrollTop = output.scrollHeight;
}

function connectAndSend(prompt) {
  const ws = new WebSocket(`ws://${location.host}/ws`);
  ws.onopen = () => {
    ws.send(JSON.stringify({ prompt }));
  };
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'status') {
        appendMessage('status', `الحالة: ${msg.message}`);
      } else if (msg.type === 'result') {
        appendMessage('result', msg.data || 'انتهى التنفيذ');
      } else if (msg.type === 'error') {
        appendMessage('error', msg.message || 'خطأ غير معروف');
      }
    } catch (err) {
      appendMessage('error', 'تعذّر قراءة الرسالة');
    }
  };
  ws.onerror = () => appendMessage('error', 'حدث خطأ في الاتصال');
  ws.onclose = () => appendMessage('status', 'تم إغلاق الاتصال');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) return;
  appendMessage('you', prompt);
  connectAndSend(prompt);
  input.value = '';
});