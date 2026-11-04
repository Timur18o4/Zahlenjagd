export const chapters = ['Grünland', 'Kupferwald', 'Falkengebirge', 'Eisenmark', 'Kronland'];
const futureChapters = ['Zunftland', 'Dampfviertel', 'Stromgürtel', 'Maschinenstadt', 'Neonkrone'];
export const chapterNames = act => act === 2 ? futureChapters : chapters;
export const letters = ['A', 'B', 'C', 'D', 'E'];
export const duel = { approach: 1660, parry: 2610, strike: 3780, duration: 4850 };
export const weapons = { sword: 'Schwert', axe: 'Axt', bow: 'Bogen', spear: 'Speer', lance: 'Lanze' };
const futureWeapons = { sword: 'Impulsklinge', axe: 'Servo-Axt', bow: 'Bolzenwerfer', spear: 'Teleskopspeer', lance: 'Schub-Lanze' };
export const weaponNames = act => act === 2 ? futureWeapons : weapons;
export const factions = {
  knight: { name: 'Ritterpfad', color: '#a6c9d3' },
  beast: { name: 'Monsterpfad', color: '#eca188' },
  myth: { name: 'Fabelpfad', color: '#b8dda9' },
  guild: { name: 'Zunftweg', color: '#dbc48e' },
  steam: { name: 'Dampftrasse', color: '#edaa73' },
  electric: { name: 'Stromnetz', color: '#9cdbd7' },
  cyber: { name: 'Neonbezirk', color: '#e6a4e4' },
};
export const start = { id: 'start', name: 'Dorfplatz', x: 420, y: 1200, power: 0, chapter: 0 };
export const initialPower = 5;

const locations = [
  ['moos', 'Mooswacht', 'Pilzsammler', 2, 760, 840, 'dead'],
  ['furt', 'Flussfurt', 'Brückenwache', 4, 810, 1390],
  ['mill', 'Mühlenbach', 'Müllersknecht', 7, 1220, 1730, 'dead'],
  ['thorn', 'Dornentor', 'Dornfaust', 16, 1320, 1140, 'gate'],
  ['gold', 'Goldhain', 'Strohhelm', 12, 1810, 890],
  ['rot', 'Rotforst', 'Waldvogt', 30, 2220, 675],
  ['moor', 'Moorbrücke', 'Pfahlwache', 24, 2050, 1470],
  ['copper', 'Kupferberg', 'Minenmeister', 74, 2670, 1140, 'gate'],
  ['falcon', 'Falkenpass', 'Klippenjäger', 72, 3150, 790],
  ['spire', 'Zackenfels', 'Falkner', 99, 3170, 1530],
  ['ridge', 'Hochkamm', 'Granitgarde', 128, 3620, 1010],
  ['silver', 'Silbersteg', 'Talrichter', 322, 4140, 1270, 'gate'],
  ['ash', 'Aschefeld', 'Glutläufer', 150, 4650, 1610],
  ['hammer', 'Hammerhof', 'Kesselfaust', 380, 5120, 1450],
  ['iron', 'Eisentor', 'Eisenmarschall', 1190, 5530, 1110, 'gate'],
  ['grim', 'Grimmwacht', 'Grimmgarde', 370, 5020, 790],
  ['wood', 'Kronenwald', 'Roter Späher', 420, 6040, 1490],
  ['wall', 'Schwarzer Wall', 'Schwarzschild', 930, 6390, 750],
  ['crown', 'Kronentor', 'Letzte Klinge', 3050, 6860, 1170, 'gate'],
  ['boss', 'Zitadelle', 'Zahlenkönig', 6250, 7410, 1170, 'boss'],
];

