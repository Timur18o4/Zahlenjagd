import http from 'node:http';
import { randomInt } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { duel, initialPower, makeWorld, roadKey, routeOptions, start, weapons, world } from './world.mjs';
import { connectTwitchChat, normalizeChannel } from './twitch.mjs';

const port = Number(process.env.ZAHLENJAGD_PORT || 8793);
const origin = `http://127.0.0.1:${port}`;
const settingsDir = process.env.ZAHLENJAGD_SETTINGS_DIR ?? fileURLToPath(new URL('./data/', import.meta.url));
const channelFile = join(settingsDir, 'twitch-channel.txt');
let channel = normalizeChannel(process.env.ZAHLENJAGD_TWITCH_CHANNEL);
try {
  channel = normalizeChannel(readFileSync(channelFile, 'utf8')) ?? channel;
} catch (error) {
  if (error.code !== 'ENOENT') console.warn('Der gespeicherte Twitch-Kanal konnte nicht gelesen werden.');
}
const files = new Map([
  ['/', ['control.html', 'text/html']],
  ['/overlay', ['overlay.html', 'text/html']],
  ['/style.css', ['style.css', 'text/css']],
  ['/control.mjs', ['control.mjs', 'text/javascript']],
  ['/overlay.mjs', ['overlay.mjs', 'text/javascript']],
  ['/landscape.mjs', ['landscape.mjs', 'text/javascript']],
  ['/sound.mjs', ['sound.mjs', 'text/javascript']],
  ['/world.mjs', ['world.mjs', 'text/javascript']],
  ['/toons.mjs', ['toons.mjs', 'text/javascript']],
  ['/musik-credits', ['Musik-Credits.txt', 'text/plain']],
]);
for (const track of ['reise', 'zitadelle', 'ziehen', 'treffer', 'staerke', 'sieg', 'niederlage']) {
  files.set(`/audio/${track}.mp3`, [`audio/${track}.mp3`, 'audio/mpeg']);
}
const walkMs = 2050;
let state;
let map;
let travelTimer;
let rivalTimer;
let chatConnected = false;
let chatRetrying = false;
let disconnectChat;
const viewers = new Set();

function dealWeapons() {
  const kinds = Object.keys(weapons);
  const bag = world.map((_, i) => kinds[i % kinds.length]);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return Object.fromEntries(world.map(({ id }, i) => [id, bag[i]]));
}

const newSeed = () => ((state?.mapSeed ?? 0) + randomInt(1, 2 ** 32)) >>> 0;

function reset(seed = newSeed(), loadout = dealWeapons(), act = 1, entryPower = initialPower, mode = 'manual') {
  clearTimeout(travelTimer);
  clearTimeout(rivalTimer);
  map = makeWorld(seed, act, entryPower);
  state = {
    phase: 'ready', mode, mapSeed: seed, act, entryPower,
    power: entryPower, here: map.start, previous: null, cleared: [], trails: [], discovered: [], weapons: loadout,
    move: null, result: null, rival: null,
  };
  discover();
  publish();
}

function snapshot() {
  return {
    ...state, channel, chatConnected, chatRetrying,
    options: ['ready', 'pick', 'travel'].includes(state.phase) && !state.move?.automatic ? availableRoutes() : [],
  };
}

function availableRoutes() {
  return routeOptions(state.here, state.previous, state.cleared, state.power, map.roads);
}

function discover() {
  for (const { node } of availableRoutes()) {
    if (node.id !== start.id && !state.discovered.includes(node.id)) state.discovered.push(node.id);
  }
}

function rivalPlan() {
  const course = makeWorld((state.mapSeed ^ 0xa54a132d) >>> 0);
  const outposts = [
    'Wurzelgraben', 'Kieselsteg', 'Alter Kornhof', 'Grenzposten',
    'Ulmenhain', 'Nachtwald', 'Schwarze Furt', 'Erzstollen',
    'Falkenwarte', 'Schattengrat', 'Steinkanzel', 'Nordbollwerk',
    'Glutpfad', 'Hüttentor', 'Hochfestung', 'Wachtklippe',
    'Königshain', 'Westwall', 'Hintertor', 'Zitadelle',
  ];
  const names = new Map(course.world.map((node, index) => [node.id, outposts[index]]));
  const queue = [{ here: course.start, power: initialPower, cleared: [], path: [] }];
  const visited = new Set();
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const { here, power, cleared, path } = queue[cursor];
    if (here.role === 'boss') return path;
    const key = here.id + '/' + [...cleared].sort().join('/');
    if (visited.has(key)) continue;
    visited.add(key);
    for (const option of routeOptions(here, null, cleared, power, course.roads)) {
      if (!option.safe) continue;
      const nextPower = power + (option.walk ? 0 : option.node.power);
      queue.push({ here: option.node, power: nextPower, cleared: option.walk ? cleared : [...cleared, option.node.id],
        path: [...path, { name: names.get(option.node.id) ?? 'Rivalenlager', power: nextPower }] });
    }
  }
  throw new Error('Für den Rivalen konnte keine Route berechnet werden.');
}

