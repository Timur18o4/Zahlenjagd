import { chapterNames, duel, factions, initialPower, makeWorld, optionText, roadControl, roadKey, roadPosition, routeOptions, shortPlace, start, weaponNames, world } from './world.mjs';
import { makeLandscape, drawLandscape } from './landscape.mjs';
import { createSoundtrack } from './sound.mjs';
import { character, drawDuel, kidnap, rescue } from './toons.mjs';

const $ = id => document.getElementById(id);
const canvas = $('map');
const ctx = canvas.getContext('2d', { alpha: false });
let map = makeWorld(null);
let terrain = makeLandscape(map);
let mapSeed = null;
const camera = { x: 870, y: 1160, zoom: .82 };
const gold = '#ffdf93';
const ally = '#a2e5b5';
const enemy = '#ffb18f';
const clearedColor = '#acd6d1';
const openColor = '#edc78a';
const number = n => n.toLocaleString('de-DE');
const compact = n => n < 10000 ? number(n) : (n / (n < 1000000 ? 1000 : 1000000)).toLocaleString('de-DE', { maximumFractionDigits: 1 }) +
  (n < 1000000 ? 'k' : 'M');
const openingRoutes = routeOptions(start, null, [], initialPower);
let state = { phase: 'ready', power: initialPower, here: start, cleared: [], trails: [],
  options: openingRoutes, discovered: openingRoutes.map(({ node }) => node.id), weapons: {} };
let known = new Set(state.discovered);
let cleared = new Set();
let mapInset;
let online = false;
let lastTime = 0;
const soundtrack = createSoundtrack();
const chapterLabels = chapterNames(1).map((name, chapter) => {
  const label = document.createElement('div');
  label.className = 'step';
  const title = document.createElement('strong');
  title.textContent = name;
  const places = document.createElement('div');
  places.className = 'step-places';
  label.append(title, places);
  const markers = world.filter(node => node.chapter === chapter).map(node => {
    const cell = document.createElement('div');
    cell.className = 'map-place';
    cell.title = node.name;
    const value = document.createElement('b');
    const place = document.createElement('span');
    place.textContent = shortPlace(node);
    cell.append(value, place);
    places.append(cell);
    return { node, cell, value, place };
  });
  $('trail-steps').append(label);
  return { label, title, markers };
});

function resize() {
  $('stage').style.setProperty('--scale', Math.min(innerWidth / 1920, innerHeight / 1080));
}
window.addEventListener('resize', resize);
resize();

function notice(kicker, title, text) {
  $('announcement').hidden = !title;
  $('announcement').classList.toggle('ready', state.phase === 'ready');
  $('notice-kicker').textContent = kicker;
  $('notice-title').textContent = title;
  $('notice-text').textContent = text;
}

function caption(letter) {
  return state.mode === 'chat' ? ` · !${letter.toLowerCase()}` : '';
}

