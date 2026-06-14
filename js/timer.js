/* timer.js — Cronómetro para el quiz */

const Timer = (() => {
  let startTime = null;
  let elapsed = 0;       // ms acumulados hasta el último stop
  let interval = null;
  let onTick = null;

  function pad(n) { return String(n).padStart(2, '0'); }

  function format(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${pad(sec)}`;
  }

  function start(tickCallback) {
    if (interval) return;
    onTick = tickCallback || null;
    startTime = Date.now() - elapsed;
    interval = setInterval(() => {
      elapsed = Date.now() - startTime;
      if (onTick) onTick(format(elapsed), elapsed);
    }, 500);
  }

  function stop() {
    if (!interval) return;
    clearInterval(interval);
    interval = null;
    if (startTime) elapsed = Date.now() - startTime;
  }

  function reset() {
    stop();
    elapsed = 0;
    startTime = null;
  }

  function getElapsed() { return elapsed; }
  function getFormatted() { return format(elapsed); }

  return { start, stop, reset, getElapsed, getFormatted, format };
})();
