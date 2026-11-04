import { duel, weaponNames } from './world.mjs';

const ink = '#25231c';
const glove = '#f5e4bd';
const skin = '#e9b88b';
const pale = '#fff1c8';
const coats = ['#8d573e', '#52697b', '#8c413d'];
const hair = ['#5b3529', '#583728', '#382a25'];
const complexions = { hero: skin, rival: '#cb976e', guard: '#d2a17d', brute: '#ad7856', boss: '#ce9b75', princess: skin,
  fiend: '#b66b58', faun: '#c6a47b', griffin: '#c7baa0', automaton: '#b7a282', cyborg: '#b5a9be' };
const creatureCoats = { fiend: '#683d41', faun: '#537654', griffin: '#626a55', automaton: '#706b58', cyborg: '#594769' };
const profiles = {
  hero: 'M -9 -94 Q 2 -100 12 -93 Q 17 -89 16 -82 L 17 -76 Q 15 -69 8 -67 L 2 -67 Q -9 -70 -12 -80 L -11 -88 Z',
  rival: 'M -11 -94 Q 0 -101 11 -94 Q 15 -90 15 -82 L 16 -75 Q 14 -68 4 -68 L -4 -70 Q -13 -76 -13 -84 Z',
  guard: 'M -12 -94 Q -2 -99 12 -94 Q 17 -89 16 -83 L 16 -75 Q 13 -67 7 -67 L -1 -68 Q -12 -72 -13 -83 Z',
  brute: 'M -13 -94 Q -1 -102 13 -94 Q 18 -88 16 -81 L 19 -73 Q 17 -66 7 -66 L -4 -68 Q -15 -73 -15 -83 Z',
  boss: 'M -13 -94 Q 1 -102 13 -93 Q 17 -89 16 -82 L 18 -73 Q 16 -66 6 -66 L -4 -68 Q -15 -73 -14 -84 Z',
  princess: 'M -8 -94 Q 2 -101 12 -93 Q 18 -88 17 -79 Q 17 -73 11 -69 Q 1 -64 -7 -71 Q -13 -76 -12 -87 Z',
};
const shapes = new Map();

function path(ctx, geometry, fill, line = 2.2) {
  if (!shapes.has(geometry)) shapes.set(geometry, new Path2D(geometry));
  const outline = shapes.get(geometry);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill(outline);
  }
  if (line > 0) {
    ctx.lineWidth = line;
    ctx.strokeStyle = ink;
    ctx.stroke(outline);
  }
}

function oval(ctx, x, y, rx, ry, color, line = 2.2) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  if (line > 0) {
    ctx.lineWidth = line;
    ctx.strokeStyle = ink;
    ctx.stroke();
  }
}

function limb(ctx, x, y, bendX, bendY, tipX, tipY, color, thickness) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(bendX, bendY, tipX, tipY);
  ctx.lineWidth = thickness + 3;
  ctx.strokeStyle = ink;
  ctx.stroke();
  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function hands(ctx, x, y, waving, color) {
  oval(ctx, x, y, 5.6, 4.5, color);
  oval(ctx, x + 3, y - 2, 2.3, 2.7, color, 1.3);
  if (waving) {
    oval(ctx, x + 1, y - 4, 3.8, 5, glove, 1.5);
  }
  ctx.strokeStyle = '#815d42';
  ctx.lineWidth = .7;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 1);
  ctx.lineTo(x + 3, y - 1);
  ctx.stroke();
}

function creatureFace(ctx, variant, tone, time, expression) {
  const fierce = variant === 'fiend';
  const faun = variant === 'faun';
  if (variant === 'automaton' || variant === 'cyborg') {
    const chrome = variant === 'cyborg';
    path(ctx, 'M -15 -94 L -4 -102 L 12 -101 L 21 -91 L 21 -76 L 11 -67 L -5 -67 L -15 -78 Z', tone);
    path(ctx, 'M -11 -95 L 2 -99 L 14 -96 L 19 -89 L 17 -82 L -12 -82 Z', chrome ? '#393041' : '#44463d', 1.6);
    path(ctx, 'M -6 -72 L -2 -77 L 12 -77 L 16 -72 L 10 -69 L 0 -69 Z', '#4e4647', 1.4);
    const glow = chrome ? '#f2a3e3' : '#9ee3ce';
    if (expression !== 'hurt') {
      oval(ctx, 2, -88, 3.1, 2.7, glow, .8);
      oval(ctx, 12, -88, 3.1, 2.7, glow, .8);
    }
    oval(ctx, -10, -83, 4.2, 5, '#746a62', 1.25);
    if (chrome) path(ctx, 'M -14 -97 L -10 -109 L -5 -106 L -4 -101 M 11 -101 L 17 -109 L 19 -96', '#856b92', 1.5);
    return;
  }
  if (fierce) {
    path(ctx, 'M -15 -93 Q -33 -95 -27 -117 Q -21 -106 -10 -103 M 8 -101 Q 20 -104 24 -119 Q 29 -104 19 -94', '#6f5450', 2.3);
    path(ctx, 'M -22 -87 L -15 -101 Q -3 -106 9 -100 L 21 -96 L 23 -85 L 17 -80 L 23 -72 L 11 -66 L -10 -69 L -20 -79 Z', tone);
    path(ctx, 'M -15 -99 L -10 -86 M -2 -103 L 1 -93 M 8 -101 L 12 -93', null, 1.25);
    path(ctx, 'M 3 -75 L 18 -76 L 16 -69 L 7 -68 Z', '#462d2d', 1.45);
    path(ctx, 'M 4 -73 L 6 -82 L 9 -73 M 14 -75 L 18 -83 L 19 -75', '#e9d7ad', 1.3);
  } else if (faun) {
    limb(ctx, -9, -94, -11, -106, -22, -115, '#9b7856', 2.6);
    limb(ctx, 8, -96, 13, -110, 22, -116, '#9b7856', 2.6);
    limb(ctx, -14, -107, -10, -109, -11, -118, '#9b7856', 1.8);
    limb(ctx, 13, -107, 15, -114, 16, -120, '#9b7856', 1.8);
    path(ctx, 'M -10 -92 L -31 -101 Q -28 -87 -14 -83 M 10 -94 L 27 -103 Q 24 -89 17 -85', '#a58262', 2);
    path(ctx, 'M -15 -86 Q -19 -101 -4 -102 Q 15 -102 18 -89 L 21 -78 Q 26 -72 17 -68 L -2 -70 Q -13 -73 -15 -86 Z', tone);
    path(ctx, 'M 7 -79 Q 15 -83 22 -78 L 24 -75 Q 22 -68 13 -70 L 6 -73 Z', '#e8d0a4', 1.45);
    oval(ctx, 19, -77, 4.3, 2.6, '#5d443a', 1);
  } else {
    path(ctx, 'M -14 -93 L -28 -105 Q -18 -105 -16 -115 L -9 -106 L 1 -114 L 7 -100 Z', '#8d9d7d', 2.2);
    path(ctx, 'M -16 -86 Q -20 -103 -3 -104 Q 10 -103 16 -93 L 21 -81 L 15 -71 L -1 -69 L -11 -73 Z', tone);
    path(ctx, 'M 7 -86 Q 16 -91 24 -84 L 31 -77 L 22 -76 L 20 -70 L 13 -75 Z', '#d7a65c', 1.8);
  }
  const narrow = expression === 'effort' || time % 4.2 > 3.98;
  const injured = expression === 'hurt';
  if (injured) {
    path(ctx, 'M -1 -84 L 4 -83 M 8 -86 L 12 -85', null, 1.5);
  } else {
    oval(ctx, 2, -85, 3.7, narrow ? 1.9 : 3.1, fierce ? '#f2bc6c' : '#f3e0af', 1.2);
    oval(ctx, 11, -87, 3, narrow ? 1.6 : 2.5, fierce ? '#f2bc6c' : '#f3e0af', 1.2);
    oval(ctx, 3, -85, 1.1, 1.8, ink, 0);
    oval(ctx, 12, -87, 1, 1.65, ink, 0);
    path(ctx, 'M -4 -90 L 5 -87 M 8 -89 L 15 -91', null, 1.2);
  }
}

