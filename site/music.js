// Attempt sound on entry; browsers may require the first real user interaction.
(() => {
  const audio = document.querySelector('#background-music');
  const player = document.querySelector('.music-player');
  const button = document.querySelector('#music-toggle');
  const status = document.querySelector('#music-status');
  let wantsMusic = true, pending = false, awaitingGesture = false;
  audio.volume = .3;
  function sync() {
    const playing = !audio.paused && !audio.ended;
    const label = playing ? 'Pause background music' : 'Play background music';
    player.dataset.playing = String(playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', label);
    button.title = label;
  }
  async function startMusic() {
    if (pending || !wantsMusic || document.hidden) return;
    pending = true;
    button.setAttribute('aria-busy', 'true');
    try {
      await audio.play();
      awaitingGesture = false;
      status.textContent = '';
      if (!wantsMusic || document.hidden) audio.pause();
    } catch (_) {
      awaitingGesture = true;
      status.textContent = 'Tap the CD to play background music.';
    } finally {
      pending = false;
      button.removeAttribute('aria-busy');
      sync();
    }
  }
  button.addEventListener('click', () => {
    // Allow a pause while a slow play request is still pending.
    wantsMusic = audio.paused && !pending;
    status.textContent = '';
    if (wantsMusic) startMusic();
    else { awaitingGesture = false; audio.pause(); }
  });
  function unlockSound(event) {
    // Never restart after a visitor deliberately pauses the CD.
    if (!event.isTrusted || event.target.closest('#music-toggle')) return;
    if (event.type === 'keydown' && (event.ctrlKey || event.metaKey || event.altKey || ['Shift','Control','Alt','Meta','Escape'].includes(event.key))) return;
    if (awaitingGesture && wantsMusic) startMusic();
  }
  document.addEventListener('click', unlockSound);
  document.addEventListener('keydown', unlockSound);
  ['play', 'pause', 'ended'].forEach(event => audio.addEventListener(event, sync));
  audio.addEventListener('error', () => { sync(); status.textContent = 'Music is unavailable. Tap the CD to try again.'; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.pause();
    else if (wantsMusic) startMusic();
  });
  sync();
  startMusic();
})();