function showState() {
  const { here, move, options, phase, power } = state;
  const act = state.act ?? 1;
  const chapters = chapterNames(act);
  const weapons = weaponNames(act);
  const seed = state.mapSeed ?? null;
  if (seed !== mapSeed) {
    mapSeed = seed;
    map = makeWorld(seed, act, state.entryPower);
    terrain = makeLandscape(map, seed);
    camera.x = here.x;
    camera.y = here.y;
    camera.zoom = .84;
  }
  if (!mapInset || seed !== mapInset.seed) {
    const all = [map.start, ...map.world];
    const minX = Math.min(...all.map(point => point.x));
    const minY = Math.min(...all.map(point => point.y));
    const width = Math.max(...all.map(point => point.x)) - minX;
    const height = Math.max(...all.map(point => point.y)) - minY;
    const zoom = Math.min(310 / width, 103 / height);
    mapInset = { seed, minX, minY, zoom, x: 1118 - width * zoom / 2, y: 715 - height * zoom / 2 };
  }
  known = new Set(state.discovered ?? []);
  cleared = new Set(state.cleared);
  $('round').textContent = `${state.cleared.length} / ${world.length} GEGNER BESIEGT`;
  $('act-title').textContent = act === 1 ? 'AKT I · DAS RENNEN ZUR ZITADELLE' : 'AKT II · DIE JAGD DURCH DIE MASCHINENWELT';
  $('region').textContent = here.name;
  $('map-region').textContent = chapters[here.chapter].toUpperCase();
  const faction = factions[here.faction];
  $('map-faction').textContent = faction?.name ?? '';
  $('map-faction').style.color = faction?.color ?? '';
  const strength = $('power');
  strength.textContent = number(power);
  strength.style.fontSize = Math.min(84, 510 / strength.textContent.length) + 'px';
  canvas.parentElement.classList.toggle('rescue', phase === 'won' || phase === 'kidnap');
  canvas.parentElement.classList.toggle('duel', move?.kind === 'fight');
  $('rival-ribbon').hidden = !state.rival;
  if (state.rival) {
    const { step, total, name, power: rivalPower } = state.rival;
    $('rival-status').textContent = `${name} · Stärke ${number(rivalPower)}`;
    $('rival-progress').style.width = `${100 * step / total}%`;
  }
  const remaining = [...known].filter(id => !cleared.has(id)).length;
  $('open-count').textContent = `${remaining} ${remaining === 1 ? 'offener Gegner' : 'offene Gegner'}`;
  chapterLabels.forEach(({ label, title, markers }, chapter) => {
    title.textContent = chapters[chapter];
    label.classList.toggle('current', chapter === here.chapter);
    for (const { node: base, cell, value, place } of markers) {
      const node = map.nodes.get(base.id);
      const defeated = cleared.has(node.id);
      cell.classList.toggle('open', known.has(node.id) && !defeated);
      cell.classList.toggle('done', defeated);
      cell.classList.toggle('current', here.id === node.id);
      value.textContent = defeated ? '✓' : known.has(node.id) ? compact(node.power) : '·';
      place.textContent = shortPlace(node);
      const weapon = weapons[state.weapons?.[node.id]];
      cell.title = known.has(node.id) ? `${node.name} · ${number(node.power)} · ${weapon ?? ''}` : node.name;
    }
  });
  $('prompt').textContent = {
    ready: 'Wohin geht die Reise?', pick: 'Wählt euren Weg', travel: move?.automatic ? 'Automatischer Rückweg' : move?.kind === 'walk' ? 'Unterwegs' : 'Duell',
    between: state.result?.walk ? 'Weg passiert' : 'Gegner besiegt', lost: 'Lauf beendet', kidnap: 'Der Rivale entkommt', won: 'Die Rettung',
  }[phase];
  const cards = options.map(option => {
    const { node, walk, safe, letter } = option;
    const card = document.createElement('div');
    card.className = 'rival' + (walk ? ' walk' : safe ? '' : ' danger') + (node.id === move?.target.id ? ' chosen' : '');
    card.innerHTML = '<b class="rival-command"></b><div class="rival-copy"><strong></strong><span></span></div><div class="rival-power"></div>';
    card.querySelector('.rival-command').textContent = '!' + letter.toLowerCase();
    const title = card.querySelector('strong');
    title.textContent = node.name;
    const weapon = weapons[state.weapons?.[node.id]];
    if (!walk && weapon) {
      const badge = document.createElement('small');
      badge.textContent = weapon;
      title.append(badge);
    }
    const detail = card.querySelector('.rival-copy span');
    detail.textContent = optionText(option);
    if (!walk && node.faction) {
      const family = document.createElement('small');
      family.className = 'rival-faction';
      family.textContent = factions[node.faction].name;
      family.style.color = factions[node.faction].color;
      detail.append(family);
    }
    const value = card.querySelector('.rival-power');
    value.textContent = walk ? (option.back ? '↶' : '✓') : number(node.power);
    if (value.textContent.length > 5) value.style.fontSize = Math.max(24, 220 / value.textContent.length) + 'px';
    return card;
  });
  if (phase === 'won') {
    const recap = document.createElement('div');
    recap.className = 'finish-recap';
    recap.innerHTML = '<span>JAGD ABGESCHLOSSEN</span><strong></strong><p>Der Rivale ist besiegt.</p>';
    recap.querySelector('strong').textContent = `${state.cleared.length} Gegner besiegt`;
    cards.push(recap);
  }
  $('rivals').replaceChildren(...cards);

  let hint = 'Stärke öffnet Engpässe. An jeder Kreuzung könnt ihr den Rückweg wählen.';
  if (!online) hint = 'Die Verbindung zum Spiel wird aufgebaut …';
  else if (state.mode === 'chat' && !state.chatConnected) hint = 'Twitch-Verbindung unterbrochen. Das Spiel wartet.';
  else if (phase === 'won') hint = 'Der Held befreit die Prinzessin aus der Neonspitze.';
  else if (phase === 'kidnap') hint = 'Der Rivale flieht in die Maschinenwelt. Eure Stärke bleibt euch erhalten.';
  else if (phase === 'travel') hint = move.kind === 'fight' ? `${move.target.enemy} stellt sich euch in den Weg.` : 'Bereits erkundet · keine zusätzlichen Stärkepunkte.';
  else if (phase === 'pick') {
    const advice = here.role === 'dead' ? 'Sackgasse. Nehmt den Rückweg.'
      : options.every(option => option.walk || !option.safe) && options.some(option => !option.safe)
        ? 'Zu stark? Weicht aus und sammelt anderswo Stärke.' : 'Freie Wege bringen euch zu neuen Kämpfen.';
    hint = state.mode === 'chat' ? `Twitch-Chat · Erster gültiger Befehl zählt.\n${advice}` : advice;
  }
  $('hint').textContent = hint;

  if (phase === 'ready') {
    notice(act === 1 ? 'DIE REISE BEGINNT' : 'DIE VERFOLGUNG', act === 1 ? 'Vom Niemand zum Retter' : 'Jagd auf den Entführer',
      online ? `Start bei Stärke ${number(power)}.` : 'Verbinde mit der Spielsteuerung …');
  } else if (phase === 'travel' && move.kind === 'walk') {
    if (move.automatic) notice('SACKGASSE', 'Automatischer Rückweg', `Zurück nach ${move.target.name}`);
    else notice('WECHSEL' + caption(move.letter), move.target.name, 'Freier Weg · kein Kampf');
  } else if (phase === 'lost') {
    notice('NIEDERLAGE' + caption(state.result.letter), 'Die Jagd ist vorbei', `${number(power)} reichte gegen ${number(state.result.target.power)} nicht aus.`);
  } else if (phase === 'between' && !state.result.walk) {
    notice('SIEG' + caption(state.result.letter), `+${number(state.result.gained)} Stärke`, `${state.result.target.enemy} besiegt${here.role === 'dead' ? ' · Sackgasse' : ''}`);
  } else {
    notice('', '', '');
  }
}