function face(ctx, variant, motion, smiling, flirt, expression) {
  const princess = variant === 'princess';
  const tone = complexions[variant];
  if (creatureCoats[variant]) {
    creatureFace(ctx, variant, tone, motion, expression);
    return;
  }
  const color = hair[variant === 'boss' ? 2 : princess ? 0 : 1];
  oval(ctx, -2, -82, princess ? 16 : 14, princess ? 20 : 14, color);
  oval(ctx, -11, -80, 3.9, 5.2, tone, 1.65);
  path(ctx, profiles[variant], tone);
  path(ctx, 'M -11 -81 Q -8 -83 -9 -78', null, .9);
  if (princess) {
    path(ctx, 'M -13 -86 Q -19 -90 -12 -99 Q -1 -108 13 -100 Q 21 -96 16 -87 Q 8 -97 2 -94 Q -3 -88 -13 -86 Z', color);
    oval(ctx, -13, -75, 4, 7, color);
    oval(ctx, -11, -72, 2.6, 2.6, '#f8d670', 1);
    path(ctx, 'M -6 -100 L -8 -110 L -1 -107 L 3 -114 L 8 -107 L 15 -110 L 12 -100 Z', '#eec168', 1.7);
  } else if (variant === 'boss') {
    path(ctx, 'M -15 -92 L -17 -106 L -8 -103 L -2 -113 L 5 -105 L 14 -112 L 16 -96 Z', '#e8b451', 2.3);
    path(ctx, 'M -9 -75 Q -2 -79 5 -75 Q 13 -79 17 -76 Q 13 -68 4 -70 Q -4 -68 -9 -75 Z', color, 1.3);
  } else if (variant === 'guard') {
    path(ctx, 'M -15 -85 Q -21 -99 -6 -104 Q 10 -110 18 -93 L 19 -86 L 12 -89 L 12 -94 L -9 -90 L -9 -84 Z', '#71777c');
    path(ctx, 'M -9 -97 Q 1 -103 10 -98', null, 1.2);
  } else if (variant === 'brute') {
    path(ctx, 'M -16 -86 Q -22 -94 -11 -100 L 10 -102 Q 22 -97 20 -88 L 17 -84 L 12 -91 L -14 -87 Z', '#62403b');
    path(ctx, 'M -15 -97 Q -20 -97 -23 -106 Q -13 -103 -7 -99 M 11 -100 Q 16 -102 21 -107 Q 21 -99 16 -95', '#d8c3a2', 1.6);
  } else {
    path(ctx, 'M -15 -88 Q -19 -95 -10 -101 Q -1 -108 10 -101 Q 16 -99 17 -94 Q 24 -95 24 -92 Q 19 -87 9 -91 Q 1 -90 -15 -88 Z', variant === 'hero' ? '#ad844d' : '#927050');
  }
  if (variant === 'guard' || variant === 'brute') {
    path(ctx, 'M -7 -75 Q -1 -71 3 -72 Q 9 -69 15 -73 Q 14 -66 6 -66 L -2 -68 Q -7 -70 -7 -75 Z', color, 1);
  } else if (variant === 'rival') {
    path(ctx, 'M 1 -76 Q 5 -79 8 -76 Q 11 -78 15 -76 Q 12 -72 8 -74 Q 4 -73 1 -76 Z', color, 1);
  }
  const blink = motion % 4.13 > 3.98;
  if (flirt > .6) {
    oval(ctx, 1, -82, 3.2, 3.1, pale, 1.15);
    oval(ctx, 9, -83, 2.9, 2.8, pale, 1.15);
    oval(ctx, 0, -82, 1.3, 1.65, ink, 0);
    oval(ctx, 8, -83, 1.25, 1.5, ink, 0);
    path(ctx, 'M -3 -84 Q 0 -86 4 -84 M 5 -85 Q 9 -87 12 -85 L 14 -87', null, 1.5);
  } else if (blink || expression === 'hurt') {
    path(ctx, 'M -2 -82 L 3 -81 M 8 -82 L 13 -82', null, 1.5);
  } else {
    const focused = expression === 'effort';
    oval(ctx, 1, -83, 3.5, focused ? 2.6 : 3.7, pale, 1.16);
    oval(ctx, 9, -84, 2.9, focused ? 2.45 : 3.4, pale, 1.16);
    oval(ctx, 2.2, -83, 1.25, focused ? 1.5 : 2.2, ink, 0);
    oval(ctx, 10, -84, 1.17, focused ? 1.4 : 2.1, ink, 0);
    path(ctx, focused ? 'M -3 -89 L 4 -86 M 6 -87 L 12 -89' : 'M -3 -88 Q 0 -90 4 -88 M 6 -89 Q 9 -91 12 -89', null, 1.1);
  }
  path(ctx, 'M 11 -84 Q 13 -83 13 -81 L 16 -79 Q 17 -77 12 -77 L 10 -78', tone, 1.24);
  if (variant !== 'boss') {
    const mouth = flirt > .6 ? 'M 3 -75 Q 6 -76 8 -74 Q 11 -77 13 -76 Q 9 -70 4 -72 Z'
      : expression === 'hurt' ? 'M 4 -73 Q 7 -76 10 -74 Q 12 -70 7 -70 Z'
        : smiling ? 'M 3 -74 Q 8 -71 13 -75 Q 9 -69 5 -71 Z' : 'M 3 -73 Q 8 -75 12 -73';
    path(ctx, mouth, flirt > .6 ? '#9e4558' : smiling ? '#773d35' : null, 1.15);
  }
  if (princess) oval(ctx, -2, -77, 2.5, 1.5, '#d48179', 0);
}

