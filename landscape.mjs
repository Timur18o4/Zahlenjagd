import { makeWorld, roadControl, roadPosition } from './world.mjs';

function randomSource(seed) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function route(ctx, nodes) {
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  for (let i = 1; i < nodes.length - 1; i++) {
    const here = nodes[i];
    const next = nodes[i + 1];
    ctx.quadraticCurveTo(here.x, here.y, (here.x + next.x) / 2, (here.y + next.y) / 2);
  }
  const end = nodes.at(-1);
  ctx.lineTo(end.x, end.y);
}

function road(ctx, nodes, size) {
  const [a, b] = nodes;
  const middle = roadControl(a, b);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(middle.x, middle.y, b.x, b.y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size + 9;
  ctx.strokeStyle = '#22362c';
  ctx.stroke();
  ctx.lineWidth = size;
  ctx.strokeStyle = '#8a8057';
  ctx.stroke();
  ctx.lineWidth = size / 3;
  ctx.strokeStyle = '#9f9164';
  ctx.stroke();
}

function tree(ctx, x, y, size, type, color) {
  ellipse(ctx, x + 11, y + 3, size * .95, size * .42, '#0c231c65');
  ctx.fillStyle = '#483e2f';
  ctx.fillRect(x - 3, y - size * .45, 6, size * .5);
  if (type === 0) {
    for (let i = 0; i < 3; i++) {
      const cy = y - i * size * .37;
      const r = size * (.66 - i * .11);
      ctx.beginPath();
      ctx.moveTo(x, cy - size * 1.02);
      ctx.lineTo(x + r, cy - 5);
      ctx.quadraticCurveTo(x, cy + size * .23, x - r, cy - 5);
      ctx.closePath();
      ctx.fillStyle = i === 0 ? '#1b382b' : color;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, cy - size * 1.02);
      ctx.lineTo(x + r, cy - 5);
      ctx.lineTo(x + 3, cy);
      ctx.fillStyle = '#0b201b45';
      ctx.fill();
    }
  } else {
    ellipse(ctx, x + 2, y - size * .63, size * .77, size * .67, '#244233');
    ellipse(ctx, x - size * .18, y - size * .91, size * .62, size * .53, color);
    ellipse(ctx, x - size * .35, y - size * 1.05, size * .3, size * .24, '#ecdfa722');
  }
}