function startRival() {
  const path = rivalPlan();
  state.rival ??= { step: 0, total: path.length, name: 'Auf der Nebenroute', power: initialPower };
  function advance() {
    const next = path[state.rival.step];
    state.rival = { ...state.rival, ...next, step: state.rival.step + 1 };
    publish();
    if (state.rival.step < path.length) rivalTimer = setTimeout(advance, randomInt(3900, 5800));
  }
  if (state.rival.step < path.length) rivalTimer = setTimeout(advance, 4400);
}

function publish() {
  const packet = `data: ${JSON.stringify(snapshot())}\n\n`;
  for (const response of viewers) {
    if (response.writableLength > 65536) response.destroy();
    else response.write(packet);
  }
}

function nextTurn() {
  state.phase = 'pick';
  publish();
}

function move(option, automatic = false) {
  const { node: target, letter, walk, safe } = option;
  const duration = walk ? walkMs : duel.duration;
  state.phase = 'travel';
  state.move = { from: state.here, target, letter, time: Date.now(), duration,
    kind: walk ? 'walk' : 'fight', win: safe, weapon: state.weapons[target.id], automatic };
  publish();
  schedulePhase();
}

function finishMove() {
  const { from, target, letter, kind, win } = state.move;
  const walk = kind === 'walk';
  const gained = !walk && win ? target.power : 0;
  state.result = { win, target, letter, gained, walk, at: Date.now() };
  state.move = null;
  if (!win) {
    state.phase = 'lost';
    clearTimeout(rivalTimer);
  } else {
    state.previous = from.id;
    state.here = target;
    const trail = roadKey(from, target);
    if (!state.trails.includes(trail)) state.trails.push(trail);
    if (!walk) {
      state.power += gained;
      state.cleared.push(target.id);
    }
    discover();
    state.phase = target.role === 'boss' ? (state.act === 1 ? 'kidnap' : 'won') : 'between';
  }
  if (state.phase === 'kidnap') {
    clearTimeout(rivalTimer);
    if (state.rival) state.rival = { ...state.rival, step: state.rival.total, name: 'An der Zitadelle' };
  }
  publish();
  schedulePhase();
}

function continueFromWaypoint() {
  if (!state.result.walk) {
    const options = availableRoutes();
    if (options.length === 1 && options[0].walk && options[0].back) {
      move(options[0], true);
      return;
    }
  }
  nextTurn();
}

function schedulePhase(restoring = false) {
  if (state.phase === 'travel') {
    const { time, duration } = state.move;
    travelTimer = setTimeout(finishMove, restoring ? Math.max(0, time + duration - Date.now()) : duration);
  } else if (state.phase === 'between') {
    const duration = state.result.walk ? 600 : 1550;
    travelTimer = setTimeout(continueFromWaypoint, restoring ? Math.max(0, state.result.at + duration - Date.now()) : duration);
  } else if (state.phase === 'kidnap') {
    travelTimer = setTimeout(() => {
      const { power, mode } = state;
      reset(newSeed(), dealWeapons(), 2, power, mode);
      nextTurn();
    }, restoring ? Math.max(0, state.result.at + 9700 - Date.now()) : 9700);
  }
}

function takeCommand({ message }) {
  if (!chatConnected || state.phase !== 'pick' || state.mode !== 'chat') return;
  const command = /^!([a-e])$/i.exec(message.trim());
  if (!command) return;
  const letter = command[1].toUpperCase();
  const option = availableRoutes().find(choice => choice.letter === letter);
  if (option) move(option);
}

function joinChat() {
  disconnectChat?.();
  chatConnected = false;
  chatRetrying = false;
  publish();
  disconnectChat = connectTwitchChat(channel, takeCommand, connected => {
    chatConnected = connected;
    chatRetrying = !connected;
    publish();
  });
}