const techColors = ['#edbb80', '#f1a16c', '#9aefdc', '#8cd7fd', '#f3acec'];

function drawTechWeapon(ctx, weapon, tech, drive, pull, loaded) {
  const glow = techColors[tech] ?? techColors[4];
  const steel = '#aab6bc';
  const shell = '#4c5664';
  if (weapon === 'sword') {
    path(ctx, 'M -7 -3 L 10 -3 L 10 3 L -7 3 Z M 7 -9 L 12 -8 L 12 9 L 7 9 Z', shell);
    path(ctx, 'M 12 -7 L 37 -7 L 51 -1 L 44 5 L 14 5 Z', steel);
    path(ctx, 'M 15 -2 L 42 -2 L 46 0 L 17 2 Z', glow, 0);
  } else if (weapon === 'axe') {
    path(ctx, 'M -14 -3 L 46 -3 L 46 4 L -14 4 Z M 4 -6 L 28 -6 L 28 6 L 4 6 Z', shell);
    path(ctx, 'M 33 -4 L 37 -12 L 56 -19 L 63 -14 L 65 -3 L 60 7 L 51 9 L 43 3 L 36 3 Z', steel);
    path(ctx, 'M 50 -13 L 56 -16 L 61 -12 L 62 -4 L 57 4 L 52 2 Z', glow, 1);
    ctx.save();
    ctx.translate(drive * 8, 0);
    path(ctx, 'M 10 -2 L 22 -2 L 22 2 L 10 2 Z', glow, 0);
    ctx.restore();
  } else if (weapon === 'bow') {
    path(ctx, 'M -26 2 L -17 -7 L 34 -7 L 41 -2 L 41 4 L 6 4 L 3 11 L -5 11 L -7 5 L -25 6 Z', shell);
    path(ctx, 'M 10 -7 L 7 -15 L 16 -20 L 27 -17 L 29 -13 L 21 -12 L 18 -5 Z', steel, 1.65);
    path(ctx, 'M 11 -3 L 35 -3 L 36 1 L 11 1 Z', glow, 0);
    for (const offset of [0, 7, 14]) {
      oval(ctx, -15 + offset, -2, 1.7, 1.7, glow, 0);
    }
    if (loaded) {
      ctx.save();
      ctx.translate(-pull * 17, 0);
      path(ctx, 'M 23 -3 L 44 -3 L 51 -1 L 44 1 L 23 1 Z', steel, 1);
      ctx.restore();
    }
  } else if (weapon === 'spear') {
    path(ctx, 'M -24 -3 L 39 -3 L 39 3 L -24 3 Z M -12 -6 L 27 -6 L 27 6 L -12 6 Z', shell);
    path(ctx, 'M 22 -4 L 48 -4 L 48 4 L 22 4 Z', steel, 1.5);
    ctx.save();
    ctx.translate(drive * 18, 0);
    path(ctx, 'M 26 -2 L 58 -2 L 58 2 L 26 2 Z', shell, 1.5);
    path(ctx, 'M 51 -5 L 65 -7 L 76 0 L 65 7 L 51 5 Z', steel, 1.5);
    path(ctx, 'M 54 -1 L 69 -1 L 72 0 L 68 2 L 54 2 Z', glow, 0);
    ctx.restore();
  } else {
    if (drive > .08) {
      ctx.save();
      ctx.globalAlpha *= Math.min(.92, drive);
      ctx.scale(.7 + drive * .4, 1);
      path(ctx, 'M -20 -5 L -52 -9 L -70 0 L -50 8 L -20 4 Z', glow, 0);
      path(ctx, 'M -20 -2 L -44 -3 L -57 0 L -38 3 L -20 2 Z', '#ffefcc', 0);
      ctx.restore();
    }
    path(ctx, 'M -31 -7 L 18 -5 L 18 5 L -31 8 L -25 0 Z', shell);
    path(ctx, 'M 13 -7 L 73 -4 L 94 0 L 73 4 L 13 7 Z', steel);
    path(ctx, 'M 23 -3 L 70 -2 L 81 0 L 67 2 L 23 3 Z', glow, 0);
    path(ctx, 'M -15 -4 L -7 -4 L -8 4 L -16 5 Z', glow, 0);
  }
}

function drawWeapon(ctx, weapon, x, y, angle, draw, loaded, tech, drive) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (tech != null) {
    drawTechWeapon(ctx, weapon, tech, drive, draw, loaded);
  } else if (weapon === 'bow') {
    limb(ctx, -5, -26, 23, 0, -5, 26, '#a16c42', 4);
    ctx.beginPath();
    ctx.moveTo(-5, -26);
    ctx.lineTo(-3 - draw * 25, 0);
    ctx.lineTo(-5, 26);
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = '#f1dab3';
    ctx.stroke();
    if (loaded) {
      ctx.translate(-draw * 22, 0);
      path(ctx, 'M -4 -1 L 28 -1 L 28 1 L -4 1 Z M 27 -4 L 35 0 L 27 4 Z', '#d8d3b2', 1);
    }
  } else if (weapon === 'axe') {
    path(ctx, 'M -13 -2 L 48 -2 L 48 3 L -13 3 Z', '#a37047', 1.7);
    path(ctx, 'M 38 -5 L 40 -13 Q 48 -19 59 -19 Q 64 -8 61 5 Q 53 5 48 1 L 39 2 Z', '#bfcad1', 2);
    path(ctx, 'M 58 -16 Q 61 -8 59 1', null, .8);
  } else if (weapon === 'spear') {
    path(ctx, 'M -23 -2 L 61 -2 L 61 2 L -23 2 Z', '#a7754b', 1.5);
    path(ctx, 'M 58 -4 L 69 -6 L 82 0 L 69 6 L 58 4 Z', '#c5d0d3', 1.7);
    path(ctx, 'M 63 0 L 77 0', null, .75);
  } else if (weapon === 'lance') {
    path(ctx, 'M -25 -3 L 8 -3 L 12 -5 L 93 0 L 12 5 L 8 3 L -25 3 Z', '#cfba83', 1.7);
    path(ctx, 'M 75 -1 L 93 0 L 75 1 Z', '#e2e9e4', 1);
    path(ctx, 'M 18 2 L 37 3 L 33 13 L 25 9 L 18 12 Z', '#a1524d', 1.3);
  } else {
    path(ctx, 'M -4 -3 L 8 -3 L 8 3 L -4 3 Z', '#b79054', 1.7);
    path(ctx, 'M 8 -5 L 40 -4 L 51 0 L 40 4 L 8 5 Z', '#dce0d3', 2);
    path(ctx, 'M 12 0 L 45 0', null, .75);
  }
  ctx.restore();
}

