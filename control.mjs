import { chapterNames, makeWorld, optionText, weaponNames } from './world.mjs';

const $ = id => document.getElementById(id);
let state;
let sending = false;
let online = false;
let channelDraft = null;

function renderChannel() {
  const input = $('channel');
  if (online && channelDraft === null) input.value = state.channel ?? '';
  input.disabled = !online || sending;
  $('connect-channel').disabled = input.disabled || !input.value.trim() || (channelDraft === null && state.chatConnected);
  $('chat').disabled = $('manual').disabled || !state?.chatConnected || channelDraft !== null;
}

function render() {
  const active = state && ['pick', 'travel', 'between', 'kidnap'].includes(state.phase);
  $('status').textContent = online ? `Akt ${state.act ?? 1} · Stärke ${state.power.toLocaleString('de-DE')} · ${active ? state.here.name : { ready: 'Bereit', won: 'Gewonnen', lost: 'Verloren' }[state.phase]}${state.move?.automatic ? ' · Automatischer Rückweg' : ''}` : 'Spielserver getrennt';
  const chatStatus = state?.chatConnected ? 'Verbunden' : state?.chatRetrying ? 'Erneuter Versuch …' : 'Verbindet …';
  $('twitch').textContent = !online ? 'Offline' : state.channel ? `#${state.channel} · ${chatStatus}` : 'Kein Kanal ausgewählt';
  $('manual').disabled = !online || active || sending;
  renderChannel();
  $('shuffle').disabled = $('manual').disabled;
  $('reset').disabled = !online || state.phase === 'ready' || sending;
  $('shutdown').disabled = !online || sending;
  const options = online && state.phase === 'pick' ? state.options : [];
  const weapons = weaponNames(state?.act);
  $('picks').replaceChildren(...options.map(option => {
    const { letter, node, safe } = option;
    const button = document.createElement('button');
    button.type = 'button';
    button.disabled = state.mode !== 'manual' || sending;
    button.classList.toggle('danger', !safe);
    button.classList.toggle('walk', option.walk);
    button.textContent = `${letter} · ${node.name}`;
    const detail = document.createElement('span');
    const weapon = weapons[state.weapons?.[node.id]];
    detail.textContent = optionText(option) + (weapon && !option.walk ? ' · ' + weapon : '');
    button.append(detail);
    button.addEventListener('click', () => action({ action: 'pick', letter }));
    return button;
  }));
  const open = online ? makeWorld(state.mapSeed, state.act, state.entryPower).world.filter(node => state.discovered?.includes(node.id) && !state.cleared.includes(node.id)) : [];
  const chapters = chapterNames(state?.act);
  $('scouted-title').textContent = `Entdeckte, offene Gegner (${open.length})`;
  $('scouted-list').replaceChildren(...open.map(node => {
    const row = document.createElement('li');
    const weapon = weapons[state.weapons?.[node.id]];
    row.textContent = `${chapters[node.chapter]} · ${node.name} · Stärke ${node.power.toLocaleString('de-DE')}` + (weapon ? ' · ' + weapon : '');
    return row;
  }));
}

async function action(data, noteId = 'note') {
  sending = true;
  $(noteId).textContent = '';
  render();
  try {
    const response = await fetch('/action', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error((await response.json()).error);
    if (data.action === 'channel') channelDraft = null;
    if (data.action === 'shutdown') {
      connection.close();
      online = false;
      $(noteId).textContent = 'Zahlenjagd wurde beendet.';
    }
  } catch (error) {
    $(noteId).textContent = error.message;
  } finally {
    sending = false;
    render();
  }
}

$('manual').addEventListener('click', () => action({ action: 'start', mode: 'manual' }));
$('chat').addEventListener('click', () => action({ action: 'start', mode: 'chat' }));
$('shuffle').addEventListener('click', () => action({ action: 'shuffle' }));
$('reset').addEventListener('click', () => action({ action: 'reset' }));
$('shutdown').addEventListener('click', () => {
  if (window.confirm('Zahlenjagd vollständig beenden? Eine laufende Runde geht dabei verloren.')) action({ action: 'shutdown' });
});
$('channel').addEventListener('input', event => {
  const value = event.target.value;
  channelDraft = value === state?.channel ? null : value;
  $('channel-note').textContent = '';
  renderChannel();
});
$('channel-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!$('connect-channel').disabled) action({ action: 'channel', channel: $('channel').value }, 'channel-note');
});
const connection = new EventSource('/state');
connection.onmessage = ({ data }) => {
  state = JSON.parse(data);
  online = true;
  render();
};
connection.onerror = () => {
  online = false;
  render();
};