function act(data) {
  if (data.action === 'channel') {
    const next = normalizeChannel(data.channel);
    if (!next) throw new Error('Gib einen Twitch-Kanalnamen oder einen direkten Twitch-Kanallink ein.');
    const temporary = channelFile + '.' + process.pid + '.tmp';
    try {
      mkdirSync(settingsDir, { recursive: true });
      writeFileSync(temporary, next + '\n', 'utf8');
      renameSync(temporary, channelFile);
    } catch {
      throw new Error('Der Twitch-Kanal konnte nicht gespeichert werden.');
    }
    if (next !== channel || !chatConnected) {
      channel = next;
      joinChat();
    }
    return;
  }
  if (data.action === 'reset') {
    reset(state.mapSeed, state.weapons, state.act, state.entryPower);
    return;
  }
  if (data.action === 'shuffle' && ['ready', 'won', 'lost'].includes(state.phase)) {
    reset();
    return;
  }
  if (data.action === 'start' && ['ready', 'won', 'lost'].includes(state.phase)) {
    if (!['manual', 'chat'].includes(data.mode)) throw new Error('Ungültiger Spielmodus.');
    if (data.mode === 'chat' && !chatConnected) throw new Error('Der Twitch-Chat ist noch nicht verbunden.');
    if (state.phase === 'ready') reset(state.mapSeed, state.weapons, state.act, state.entryPower, data.mode);
    else reset(newSeed(), dealWeapons(), 1, initialPower, data.mode);
    if (state.act === 1) startRival();
    nextTurn();
    return;
  }
  if (data.action === 'pick' && state.phase === 'pick' && state.mode === 'manual') {
    const option = availableRoutes().find(choice => choice.letter === data.letter);
    if (option) {
      move(option);
      return;
    }
  }
  throw new Error('Diese Aktion ist gerade nicht verfügbar.');
}

const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'self'; style-src 'self'; object-src 'none'; frame-ancestors 'none'",
};

function reply(response, status, body, type = 'application/json') {
  response.writeHead(status, { ...headers, 'Content-Type': `${type}; charset=utf-8` });
  response.end(body);
}

function shutdown() {
  clearTimeout(travelTimer);
  clearTimeout(rivalTimer);
  disconnectChat?.();
  server.close();
  server.closeAllConnections();
}

const server = http.createServer(async (request, response) => {
  if (request.headers.host !== `127.0.0.1:${port}`) {
    reply(response, 403, '{"error":"Nur lokal verfügbar."}');
    return;
  }
  const path = new URL(request.url, origin).pathname;
  if (request.method === 'GET' && path === '/health') {
    reply(response, 200, '{"service":"Zahlenjagd"}');
    return;
  }
  if (request.method === 'GET' && path === '/state') {
    response.writeHead(200, {
      ...headers, 'Content-Type': 'text/event-stream; charset=utf-8', Connection: 'keep-alive',
    });
    response.write(`data: ${JSON.stringify(snapshot())}\n\n`);
    viewers.add(response);
    response.on('close', () => viewers.delete(response));
    return;
  }
  if (request.method === 'POST' && path === '/action') {
    if (request.headers.origin !== origin || request.headers['content-type'] !== 'application/json') {
      reply(response, 403, '{"error":"Die Steuerung ist nur über die lokale Spielseite verfügbar."}');
      return;
    }
    try {
      let body = '';
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 2048) {
          reply(response, 413, '{"error":"Anfrage zu groß."}');
          return;
        }
      }
      const data = JSON.parse(body);
      if (data.action === 'shutdown') response.once('finish', shutdown);
      else act(data);
      reply(response, 200, '{"ok":true}');
    } catch (error) {
      reply(response, 400, JSON.stringify({ error: error.message }));
    }
    return;
  }
  const file = files.get(path);
  if (request.method !== 'GET' || !file) {
    reply(response, 404, '{"error":"Seite nicht gefunden."}');
    return;
  }
  try {
    const type = file[1];
    const contents = await readFile(new URL(file[0], import.meta.url));
    if (type === 'audio/mpeg') {
      response.writeHead(200, { ...headers, 'Content-Type': type, 'Content-Length': contents.length, 'Cache-Control': 'private, max-age=3600' });
      response.end(contents);
    } else {
      reply(response, 200, contents, type);
    }
  } catch {
    reply(response, 500, '{"error":"Spieldatei konnte nicht geladen werden."}');
  }
});

const handover = process.env.ZAHLENJAGD_HANDOVER_FILE;
if (handover) {
  const { channel: _oldChannel, chatConnected: _oldConnection, chatRetrying: _oldRetrying, options: _oldOptions, ...saved } =
    JSON.parse(readFileSync(handover, 'utf8'));
  map = makeWorld(saved.mapSeed, saved.act, saved.entryPower);
  state = saved;
  if (state.act === 1 && state.rival && ['pick', 'travel', 'between'].includes(state.phase)) startRival();
  schedulePhase(true);
} else {
  reset();
}
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} ist bereits belegt.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Steuerung: ${origin}/`);
  console.log(`OBS-Browserquelle: ${origin}/overlay`);
  if (channel) joinChat();
});