function weaponGrip({ time, step, gesture, weapon, variant }) {
  const sway = Math.sin(time * 3.5);
  const feet = Math.sin(time * 13) * step * 13;
  const bounce = -Math.abs(Math.cos(time * 13)) * step * 6 + sway * (1 - step) * 1.8;
  const x = 24 + feet * .46 + gesture * (weapon === 'spear' || weapon === 'lance' ? 17 : 10);
  const y = -39 - gesture * 22 + (variant === 'princess' ? 0 : sway * 2);
  return { sway, feet, bounce, x, y };
}

function weaponPoint(pose, distance) {
  const grip = weaponGrip(pose);
  const x = grip.x + Math.cos(pose.angle) * distance;
  const y = grip.bounce + grip.y + Math.sin(pose.angle) * distance;
  const cos = Math.cos(pose.lean);
  const sin = Math.sin(pose.lean);
  return { x: pose.x + (pose.flip ? -pose.size : pose.size) * (x * cos - y * sin),
    y: pose.y + pose.size * pose.squash * (x * sin + y * cos) };
}

export function character(ctx, { x, y, size = 1, variant = 'hero', time = 0, step = 0, gesture = 0, flip = false, smile = true,
  weapon, angle = 0, pull = 0, loaded = false, combat = false, expression, lean = 0, squash = 1, flirt = 0, tech = null, drive = 0 }) {
  const armoredRival = variant === 'rival-armored';
  if (armoredRival) variant = 'brute';
  const princess = variant === 'princess';
  const king = variant === 'boss';
  const guard = variant === 'guard';
  const brute = variant === 'brute';
  const hero = variant === 'hero';
  const creature = creatureCoats[variant];
  const tone = complexions[variant];
  const hand = hero || princess ? glove : tone;
  const coat = armoredRival ? '#813f45' : creature ?? (princess ? '#9a4960' : king ? '#7f3d43' : hero ? '#9b774c' : coats[brute ? 2 : guard ? 1 : 0]);
  const { sway, feet, bounce, x: rightX, y: rightY } = weaponGrip({ time, step, gesture, weapon, variant });
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -size : size, size * squash);
  ctx.rotate(lean);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  oval(ctx, 1, 2, princess ? 27 : 22, 4.5, '#251a245a', 0);
  ctx.translate(0, bounce);
  if (variant === 'fiend') {
    limb(ctx, -12, -34, -45, -11, -56, -27 + sway * 5, '#8d5350', 7);
    ctx.save();
    ctx.translate(-54, -27 + sway * 5);
    path(ctx, 'M 1 3 Q -8 7 -15 -4 L -5 -8 L -5 -3 Z', '#93604d', 1.5);
    ctx.restore();
  } else if (variant === 'griffin') {
    ctx.save();
    ctx.translate(-8, -55);
    ctx.rotate(sway * .10 - step * .13);
    path(ctx, 'M -3 9 Q -38 -7 -49 -35 Q -59 -22 -49 -5 L -62 -14 Q -61 0 -43 12 L -51 10 Q -43 23 -24 28 L -2 22 Z', '#8f9275', 2.4);
    path(ctx, 'M -46 -16 Q -36 7 -20 15 M -39 6 Q -31 19 -20 22', null, 1.1);
    ctx.restore();
  }
  if (princess) {
    path(ctx, 'M -12 -62 Q -25 -60 -22 -49 L -17 -43 L -10 -49 L 12 -51 Q 17 -48 21 -54 Q 21 -62 12 -64 Z', '#b56a7a');
    path(ctx, 'M -10 -60 Q 0 -54 12 -62 L 17 -53 Q 18 -43 10 -38 L -10 -38 Q -17 -51 -10 -60 Z', skin, 1.65);
    path(ctx, 'M -13 -53 Q -8 -54 -3 -51 Q 1 -49 3 -45 Q 5 -50 12 -54 Q 20 -55 21 -50 Q 22 -46 16 -42 L 10 -34 Q 13 -23 29 -7 Q 34 -2 38 0 Q 9 10 -34 0 Q -31 -5 -29 -10 Q -15 -25 -10 -35 Q -12 -43 -16 -47 Q -19 -51 -13 -53 Z', coat, 2.5);
    path(ctx, 'M -9 -35 Q 0 -31 10 -35 M -11 -28 Q -11 -12 -20 -1 M 0 -26 Q -1 -10 -3 3 M 10 -28 Q 16 -11 23 2', null, 1.2);
    path(ctx, 'M -29 -4 Q 5 4 33 -3 Q 36 0 38 0 Q 9 10 -34 0 Z', '#d7a064', 1.2);
    path(ctx, 'M -4 -68 L 7 -69 L 8 -61 Q 4 -58 -3 -61 Z', skin, 1.4);
    path(ctx, 'M -5 -61 Q 2 -58 10 -62', null, 1.2);
    oval(ctx, 3, -58, 2.2, 2.2, '#edc368', 1);
  } else {
    const build = variant === 'fiend' ? 1.32 : brute ? 1.33 : king ? 1.14 : 1;
    for (const side of [-1, 1]) {
      const off = feet * side;
      limb(ctx, side * 7, -33, side * 10 + off * .55, -18, side * 10 + off, -4 - Math.max(0, off * .32),
        side === -1 ? '#5a5141' : '#71614c', brute ? 9.2 : 7.6);
      limb(ctx, side * 10 + off * .78, -10, side * 10 + off * .9, -6, side * 10 + off, -3 - Math.max(0, off * .32), '#44372e', 7);
      const footX = side * 9 + off + 3;
      const footY = -1 - Math.max(0, off * .32);
      if (creature) {
        ctx.save();
        ctx.translate(footX, footY);
        path(ctx, variant === 'griffin' ? 'M -8 3 L -7 -3 L 4 -4 L 12 -1 L 12 3 L 8 2 L 3 4 Z'
          : 'M -7 3 L -9 -4 L 3 -5 L 10 -1 L 10 3 Z M 5 0 L 5 3', '#483a35', 1.8);
        ctx.restore();
      } else {
        oval(ctx, footX, footY, 8, 3.8, '#48382e');
      }
    }
    ctx.save();
    ctx.scale(build, 1);
    if (king) path(ctx, 'M -12 -62 Q -22 -50 -24 -10 Q -5 -1 24 -9 Q 18 -33 13 -61 Z', '#713b42');
    path(ctx, 'M -14 -64 Q -22 -61 -17 -48 L -13 -32 Q -5 -27 15 -31 L 17 -48 Q 22 -59 12 -64 Z', coat);
    path(ctx, 'M -6 -71 L 8 -71 L 10 -63 L 1 -59 L -7 -64 Z', tone, 1.55);
    path(ctx, 'M -12 -62 L -5 -66 L 1 -59 L -5 -54 Z M 8 -66 L 13 -62 L 7 -54 L 1 -59 Z', '#d0bc89', 1.1);
    path(ctx, 'M -9 -60 L -2 -54 L -4 -36 M 6 -60 L 2 -55 L 2 -36', null, 1.15);
    path(ctx, 'M -13 -40 Q 1 -37 16 -41 L 15 -36 Q 4 -32 -13 -35 Z', '#513e32', 1.25);
    oval(ctx, 4, -36.5, 3.5, 2.7, '#e9c572', 1);
    if (hero) path(ctx, 'M -11 -51 L -7 -53 L -5 -48 L -10 -47 Z', '#c2a96d', 1);
    if (guard) path(ctx, 'M -11 -63 L -18 -59 L -18 -54 L -12 -55 M 11 -63 L 17 -62 L 19 -55 L 13 -55', '#a4a29a', 1.5);
    if (armoredRival) {
      path(ctx, 'M -21 -59 L -18 -68 L -7 -68 L -3 -59 L -7 -53 L -18 -54 Z M 11 -68 L 20 -67 L 24 -59 L 20 -53 L 11 -54 Z', '#788393', 1.9);
      path(ctx, 'M -12 -59 L 1 -55 L 13 -60 L 15 -52 L 11 -43 L -10 -43 L -14 -52 Z', '#5a6375', 1.6);
      path(ctx, 'M -8 -53 L 1 -50 L 10 -54 L 9 -50 L 1 -47 L -8 -49 Z', '#f1a085', 0);
    }
    if (creature) {
      path(ctx, variant === 'fiend' ? 'M -16 -57 L -24 -68 L -11 -61 L -7 -54 Z M 12 -56 L 24 -69 L 18 -54 Z'
        : 'M -17 -53 Q -27 -59 -22 -66 Q -12 -67 -7 -55 Z M 7 -55 Q 15 -68 25 -62 Q 21 -51 10 -48 Z',
      variant === 'fiend' ? '#a37260' : '#a4ad72', 1.55);
    }
    ctx.restore();
  }
  const twoHands = combat && weapon && weapon !== 'sword';
  const grip = weapon === 'bow' ? 4 + pull * 24 : 15;
  const leftX = twoHands ? rightX - Math.cos(angle) * grip : -20 + feet * .35 + flirt * 5;
  const leftY = twoHands ? rightY - Math.sin(angle) * grip : -40;
  limb(ctx, -12, -59, twoHands ? -15 : -23, twoHands ? -43 : -51, leftX, leftY, princess ? tone : coat, 6.5);
  limb(ctx, 12, -58, 21, -49 + gesture * 5, rightX, rightY, princess ? tone : coat, 6.5);
  if (weapon) drawWeapon(ctx, weapon, rightX, rightY, angle, pull, loaded, tech, drive);
  hands(ctx, leftX, leftY, false, hand);
  hands(ctx, rightX, rightY, princess && gesture > .2, hand);
  if ((guard || king) && !twoHands) {
    path(ctx, 'M -27 -48 Q -21 -51 -16 -48 L -17 -36 Q -23 -31 -28 -37 Z', '#a4a096', 1.4);
    path(ctx, 'M -22 -47 L -22 -37 M -26 -43 L -18 -43', null, 1);
  }
  if (!weapon && hero && gesture > .2) {
    ctx.save();
    ctx.translate(rightX + 3, rightY - 1);
    oval(ctx, 0, -4, 4.5, 4.5, '#e9b553', 1.1);
    path(ctx, 'M 3 -6 L 12 -6 L 12 -3 L 10 -3 L 10 0 L 7 0 L 7 -3 L 3 -3 Z', '#e9b553', 1);
    ctx.restore();
  }
  ctx.save();
  if (!princess && !creature) {
    ctx.translate(0, -65);
    ctx.scale(brute || king ? .93 : .87, .90);
    ctx.translate(0, 65);
  }
  face(ctx, variant, time, smile, flirt, expression);
  if (armoredRival) {
    path(ctx, 'M -16 -92 L -20 -97 L -19 -106 L -7 -111 L 12 -109 L 22 -101 L 22 -94 L 13 -96 L 8 -101 L -8 -102 Z', '#667182', 2);
    path(ctx, 'M -14 -101 L -8 -106 L 10 -105 L 16 -101 L 10 -101 L 6 -103 L -8 -104 Z', '#efa087', 0);
    path(ctx, 'M -16 -93 L -12 -91 L -13 -85 L -18 -86 Z', '#a4aab2', 1.3);
  }
  ctx.restore();
  ctx.restore();
}