const creatures = {
  moos: ['myth', 'faun', 'Moosfaun'], mill: ['myth', 'faun', 'Mühlenkobold'],
  rot: ['beast', 'fiend', 'Rotforst-Dämon'], moor: ['beast', 'fiend', 'Moorhetzer'],
  spire: ['beast', 'fiend', 'Gratbestie'], ridge: ['myth', 'griffin', 'Felsgreif'],
  ash: ['beast', 'fiend', 'Ascheteufel'], hammer: ['beast', 'fiend', 'Schlackenfürst'],
  wood: ['myth', 'faun', 'Dornenhirsch'],
};
const future = [
  ['Werkstatt', 'Zunftspäher'], ['Zunftgasse', 'Rostfechter'], ['Schmiede', 'Hammerknecht'], ['Zunfttor', 'Zunftmeister'],
  ['Dampfwerk', 'Kesselwache'], ['Kesselhof', 'Rußläufer'], ['Rußkanal', 'Ventiljäger'], ['Turbinensteg', 'Dampfkoloss'],
  ['Kupfertrasse', 'Schienenläufer'], ['Hochbahn', 'Funkenritter'], ['Luftwerft', 'Kupfergreif'], ['Blitzstation', 'Stromwächter'],
  ['Trafohof', 'Blechhund'], ['Reaktor', 'Kernwache'], ['Schaltwerk', 'Maschinenmarschall'], ['Funkturm', 'Signaljäger'],
  ['Neongasse', 'Netzläufer'], ['Rasterwall', 'Rasterwache'], ['Datentor', 'Chromklinge'], ['Neonspitze', 'Der Rivale'],
];
export const world = locations.map(([id, name, enemy, power, x, y, role], i) => {
  const [faction, variant, title] = creatures[id] ?? ['knight',
    role === 'boss' ? 'boss' : role === 'gate' ? 'guard' : ['rival', 'guard', 'brute'][i % 3], enemy];
  return { id, name, enemy: title, power, x, y, role, chapter: Math.floor(i / 4), faction, variant };
});
const shortNames = { Mühlenbach: 'Mühle', 'Schwarzer Wall': 'Schw. Wall', Turbinensteg: 'Turbinenst.' };
export const shortPlace = node => shortNames[node.name] || node.name;
export const nodes = new Map([start, ...world].map(node => [node.id, node]));

const links = [
  ['start', 'moos'], ['start', 'furt'], ['start', 'thorn'], ['furt', 'mill'], ['furt', 'thorn'],
  ['thorn', 'gold'], ['thorn', 'moor'], ['thorn', 'rot'],
  ['gold', 'rot'], ['gold', 'moor'], ['gold', 'copper'], ['moor', 'copper'], ['rot', 'copper'],
  ['copper', 'falcon'], ['copper', 'spire'], ['falcon', 'ridge'], ['spire', 'ridge'],
  ['spire', 'silver'], ['ridge', 'silver'],
  ['silver', 'ash'], ['silver', 'grim'], ['ash', 'hammer'], ['grim', 'hammer'],
  ['grim', 'iron'], ['hammer', 'iron'],
  ['iron', 'wood'], ['iron', 'wall'], ['wood', 'wall'], ['wood', 'crown'], ['wall', 'crown'],
  ['crown', 'boss'],
];
export const roads = links.map(link => link.map(id => nodes.get(id)));
export const roadKey = (a, b) => [a.id, b.id].sort().join('/');

export function roadControl(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const bend = (a.id < b.id ? 68 : -68) / Math.max(1, Math.hypot(dx, dy));
  return { x: (a.x + b.x) / 2 - dy * bend, y: (a.y + b.y) / 2 + dx * bend };
}

export function roadPosition(a, b, t) {
  const middle = roadControl(a, b);
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * middle.x + t * t * b.x, y: u * u * a.y + 2 * u * t * middle.y + t * t * b.y };
}

