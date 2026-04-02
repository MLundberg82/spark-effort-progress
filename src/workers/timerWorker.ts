// Web Worker for background timer - keeps counting when screen is locked
let interval: ReturnType<typeof setInterval> | null = null;
let seconds = 0;

self.onmessage = (e: MessageEvent) => {
  const { type, value } = e.data;

  if (type === 'start') {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        seconds = 0;
        if (interval) clearInterval(interval);
        interval = null;
        self.postMessage({ type: 'done', seconds: 0 });
      } else {
        self.postMessage({ type: 'tick', seconds });
      }
    }, 1000);
  } else if (type === 'stop') {
    if (interval) clearInterval(interval);
    interval = null;
  } else if (type === 'set') {
    seconds = value;
    self.postMessage({ type: 'tick', seconds });
  } else if (type === 'reset') {
    if (interval) clearInterval(interval);
    interval = null;
    seconds = value;
    self.postMessage({ type: 'tick', seconds });
  }
};