const ease = value => {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
};

const attacks = {
  sword: { reach: 111, ready: -.83, wind: 1.30, swing: 1.50, tempo: 245 },
  axe: { reach: 126, ready: -.94, wind: 2.00, swing: 1.81, tempo: 185 },
  spear: { reach: 50, ready: -.22, wind: .43, swing: .27, tempo: 160 },
  lance: { reach: 89, ready: -.38, wind: .48, swing: .41, tempo: 460 },
  bow: { reach: 0, ready: -.14, wind: .20, swing: .10, tempo: 230 },
};

function flyingArrow(ctx, startX, endX, t) {
  const x = startX + (endX - startX) * t;
  const y = 467 - Math.sin(t * Math.PI) * 27;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.cos(t * Math.PI) * -.12);
  path(ctx, 'M 76 0 Q 39 -5 13 -2 L 13 3 Q 41 3 76 0 Z', '#ffe4ac80', 0);
  path(ctx, 'M -20 -2 L 26 -2 L 26 2 L -20 2 Z M -18 2 L -25 7 L -29 4 L -25 0 L -29 -4 L -25 -7 L -18 -2 Z',
    '#ac7e50', 1.5);
  path(ctx, 'M -23 -6 L -35 0 L -23 6 L -26 0 Z', '#ded7b4', 1.4);
  ctx.restore();
}

function drawBolt(ctx, x, y, angle, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha *= alpha;
  path(ctx, 'M 8 -2 L 48 -1 L 68 0 L 48 2 L 8 3 Z', color, 0);
  path(ctx, 'M 0 0 L 10 -4 L 11 -2 L 31 -2 L 36 -4 L 37 4 L 31 2 L 11 2 L 10 4 Z', '#c7cdd2', 1.35);
  ctx.restore();
}