export function routeOptions(here, previous, cleared, power, routes = roads) {
  const neighbors = routes.filter(([a, b]) => a.id === here.id || b.id === here.id)
    .map(([a, b, shortcut]) => ({ node: a.id === here.id ? b : a, shortcut }));
  const ordered = neighbors.filter(({ node }) => node.id !== previous);
  const back = neighbors.find(({ node }) => node.id === previous);
  if (back) ordered.push(back);
  return ordered.map(({ node, shortcut }, i) => {
    const walk = node.id === start.id || cleared.includes(node.id);
    return { node, shortcut, letter: letters[i], walk, back: node.id === previous, safe: walk || power > node.power };
  });
}

export function makeWorld(seed, act = 1, entryPower = initialPower) {
  if (seed == null) return { start, world, roads, nodes, width: 8050, height: 2530 };
  let value = seed >>> 0;
  const roll = (min, max) => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return min + Math.floor((value / 4294967296) * (max - min + 1));
  };
  const next = new Map(world.map(node => [node.id, { ...node }]));
  const powers = {};
  const set = (id, power) => { powers[id] = power; };
  const fraction = (entry, min, max) => Math.max(1, Math.floor(entry * roll(min, max) / 100));

  set('moos', roll(2, 4));
  set('furt', roll(3, 4));
  set('mill', roll(5, 7));
  const millTotal = initialPower + powers.furt + powers.mill;
  set('thorn', millTotal + roll(0, powers.moos - 1));
  let entry = millTotal + powers.moos + powers.thorn;

  set('gold', fraction(entry, 34, 41));
  set('moor', fraction(entry, 58, 66));
  set('rot', fraction(entry, 79, 88));
  set('copper', entry + powers.gold + powers.rot - roll(1, 3));
  entry += powers.gold + powers.rot + powers.copper;

  set('falcon', fraction(entry, 42, 51));
  set('spire', fraction(entry, 55, 64));
  set('ridge', fraction(entry, 73, 84));
  set('silver', entry + powers.falcon + powers.ridge - fraction(entry, 3, 8));
  entry += powers.falcon + powers.ridge + powers.silver;

  set('ash', fraction(entry, 21, 26));
  set('grim', fraction(entry, 54, 61));
  set('hammer', fraction(entry, 57, 64));
  set('iron', entry + fraction(entry, 68, 75));
  entry += powers.ash + powers.hammer + powers.iron;

  set('wood', fraction(entry, 17, 22));
  set('wall', fraction(entry, 33, 39));
  set('crown', entry + fraction(entry, 24, 30));
  set('boss', powers.crown * 2 - roll(10, 45));

  if (act === 2) {
    for (const id of Object.keys(powers)) powers[id] = Math.round(powers[id] * entryPower / initialPower);
    powers.thorn = Math.max(powers.thorn, entryPower + powers.furt + powers.mill);
    const groups = ['guild', 'steam', 'electric', 'electric', 'cyber'];
    [...next.values()].forEach((node, i) => {
      [node.name, node.enemy] = future[i];
      node.faction = groups[node.chapter];
      node.variant = node.role === 'boss' ? 'rival-armored' : node.chapter === 4 ? 'cyborg' : node.chapter >= 1 ? 'automaton' : 'guard';
    });
  }

  const mirror = Array.from({ length: chapters.length }, () => roll(0, 1));
  for (const node of next.values()) {
    node.power = powers[node.id];
    if (node.role !== 'boss') {
      node.x += roll(-74, 74);
      node.y = (mirror[node.chapter] ? 2360 - node.y : node.y) + roll(-59, 59);
    }
  }

  // Gates and the route through the upper side paths form a tested spine.
  // The links below change shortcuts and the places at which detours reconnect.
  const alternatives = [
    [['thorn', 'rot'], ['moor', 'rot']],
    [['gold', 'moor'], null],
    [['spire', 'silver'], ['falcon', 'silver']],
    [['grim', 'hammer'], ['ash', 'grim']],
    [['iron', 'wall'], null],
  ];
  const replaceable = new Set(alternatives.map(([edge]) => edge.join('/')));
  const result = links.filter(edge => !replaceable.has(edge.join('/')));
  for (const pair of alternatives) {
    const chosen = pair[roll(0, 1)];
    if (chosen) result.push(chosen);
  }
  const bypasses = [
    ['moor', 'spire', act === 2 ? 'Wartungstunnel' : 'Moorpfad'],
    ['ridge', 'grim', act === 2 ? 'Lufttrasse' : 'Höhenweg'],
    ['hammer', 'wood', act === 2 ? 'Kabelschacht' : 'Königsschleichweg'],
  ];
  const primary = roll(0, bypasses.length - 1);
  const selected = bypasses.filter((_, index) => index === primary || roll(0, 1));
  result.push(...selected);
  if (selected.includes(bypasses[2])) {
    const withoutIron = [...next.values()].filter(({ id }) => !['iron', 'crown', 'boss'].includes(id))
      .reduce((total, node) => total + node.power, entryPower);
    const crown = next.get('crown');
    crown.power = Math.min(crown.power, withoutIron - Math.max(1, Math.floor(withoutIron / 45)));
    const boss = next.get('boss');
    boss.power = Math.min(boss.power, crown.power * 2 - 1);
  }

  // Each pattern alternates whole east-west and north-south legs. Offsets
  // from the spine turn with it so both sides of a fork remain distinct.
  const headings = roll(0, 1) ? [[1, 0], [0, -1], [1, 0], [0, 1], [1, 0]]
    : [[0, 1], [1, 0], [0, 1], [1, 0], [0, 1]];
  const sign = roll(0, 1) ? 1 : -1;
  const spine = rawX => {
    const step = 1550;
    const distance = Math.max(0, rawX - 280);
    const index = Math.min(headings.length - 1, Math.floor(distance / step));
    let x = 0;
    let y = 0;
    for (let i = 0; i <= index; i++) {
      const length = i < index ? step : distance - i * step;
      x += headings[i][0] * length;
      y += headings[i][1] * length * sign;
    }
    return { x, y };
  };
  next.set(start.id, { ...start, name: act === 2 ? 'Werkstatthafen' : start.name });
  for (const node of next.values()) {
    const middle = spine(node.x);
    const before = spine(node.x - 200);
    const after = spine(node.x + 200);
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const span = Math.hypot(dx, dy);
    const offset = (node.y - 1180) * .84;
    node.x = Math.round(middle.x - dy / span * offset);
    node.y = Math.round(middle.y + dx / span * offset);
  }
  const all = [...next.values()];
  // Keep adjacent markers apart when two arms of a bend almost touch.
  for (let pass = 0; pass < 12; pass++) {
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i];
        const b = all[j];
        const dx = b.x - a.x || .001;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= 220) continue;
        const shift = (220 - distance) / (2 * distance);
        a.x -= dx * shift;
        a.y -= dy * shift;
        b.x += dx * shift;
        b.y += dy * shift;
      }
    }
  }
  const left = Math.min(...all.map(node => node.x));
  const top = Math.min(...all.map(node => node.y));
  for (const node of all) {
    node.x += 720 - left;
    node.y += 640 - top;
  }
  return { act, start: next.get(start.id), world: all.filter(node => node.id !== start.id), nodes: next,
    width: Math.max(...all.map(node => node.x)) + 720, height: Math.max(...all.map(node => node.y)) + 640,
    roads: result.map(([a, b, shortcut]) => [next.get(a), next.get(b), shortcut]) };
}

export function optionText({ node, back, walk, safe, shortcut }) {
  if (walk) return back ? 'Zurück · kein neuer Kampf' : 'Freier Weg · schon erkundet';
  const role = shortcut ?? { dead: 'Sackgasse', gate: 'Engpass', boss: 'Endkampf' }[node.role];
  const effect = safe ? `+ ${node.power.toLocaleString('de-DE')} Stärke` : `Braucht ${(node.power + 1).toLocaleString('de-DE')} Stärke`;
  return role ? `${role} · ${effect}` : effect;
}