function fort(ctx, x, y, size, gold) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ellipse(ctx, 5, 4, 65, 25, '#151e1cb0');
  ctx.fillStyle = '#48504a';
  ctx.fillRect(-45, -43, 90, 47);
  ctx.fillStyle = '#737c6b';
  ctx.fillRect(-45, -47, 90, 10);
  for (const side of [-1, 1]) {
    const tx = side * 47;
    ctx.fillStyle = '#646d61';
    ctx.fillRect(tx - 14, -61, 28, 66);
    ctx.fillStyle = '#818a76';
    for (let i = -1; i < 2; i++) ctx.fillRect(tx + i * 10 - 4, -67, 8, 12);
    ctx.fillStyle = '#272f29';
    ctx.fillRect(tx - 2, -48, 5, 14);
  }
  ctx.fillStyle = '#242b28';
  ctx.beginPath();
  ctx.roundRect(-10, -23, 20, 28, [10, 10, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#42392b';
  ctx.fillRect(4, -103, 3, 63);
  ctx.fillStyle = gold ? '#d9b05e' : '#a76a58';
  ctx.beginPath();
  ctx.moveTo(7, -102);
  ctx.lineTo(38, -100);
  ctx.lineTo(31, -91);
  ctx.lineTo(37, -83);
  ctx.lineTo(7, -86);
  ctx.fill();
  ctx.restore();
}

function machinery(ctx, { x, y, chapter, role }) {
  const neon = chapter === 4;
  const industrial = chapter >= 2;
  const light = ['#dbb681', '#eaa16e', '#9bd2c7', '#81d9c8', '#e99ad6'][chapter];
  const height = (role === 'boss' ? 210 : role === 'gate' ? 140 : 80) + chapter * 8;
  ctx.save();
  ctx.translate(x + 66, y - 55);
  ellipse(ctx, 28, 8, 95, 22, '#1a202bc2');
  ctx.fillStyle = industrial ? '#313042' : '#54483e';
  ctx.fillRect(-44, -height, 88, height);
  ctx.fillStyle = industrial ? '#48465e' : '#716051';
  ctx.fillRect(-44, -height, 61, height);
  ctx.fillStyle = '#262635';
  ctx.fillRect(-47, -height - 7, 95, 11);
  if (neon) {
    ctx.strokeStyle = light;
    ctx.lineWidth = 3;
    ctx.shadowColor = light;
    ctx.shadowBlur = 12;
    ctx.strokeRect(-37, -height + 8, 76, height - 15);
    ctx.shadowBlur = 0;
  }
  for (let yy = -height + 20; yy < -13; yy += 20) {
    for (let xx = -34; xx < 28; xx += 23) {
      ctx.fillStyle = light;
      ctx.fillRect(xx, yy, industrial ? 13 : 10, 5);
    }
  }
  ctx.fillStyle = '#38323b';
  ctx.fillRect(-19, -19, 24, 19);
  ctx.fillStyle = '#655653';
  ctx.fillRect(25, -height - 39, 15, 45);
  if (industrial) {
    ctx.strokeStyle = light;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(33, -height - 17);
    ctx.lineTo(33, -height - 67);
    ctx.stroke();
    ellipse(ctx, 33, -height - 68, 5, 5, light);
  } else {
    for (let i = 0; i < 4; i++) ellipse(ctx, 33 + i * 8, -height - 47 - i * 13, 8 + i * 4, 5 + i * 3, '#c6ab9455');
  }
  ctx.restore();
}

function water(ctx, x, height, random) {
  const riverX = y => x + Math.sin(y / 204) * 94 + Math.cos(y / 126) * 28;
  const bank = Array.from({ length: Math.ceil(height / 32) + 4 }, (_, i) => ({ x: riverX(i * 32 - 40), y: i * 32 - 40 }));
  route(ctx, bank);
  for (const [line, color] of [[108, '#283e39'], [88, '#a3946b'], [76, '#305358'], [61, '#386874'], [45, '#427886']]) {
    ctx.lineWidth = line;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  for (let i = 0; i < 180; i++) {
    const y = random() * height;
    const dx = (random() - .5) * 48;
    ctx.beginPath();
    ctx.moveTo(riverX(y) + dx, y);
    ctx.lineTo(riverX(y + 15) + dx, y + 15);
    ctx.strokeStyle = '#a2c8bf50';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  return riverX;
}

function bridgeDeck(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  x = 0;
  y = 0;
  ctx.fillStyle = '#252e28';
  ctx.fillRect(x - 57, y - 15, 114, 30);
  for (let i = -52; i < 53; i += 7) {
    ctx.fillStyle = i % 3 === 0 ? '#a0865b' : '#8a704c';
    ctx.fillRect(x + i, y - 11, 6, 22);
  }
  ctx.fillStyle = '#b59a6a';
  ctx.fillRect(x - 55, y - 14, 110, 3);
  ctx.fillRect(x - 55, y + 11, 110, 3);
  ctx.restore();
}

export function makeLandscape(map = makeWorld(null), seed = null) {
  const { width, height } = map;
  const scale = Math.min(.67, Math.sqrt(10000000 / (width * height)));
  const points = [map.start, ...map.world];
  const terrain = document.createElement('canvas');
  terrain.width = Math.ceil(width * scale);
  terrain.height = Math.ceil(height * scale);
  const ctx = terrain.getContext('2d');
  const random = randomSource(seed ?? 11813);
  ctx.scale(scale, scale);
  const future = map.act === 2;
  const biome = ctx.createLinearGradient(0, 0, width, height);
  const palette = future ? ['#695445', '#544d47', '#3c4950', '#373e51', '#493957'] : ['#406442', '#486b48', '#77764c', '#565e4e', '#3b4446'];
  palette.forEach((color, i) => biome.addColorStop(i / (palette.length - 1), color));
  ctx.fillStyle = biome;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 180; i++) {
    const x = random() * width;
    const y = random() * height;
    const r = 80 + random() * 340;
    const patch = ctx.createRadialGradient(x, y, r * .15, x, y, r);
    patch.addColorStop(0, i % 2 ? '#202f2b82' : '#a39d645a');
    patch.addColorStop(1, '#0000');
    ctx.fillStyle = patch;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 12000; i++) {
    const x = random() * width;
    const y = random() * height;
    ctx.fillStyle = i % 3 ? '#e3d39c24' : '#0a211934';
    ctx.fillRect(x, y, 1 + random() * 5, 1 + random() * 3);
  }
  const colors = { knight: '#a6b1a24c', beast: '#753a385d', myth: '#6cad6f62',
    guild: '#b38c514c', steam: '#be765462', electric: '#4babaf72', cyber: '#a465b390' };
  for (const { x, y, faction } of map.world) {
    const patch = ctx.createRadialGradient(x, y, 48, x, y, 292);
    patch.addColorStop(0, colors[faction]);
    patch.addColorStop(1, '#0000');
    ctx.fillStyle = patch;
    ctx.fillRect(x - 292, y - 292, 584, 584);
  }
  for (const edge of map.roads) road(ctx, edge, 28);
  if (future) {
    for (const [a, b] of map.roads) {
      if (a.chapter < 2 || b.chapter < 2) continue;
      const mid = roadControl(a, b);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mid.x, mid.y, b.x, b.y);
      ctx.strokeStyle = a.chapter === 4 && b.chapter === 4 ? '#ef9dd97a' : '#82d4c986';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }
  for (const point of points) {
    ellipse(ctx, point.x, point.y, 69, 42, '#222e2488');
    ellipse(ctx, point.x, point.y - 4, 60, 34, '#b2a27363');
  }
  const rivers = [.22, .49, .76].map(ratio => water(ctx, ratio * width, height, random));
  const roadSamples = map.roads.map(([a, b]) => Array.from({ length: 21 }, (_, i) => roadPosition(a, b, i / 20)));
  for (const samples of roadSamples) {
    for (const river of rivers) {
      for (let i = 1; i < samples.length; i++) {
        const a = samples[i - 1];
        const b = samples[i];
        if ((a.x - river(a.y)) * (b.x - river(b.y)) >= 0) continue;
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        bridgeDeck(ctx, river((a.y + b.y) / 2), (a.y + b.y) / 2, angle);
      }
    }
  }
  const safeAreas = [...points, ...roadSamples.flat()];
  const plants = [];
  for (let i = 0; i < 8500; i++) {
    const x = random() * width;
    const y = random() * height;
    if (rivers.some(river => Math.abs(river(y) - x) < 61)) continue;
    if (safeAreas.some(p => Math.abs(p.x - x) < 62 && Math.abs(p.y - y) < 58)) continue;
    const density = (Math.sin(x / 118) + Math.cos(y / 100) + 2) / 4;
    if (random() > density * .65) continue;
    plants.push({ x, y, size: 9 + random() * 26, type: random() > .48 ? 0 : 1, tone: Math.floor(random() * 3) });
  }
  const shades = [
    ['#51734a', '#3f694a', '#5c7b49'], ['#757644', '#67824f', '#a0914f'],
    ['#5e6656', '#53614f', '#75816e'], ['#66594c', '#53574a', '#87725b'],
  ];
  plants.sort((a, b) => a.y - b.y);
  for (const { x, y, size, type, tone } of plants) {
    const shade = shades[Math.min(3, Math.floor(x / 2350))][tone];
    if (future || (x > 4200 && tone === 0)) {
      ellipse(ctx, x + 7, y + 3, size * .9, size * .4, '#232d2a86');
      if (future) {
        ctx.fillStyle = tone === 0 ? '#6a5e63' : '#4c4854';
        ctx.fillRect(x - size * .5, y - size * 1.1, size, size * 1.1);
        ctx.fillStyle = tone === 2 ? '#b29ace' : '#ab8c69';
        ctx.fillRect(x - size * .35, y - size * .7, size * .50, size * .12);
      } else {
        ellipse(ctx, x, y, size * .7, size * .52, '#767567');
        ellipse(ctx, x - 4, y - 4, size * .5, size * .36, '#919083');
      }
    } else {
      tree(ctx, x, y, size, type, shade);
    }
  }
  for (const point of map.world) {
    if (future) machinery(ctx, point);
    else if (['gate', 'boss'].includes(point.role)) {
      fort(ctx, point.x + 68, point.y - 80, point.role === 'boss' ? 1.9 : .86, point.chapter === 4);
    }
  }
  return { canvas: terrain, width, height };
}

export function drawLandscape(ctx, { canvas, width, height }, cx, cy, zoom, viewportWidth, viewportHeight) {
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height,
    viewportWidth / 2 - cx * zoom, viewportHeight / 2 - cy * zoom, width * zoom, height * zoom);
}
