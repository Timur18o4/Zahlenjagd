import { duel } from './world.mjs';

function track(name, loop = false) {
  const clip = new Audio('/audio/' + name + '.mp3');
  clip.preload = loop ? 'metadata' : 'auto';
  clip.loop = loop;
  return clip;
}

export function createSoundtrack() {
  const inObs = !!window.obsstudio;
  const music = [track('reise', true), track('zitadelle', true)];
  const effects = {
    draw: [track('ziehen'), .55],
    parry: [track('treffer'), .42],
    hit: [track('treffer'), .79],
    gain: [track('staerke'), .60],
    win: [track('sieg'), .64],
    loss: [track('niederlage'), .67],
  };
  const targets = [0, 0];
  let active = inObs && !document.hidden;
  let online = false;
  let phase;
  let state;
  let timers = [];
  let previousFight;
  music.forEach(clip => { clip.volume = 0; });

  function playEffect(name) {
    if (!active || !online) return;
    const [clip, volume] = effects[name];
    clip.volume = volume;
    clip.currentTime = 0;
    clip.play().catch(() => {});
  }

  function chooseMusic() {
    targets.fill(0);
    if (!active || !online || !state || ['ready', 'kidnap', 'won', 'lost'].includes(state.phase)) return;
    const slot = state.here.id === 'crown' || state.move?.target.role === 'boss' ? 1 : 0;
    targets[slot] = state.phase === 'travel' ? .20 : .29;
  }

  function stopEffects() {
    timers.forEach(clearTimeout);
    timers = [];
    for (const [clip] of Object.values(effects)) clip.pause();
  }

  window.addEventListener('obsSourceActiveChanged', ({ detail }) => {
    active = detail.active;
    if (!active) stopEffects();
    chooseMusic();
  });

  if (inObs) {
    setInterval(() => {
      music.forEach((clip, i) => {
        const delta = targets[i] - clip.volume;
        clip.volume = Math.abs(delta) < .008 ? targets[i] : clip.volume + delta * .075;
        if (targets[i] > 0 && clip.paused) clip.play().catch(() => {});
        if (targets[i] === 0 && clip.volume === 0 && !clip.paused) clip.pause();
      });
    }, 65);
  }

  return (next, connected) => {
    state = next;
    online = connected;
    chooseMusic();
    if (!online || state.phase === 'ready') {
      stopEffects();
      if (state.phase === 'ready') music.forEach(clip => { if (clip.readyState > 0) clip.currentTime = 0; });
    }
    const fight = state.move?.kind === 'fight' ? state.move : null;
    if (fight && fight.time !== previousFight) {
      previousFight = fight.time;
      const age = Date.now() - fight.time;
      if (age < 500) playEffect('draw');
      const cues = [['parry', duel.parry], ['hit', duel.strike]];
      timers = cues.filter(([, at]) => at > age).map(([name, at]) => setTimeout(() => playEffect(name), at - age));
    }
    if (phase && phase !== state.phase) {
      if (state.phase === 'between' && !state.result.walk) playEffect('gain');
      if (state.phase === 'won') timers.push(setTimeout(() => playEffect('win'), 3650));
      if (state.phase === 'kidnap') timers.push(setTimeout(() => playEffect('loss'), 3350));
      if (state.phase === 'lost') playEffect('loss');
    }
    phase = state.phase;
  };
}