const connection = new EventSource('/state');
connection.onmessage = ({ data }) => {
  state = JSON.parse(data);
  online = true;
  soundtrack(state, online);
  showState();
};
connection.onerror = () => {
  online = false;
  soundtrack(state, online);
  showState();
};
showState();

function screen(point) {
  return { x: canvas.width / 2 + (point.x - camera.x) * camera.zoom, y: canvas.height / 2 + (point.y - camera.y) * camera.zoom };
}

function connectionLine(from, to, color, dashed) {
  const a = screen(from);
  const b = screen(to);
  const middle = screen(roadControl(from, to));
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(middle.x, middle.y, b.x, b.y);
  ctx.lineWidth = dashed ? 4 : 5;
  ctx.strokeStyle = color;
  ctx.setLineDash(dashed ? [7, 9] : []);
  ctx.stroke();
  ctx.setLineDash([]);
}

function marker(point, { color, text, time, hero = false, flip = false, walk = false, step = 0, remembered = false }) {
  const { x, y } = screen(point);
  const size = point.role === 'boss' ? 1.15 : hero ? 1.01 : .88;
  ctx.save();
  ctx.translate(x, y);
  if (remembered) ctx.globalAlpha = .79;
  ctx.beginPath();
  ctx.ellipse(0, 0, hero ? 27 + Math.sin(time / 330) * 3 : 24, 11, 0, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = hero ? 3 : 2;
  ctx.stroke();
  if (!walk) character(ctx, { x: 0, y: -3, size, time: time / 1000 + point.power / 17, step,
    variant: hero ? 'hero' : point.variant, flip, smile: hero || point.variant === 'rival',
    weapon: hero ? 'sword' : state.weapons?.[point.id], tech: !hero && state.act === 2 ? point.chapter : null, angle: -.94 });
  ctx.translate(0, walk ? -34 : -114 * size - 16);
  ctx.font = '900 28px "Segoe UI", sans-serif';
  const plate = Math.max(59, ctx.measureText(text).width + 27);
  ctx.beginPath();
  ctx.roundRect(-plate / 2, -21, plate, 41, 10);
  ctx.fillStyle = '#10201eee';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(text, 0, -2);
  ctx.restore();
}

function overview() {
  const at = point => [mapInset.x + (point.x - mapInset.minX) * mapInset.zoom, mapInset.y + (point.y - mapInset.minY) * mapInset.zoom];
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(944, 632, 348, 151, 11);
  ctx.fillStyle = '#13231ff0';
  ctx.strokeStyle = '#9da18190';
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#efd08e';
  ctx.font = '800 14px "Segoe UI", sans-serif';
  ctx.fillText('REISEKARTE', 960, 651);
  for (const [a, b] of map.roads) {
    ctx.beginPath();
    ctx.moveTo(...at(a));
    ctx.lineTo(...at(b));
    ctx.strokeStyle = state.trails.includes(roadKey(a, b)) ? '#debb76' : '#65776e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  for (const node of [start, ...map.world]) {
    const current = node.id === state.here.id;
    ctx.beginPath();
    const unbeaten = known.has(node.id) && !cleared.has(node.id);
    ctx.arc(...at(node), current ? 5 : unbeaten ? 4.5 : 2.7, 0, Math.PI * 2);
    ctx.fillStyle = current ? gold : cleared.has(node.id) ? ally : unbeaten ? openColor : '#7f9085';
    ctx.fill();
  }
  ctx.restore();
}

const optionColor = option => option.walk ? clearedColor : option.safe ? ally : enemy;
function animate(time) {
  const dt = Math.min(time - lastTime, 45);
  lastTime = time;
  const { phase, here, move, options } = state;
  if (phase === 'won') {
    rescue(ctx, Date.now() - state.result.at, state.act);
    requestAnimationFrame(animate);
    return;
  }
  if (phase === 'kidnap') {
    kidnap(ctx, Date.now() - state.result.at);
    requestAnimationFrame(animate);
    return;
  }
  const elapsed = move ? Math.max(0, Date.now() - move.time) : 0;
  const fighting = move?.kind === 'fight';
  const t = move ? Math.min(1, elapsed / (fighting ? duel.approach : move.duration)) : 0;
  const position = move ? roadPosition(move.from, move.target, t * (fighting ? .87 : 1)) : here;
  const bounds = phase === 'lost' ? [here, state.result.target] : [here, ...options.map(option => option.node)];
  if (move?.automatic) bounds.push(move.target);
  const xs = bounds.map(point => point.x);
  const ys = bounds.map(point => point.y);
  const minZoom = Math.max(canvas.width / map.width, canvas.height / map.height);
  const limit = Math.max(minZoom, Math.min(1.23, 1050 / Math.max(1, Math.max(...xs) - Math.min(...xs)),
    451 / Math.max(1, Math.max(...ys) - Math.min(...ys))));
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2 - 14 / limit;
  const glide = 1 - Math.exp(-dt / 240);
  camera.zoom += (limit - camera.zoom) * glide;
  camera.x += (centerX - camera.x) * glide;
  camera.y += (centerY - camera.y) * glide;
  const halfX = canvas.width / (2 * camera.zoom);
  const halfY = canvas.height / (2 * camera.zoom);
  camera.x = Math.max(halfX, Math.min(map.width - halfX, camera.x));
  camera.y = Math.max(halfY, Math.min(map.height - halfY, camera.y));
  drawLandscape(ctx, terrain, camera.x, camera.y, camera.zoom, canvas.width, canvas.height);
  const vignette = ctx.createRadialGradient(660, 397, 250, 660, 397, 800);
  vignette.addColorStop(0, '#071b1600');
  vignette.addColorStop(1, '#071b16aa');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const [a, b] of map.roads) {
    if (state.trails.includes(roadKey(a, b))) connectionLine(a, b, '#edc7798f', false);
  }
  if (fighting && elapsed >= duel.approach) {
    drawDuel(ctx, { ...move, target: map.nodes.get(move.target.id) ?? move.target }, state.power, elapsed, state.act);
  } else {
    if (move?.automatic) connectionLine(here, move.target, clearedColor, true);
    for (const option of options) {
      connectionLine(here, option.node, move?.target.id === option.node.id ? gold : optionColor(option), true);
    }
    const cast = options.map(option => ({
      point: map.nodes.get(option.node.id) ?? option.node, color: optionColor(option), walk: option.walk,
      text: option.walk ? `${option.letter}  ${option.back ? '↶' : '✓'}` : `${option.letter}  ${compact(option.node.power)}`,
      flip: option.node.x > here.x,
    }));
    for (const node of map.world) {
      if (!known.has(node.id) || cleared.has(node.id) || node.id === here.id || node.id === state.result?.target.id || cast.some(item => item.point.id === node.id)) continue;
      const point = screen(node);
      if (point.x < 55 || point.x > 1255 || point.y < 150 || point.y > 674) continue;
      if ([position, ...cast.map(item => item.point)].some(item => Math.hypot(item.x - node.x, item.y - node.y) * camera.zoom < 99)) continue;
      cast.push({ point: node, color: openColor, text: `·  ${compact(node.power)}`, remembered: true, flip: node.x > here.x });
    }
    cast.push({ point: position, color: gold, text: `✦  ${compact(state.power)}`, hero: true,
      step: move && t < 1 ? .95 : 0, flip: move?.target.x < here.x });
    if (phase === 'lost') cast.push({ point: state.result.target, color: enemy, text: compact(state.result.target.power), flip: true });
    cast.sort((a, b) => a.point.y - b.point.y);
    for (const { point, ...look } of cast) marker(point, { ...look, time });
    overview();
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