export function drawDuel(ctx, move, power, elapsed, act = 1) {
  const start = duel.approach;
  const veil = ease((elapsed - start) / 210);
  ctx.save();
  ctx.globalAlpha = veil;
  const backdrop = ctx.createRadialGradient(655, 420, 90, 655, 420, 760);
  backdrop.addColorStop(0, '#343022b5');
  backdrop.addColorStop(1, '#0e1514fa');
  ctx.fillStyle = backdrop;
  ctx.fillRect(0, 0, 1310, 820);
  oval(ctx, 655, 624, 469, 94, '#82715332', 0);
  oval(ctx, 655, 624, 420, 79, '#ab905038', 0);
  const weapon = move.weapon || 'sword';
  const style = attacks[weapon];
  const futuristic = act === 2;
  const tech = futuristic ? move.target.chapter : null;
  const glow = techColors[tech] ?? techColors[4];
  const ranged = weapon === 'bow';
  const polearm = weapon === 'spear' || weapon === 'lance';
  const approach = ease((elapsed - start) / 510);
  const sweep = (hit, attack = 280, recover = 360) =>
    ease((elapsed - hit + attack) / attack) * (1 - ease((elapsed - hit) / recover));
  const recoil = (hit, hold = 410) =>
    ease((elapsed - hit) / 105) * (1 - ease((elapsed - hit - 120) / hold));
  const first = sweep(duel.parry, style.tempo);
  const last = sweep(duel.strike, move.win ? (ranged ? 490 : 290) : style.tempo, 520);
  const fall = ease((elapsed - duel.strike - 85) / 570);
  const windup = hit => ease((elapsed - hit + 465) / 210) * (1 - ease((elapsed - hit + 175) / 250));
  const wobble = recoil(duel.parry);
  const feint = sweep(duel.parry + 565, 170, 220);
  const left = 319 + approach * 120 + first * (ranged ? 27 : polearm ? 75 : 95) - feint * 42 +
    (move.win ? last * (ranged ? 331 : polearm ? 189 : 143) : fall * -92);
  const right = 1001 - approach * (ranged ? 31 : 126) - first * style.reach +
    (move.win ? fall * (ranged ? 54 : 97) - (ranged ? last * 35 : 0) : last * -style.reach);
  const heroLunge = move.win ? last : 0;
  const enemyLunge = Math.max(first, move.win ? 0 : last);
  const heroBlade = -.72 - (move.win ? windup(duel.strike) * 1.2 : 0) - first * (ranged ? .89 : .51) +
    heroLunge * 1.22 + (futuristic ? wobble * .38 : 0);
  const enemyBlade = style.ready - Math.max(windup(duel.parry), move.win ? 0 : windup(duel.strike)) * style.wind + enemyLunge * style.swing;
  const shots = move.win ? [duel.parry] : [duel.parry, duel.strike];
  const draw = hit => ease((elapsed - hit + 695) / 400) * (1 - ease((elapsed - hit + 265) / 55));
  const pull = ranged ? Math.max(...shots.map(draw)) : 0;
  const heroStep = Math.max(1 - approach, feint * .76, heroLunge * (ranged ? .91 : .45));
  const heroPose = { x: left, y: 620, size: 2.83, time: elapsed / 1000, step: heroStep,
    gesture: heroLunge * .62 + first * (ranged ? .61 : .31), weapon: 'sword', angle: heroBlade, combat: true,
    lean: heroLunge * .18 - wobble * .10 - (move.win ? 0 : fall * .72),
    squash: (move.win ? 1 : 1 - fall * .24) * (futuristic && weapon === 'lance' ? 1 - first * .10 : 1),
    expression: !move.win && fall > .1 ? 'hurt' : 'effort', smile: false };
  const enemyPose = { x: right, y: 620, size: move.target.role === 'boss' ? 3.10 : 2.80,
    time: elapsed / 1000 + .2, step: Math.max(1 - approach, weapon === 'lance' ? enemyLunge * .82 : 0),
    variant: move.target.variant, flip: true,
    gesture: ranged ? .63 + pull * .28 : enemyLunge * .62, weapon, angle: ranged ? -.03 : enemyBlade,
    pull, loaded: pull > .025, combat: true, tech, drive: enemyLunge,
    lean: enemyLunge * (weapon === 'lance' ? .26 : ranged ? .055 : .19) - (move.win ? fall * .70 : 0),
    squash: move.win ? 1 - fall * .25 : 1, expression: move.win && fall > .1 ? 'hurt' : 'effort', smile: false };
  const guard = weaponPoint(heroPose, ranged ? 29 : futuristic && weapon === 'lance' ? 46 : 34);
  if (futuristic && !ranged) {
    // Bring the solid blade or shaft into contact with the hero's sword,
    // then release the alignment as the attacker recoils.
    const align = sweep(duel.parry, 218, 235);
    const reach = { sword: 48, axe: 55, spear: 68 + enemyLunge * 18, lance: 62 }[weapon];
    const grip = weaponPoint(enemyPose, 0);
    const rise = (guard.y - grip.y) / (reach * enemyPose.size * enemyPose.squash);
    const aim = Math.asin(Math.max(-.88, Math.min(.88, rise))) - enemyPose.lean;
    enemyPose.angle += (aim - enemyPose.angle) * align;
    const edge = weaponPoint(enemyPose, reach);
    enemyPose.x += (guard.x - edge.x) * align + wobble * 32 * (1 - align);
    enemyPose.y += (guard.y - edge.y) * align;
  }
  character(ctx, heroPose);
  character(ctx, enemyPose);
  if (ranged && futuristic) {
    const muzzle = weaponPoint(enemyPose, 41);
    for (const hit of shots) {
      const age = elapsed - hit;
      const target = hit === duel.parry ? guard : { x: left + 22, y: 478 };
      if (age >= -240 && age < 0) {
        const t = (age + 240) / 240;
        drawBolt(ctx, muzzle.x + (target.x - muzzle.x) * t,
          muzzle.y + (target.y - muzzle.y) * t - Math.sin(t * Math.PI) * 12,
          Math.atan2(muzzle.y - target.y, muzzle.x - target.x), glow);
      }
      if (hit === duel.parry && age >= 0 && age < 340) {
        const t = age / 340;
        drawBolt(ctx, guard.x + t * 180, guard.y - t * 137 + t * t * 32, 2.52 + t * 1.45, glow, 1 - t * .7);
      }
    }
  } else if (ranged) {
    for (const hit of shots) {
      const flight = (elapsed - hit + 225) / 225;
      if (flight >= 0 && flight <= 1) flyingArrow(ctx, right - 84, left + 103, flight);
    }
  }

  const parryCaption = futuristic ? (ranged ? 'BOLZEN ABGELENKT' : weapon === 'lance' ? 'LANZE ABGELEITET' : 'PARADE')
    : ranged ? 'PFEIL GEBLOCKT' : 'PARADE';
  for (const [hit, color, caption] of [[duel.parry, futuristic ? glow : '#ffeab2', parryCaption], [duel.strike, move.win ? '#ffd18c' : '#f7a58a', 'TREFFER']]) {
    const age = elapsed - hit;
    if (age < (futuristic && hit === duel.parry ? 0 : -112) || age > 490) continue;
    const atX = hit === duel.parry ? (futuristic ? guard.x : ranged ? left + 83 : 654) : move.win ? right - 86 : left + 78;
    const atY = hit === duel.parry ? (futuristic ? guard.y : 454) : 468;
    const t = Math.max(0, age / 490);
    ctx.save();
    ctx.globalAlpha = veil * (1 - t);
    ctx.translate(atX, atY);
    const enemyImpact = hit === duel.parry || !move.win;
    ctx.save();
    if (enemyImpact && weapon === 'axe') ctx.rotate(-1.24);
    if (enemyImpact && polearm) ctx.scale(1.12, .44);
    if (!enemyImpact || !ranged) {
      path(ctx, 'M -79 8 Q -17 -78 84 -20 Q -7 -42 -69 23 Z', color, 0);
      path(ctx, 'M -61 26 Q 0 -40 65 -21 Q -1 -24 -53 36 Z', '#fff2ca', 0);
    }
    ctx.restore();
    for (let i = 0; i < 11; i++) {
      const angle = i * (Math.PI * 2 / 11) + .26;
      ctx.save();
      ctx.rotate(angle);
      const distance = 18 + t * (75 + i * 3);
      ctx.beginPath();
      ctx.moveTo(distance, 0);
      ctx.lineTo(distance + 11, -3);
      ctx.lineTo(distance + 20, 0);
      ctx.lineTo(distance + 11, 3);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }
    ctx.font = '900 25px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.fillText(caption, 0, -85 - t * 15);
    ctx.restore();
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#edc982';
  ctx.font = '800 20px "Segoe UI", sans-serif';
  ctx.fillText(`${move.target.enemy.toUpperCase()}  ·  ${weaponNames(act)[weapon].toUpperCase()}`, 655, 116);
  ctx.font = 'bold 47px Georgia, serif';
  ctx.fillStyle = '#fff2d0';
  ctx.fillText(`${power.toLocaleString('de-DE')}  gegen  ${move.target.power.toLocaleString('de-DE')}`, 655, 175);
  ctx.restore();
}

const chambers = new Map();
function makeChamber(future = false) {
  const image = document.createElement('canvas');
  image.width = 1310;
  image.height = 820;
  const ctx = image.getContext('2d');
  const wash = ctx.createLinearGradient(0, 0, 0, 650);
  wash.addColorStop(0, '#261f2a');
  wash.addColorStop(1, '#5b4646');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 1310, 820);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#30262e';
  for (let row = 0; row < 9; row++) {
    for (let x = -80 - (row % 2) * 75; x < 1310; x += 150) {
      ctx.strokeRect(x, row * 68, 150, 68);
      ctx.fillStyle = ['#8e696326', '#c1926920', '#160f1920'][Math.abs(x + row * 23) % 3];
      ctx.fillRect(x + 3, row * 68 + 4, 144, 60);
    }
  }
  path(ctx, 'M 105 600 L 105 241 Q 121 117 245 83 Q 369 115 382 241 L 382 600 Z', '#292b3b', 9);
  path(ctx, 'M 128 594 L 128 244 Q 144 140 245 109 Q 346 138 359 244 L 359 594 Z', '#626f83', 5);
  oval(ctx, 258, 223, 47, 47, '#e0cca5', 0);
  oval(ctx, 274, 210, 40, 41, '#626f83', 0);
  path(ctx, 'M 128 452 Q 191 331 264 447 Q 304 341 359 423 L 359 594 L 128 594 Z', '#383f50', 0);
  path(ctx, 'M 245 109 L 245 596 M 128 303 L 359 303 M 128 441 L 359 441', null, 8);
  path(ctx, 'M 0 604 L 1310 604 L 1310 820 L 0 820 Z', '#695054', 6);
  for (let x = -150; x < 1550; x += 180) {
    ctx.beginPath();
    ctx.moveTo(655 + (x - 655) * .6, 605);
    ctx.lineTo(x, 820);
    ctx.strokeStyle = '#47363e';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  for (const y of [643, 704, 787]) {
    ctx.fillStyle = '#463840';
    ctx.fillRect(0, y, 1310, 4);
  }
  path(ctx, 'M 676 603 L 693 569 L 1008 569 L 1025 603 L 1033 634 L 664 634 Z', '#89726a', 6);
  path(ctx, 'M 699 587 L 699 310 Q 704 189 848 162 Q 995 187 1000 310 L 1000 587 Z', '#aa846b', 7);
  path(ctx, 'M 726 587 L 726 313 Q 736 211 848 191 Q 963 214 974 313 L 974 587 Z', '#362936', 5);
  const glow = ctx.createRadialGradient(849, 408, 24, 849, 408, 188);
  glow.addColorStop(0, '#c18a5c75');
  glow.addColorStop(1, '#c18a5c00');
  ctx.fillStyle = glow;
  ctx.fillRect(728, 230, 240, 356);
  const vignette = ctx.createRadialGradient(655, 370, 240, 655, 400, 775);
  vignette.addColorStop(0, '#20162400');
  vignette.addColorStop(1, '#201624db');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1310, 820);
  if (future) {
    ctx.fillStyle = '#39264885';
    ctx.fillRect(0, 0, 1310, 820);
    for (const [x, color] of [[82, '#aab3f0'], [405, '#d99cd8'], [693, '#87dcd1'], [1004, '#87dcd1'], [1165, '#d99cd8']]) {
      ctx.fillStyle = '#30243f';
      ctx.fillRect(x - 16, 130, 27, 470);
      ctx.shadowColor = color;
      ctx.shadowBlur = 19;
      ctx.fillStyle = color;
      ctx.fillRect(x - 4, 139, 5, 444);
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = '#b2dce0';
    ctx.font = '700 25px "Segoe UI", sans-serif';
    ctx.fillText('N E O N S P I T Z E', 1009, 219);
  }
  return image;
}

function chamberFor(future = false) {
  if (!chambers.has(future)) chambers.set(future, makeChamber(future));
  return chambers.get(future);
}

function gate(ctx, lift) {
  ctx.save();
  ctx.clip(new Path2D('M 726 588 L 726 313 Q 736 211 848 191 Q 963 214 974 313 L 974 588 Z'));
  ctx.translate(0, -lift);
  ctx.lineCap = 'round';
  for (let x = 728; x <= 974; x += 30) {
    ctx.strokeStyle = '#241e27';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(x, 186);
    ctx.lineTo(x, 589);
    ctx.stroke();
    ctx.strokeStyle = '#a38a73';
    ctx.lineWidth = 2.8;
    ctx.stroke();
  }
  path(ctx, 'M 719 447 L 979 447 M 719 568 L 979 568', null, 13);
  path(ctx, 'M 737 427 L 767 427 L 767 454 L 737 454 Z', '#d4a456', 3);
  oval(ctx, 752, 439, 3, 5, '#2c2530', 0);
  ctx.restore();
}

export function rescue(ctx, elapsed, act) {
  const t = Math.max(0, elapsed / 1000);
  ctx.drawImage(chamberFor(act === 2), 0, 0);
  const heroX = 275 + 375 * ease(t / 2.1) - 105 * ease((t - 3.65) / 1.15);
  const guestX = 854 - 177 * ease((t - 3.82) / 1.7) - 27 * ease((t - 5.45) / .85);
  const lift = ease((t - 2.75) / 1.17) * 408;
  const unlocked = t > 3.78;
  const flirt = ease((t - 5.05) / .7);
  const wave = ease((t - 5.1) / .35) * (.28 + .35 * Math.sin(t * 8));
  const heroStep = t < 2.1 || (t > 3.65 && t < 4.8) ? .85 : 0;
  const key = ease((t - 1.93) / .42) * (1 - ease((t - 2.8) / .4));
  const guest = { x: guestX, y: 616 + ease((t - 3.8) / 1.1) * 12, size: 2.87, variant: 'princess',
    flip: !unlocked || t > 5.4, time: t, step: t > 3.8 && t < 5.52 ? .52 : 0,
    gesture: wave, smile: unlocked, flirt, lean: -.085 * flirt };
  if (!unlocked) character(ctx, guest);
  gate(ctx, lift);
  if (unlocked) character(ctx, guest);
  character(ctx, { x: heroX, y: 632, size: 2.93, time: t, step: heroStep, gesture: key, smile: true });
  if (t > 3.85) {
    const p = Math.min(1, (t - 3.85) / 4.8);
    for (let i = 0; i < 24; i++) {
      const x = 472 + ((i * 137) % 428) + Math.sin(i + t) * 28;
      const y = 200 + ((i * 109) % 322) - p * 88;
      const radius = (3 + i % 5) * Math.max(.15, Math.sin(p * Math.PI));
      oval(ctx, x, y, radius, radius, ['#f0c583', '#eb9f93', '#fff1bd'][i % 3], 0);
    }
  }
  if (t > 5.1) {
    ctx.save();
    ctx.globalAlpha = ease((t - 5.1) / .65);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe3a3';
    ctx.font = 'bold italic 68px Georgia, serif';
    ctx.shadowColor = '#2a1c2a';
    ctx.shadowBlur = 20;
    ctx.fillText('Prinzessin gerettet!', 655, 122);
    ctx.font = '700 24px "Segoe UI", sans-serif';
    ctx.fillStyle = '#fff1cf';
    ctx.fillText('Vom Niemand zum Retter', 655, 164);
    ctx.restore();
  }
  if (t > 5.75 && t < 7.75) {
    const drift = (t - 5.75) / 2;
    ctx.save();
    ctx.translate(605 - drift * 66, 362 - drift * 112);
    ctx.scale(.65 + drift * .48, .65 + drift * .48);
    ctx.globalAlpha = Math.sin(Math.PI * drift);
    path(ctx, 'M 0 8 C -24 -5 -13 -18 0 -9 C 13 -18 24 -5 0 8 Z', '#e4a2ac', 1.5);
    ctx.restore();
  }
  const iris = Math.max(.006, ease(t / .8)) * 818;
  if (t < .8) {
    ctx.save();
    ctx.fillStyle = '#211c23';
    ctx.beginPath();
    ctx.rect(0, 0, 1310, 820);
    ctx.arc(655, 410, iris, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.restore();
  }
}

export function kidnap(ctx, elapsed) {
  const t = elapsed / 1000;
  ctx.drawImage(chamberFor(), 0, 0);
  const gateLift = ease((t - 1.52) / .85) * 408;
  const run = ease((t - 3.38) / 2.65);
  const rivalX = 1242 - 410 * ease((t - .16) / 1.75) + run * 625;
  const heroX = 125 + 400 * ease((t - 2.05) / 2.15);
  const lift = ease((t - 2.61) / .77);
  const tugs = Math.sin(t * 14) * .08 * lift;
  const taken = t >= 2.61;
  const guest = { x: 857, y: 620, size: 2.78, variant: 'princess', flip: false, time: t,
    gesture: .35, smile: false, expression: 'hurt' };
  if (!taken) character(ctx, guest);
  gate(ctx, gateLift);
  character(ctx, { x: heroX, y: 629, size: 2.93, time: t, step: t > 2.1 && t < 4.22 ? .85 : 0, smile: false, expression: 'effort' });
  character(ctx, { x: rivalX, y: 625, size: 3.12, variant: 'brute', flip: t < 3.32, time: t,
    step: t < 1.9 || (t > 3.35 && t < 6.05) ? .92 : .05, gesture: lift * .64, lean: -.09 * lift,
    smile: false, expression: 'effort' });
  if (taken) {
    character(ctx, { ...guest, x: 857 + (rivalX + 108 - 857) * lift, y: 620 - 124 * lift,
      lean: -1.17 * lift + tugs, step: .39 * lift, gesture: .68 + Math.sin(t * 11) * .30 });
  }
  ctx.save();
  ctx.textAlign = 'center';
  if (t >= 2.7 && t < 5.7) {
    ctx.fillStyle = '#f5e3c7';
    ctx.font = 'bold italic 42px Georgia, serif';
    ctx.fillText('„Lass mich los!“', Math.min(1050, 790 + run * 290), 225 - run * 25);
  }
  if (t >= 5.65) {
    const cover = ease((t - 5.65) / .75);
    ctx.fillStyle = `rgba(19, 18, 27, ${cover * .86})`;
    ctx.fillRect(0, 0, 1310, 820);
    ctx.globalAlpha = cover;
    ctx.fillStyle = '#f3ba8d';
    ctx.font = 'bold 62px Georgia, serif';
    ctx.fillText('Der Rivale ist entkommen', 655, 378);
    ctx.fillStyle = '#e6d9d4';
    ctx.font = '700 27px "Segoe UI", sans-serif';
    ctx.fillText('AKT II · DIE JAGD DURCH DIE MASCHINENWELT', 655, 439);
  }
  ctx.restore();
}
