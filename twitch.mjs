const endpoint = 'wss://irc-ws.chat.twitch.tv:443';

export function normalizeChannel(input) {
  if (typeof input !== 'string') return null;
  let name = input.trim().toLowerCase();
  if (/^(?:(?:www|m)\.)?twitch\.tv\//.test(name)) name = 'https://' + name;
  if (name.startsWith('http://') || name.startsWith('https://')) {
    const url = URL.parse(name);
    if (!url || !['twitch.tv', 'www.twitch.tv', 'm.twitch.tv'].includes(url.hostname) || url.username || url.password || url.port) return null;
    name = /^\/([a-z0-9_]+)\/?$/.exec(url.pathname)?.[1] ?? '';
  }
  name = name.replace(/^#/, '');
  return /^[a-z0-9_]{1,25}$/.test(name) ? name : null;
}

export function parseTwitchVote(line, channel) {
  const chat = /^@([^ ]+) :[^ ]+ PRIVMSG #([a-z0-9_]+) :(.*)$/.exec(line);
  if (!chat || chat[2] !== channel) return null;
  const tags = new Map(chat[1].split(';').map(tag => tag.split('=')));
  const userId = tags.get('user-id');
  const sourceRoom = tags.get('source-room-id');
  if (!userId || (sourceRoom && sourceRoom !== tags.get('room-id'))) return null;
  return { userId, message: chat[3], sentAt: Number(tags.get('tmi-sent-ts')) || 0 };
}

export function connectTwitchChat(channel, onMessage, onStatus) {
  let backoff = 2500;
  let activeSocket;
  let reconnect;
  let watchdog;
  let stopped = false;
  function open() {
    if (stopped) return;
    const socket = new WebSocket(endpoint);
    activeSocket = socket;
    let joined = false;

    function expectActivity(ms) {
      clearTimeout(watchdog);
      watchdog = setTimeout(() => socket.close(), ms);
    }

    expectActivity(12000);
    socket.addEventListener('open', () => {
      if (stopped) return;
      // Twitch currently allows joining a public chat with a guest nickname.
      const guest = 'justinfan' + (100000 + Math.floor(Math.random() * 900000));
      socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      socket.send(`NICK ${guest}`);
      socket.send(`JOIN #${channel}`);
    });
    socket.addEventListener('message', ({ data }) => {
      if (stopped) return;
      for (const line of data.split(/\r?\n/)) {
        if (line.startsWith('PING ')) {
          socket.send('PONG ' + line.slice(5));
        } else if (/(^| )RECONNECT$/.test(line)) {
          socket.close();
          return;
        } else if (!joined && line.replace(/^@[^ ]+ /, '') === `:tmi.twitch.tv ROOMSTATE #${channel}`) {
          joined = true;
          backoff = 2500;
          onStatus(true);
        } else if (joined) {
          const message = parseTwitchVote(line, channel);
          if (message) onMessage(message);
        }
      }
      if (joined) expectActivity(360000);
    });
    socket.addEventListener('error', () => socket.close());
    socket.addEventListener('close', () => {
      clearTimeout(watchdog);
      if (stopped) return;
      onStatus(false);
      reconnect = setTimeout(open, backoff);
      backoff = Math.min(backoff * 2, 30000);
    }, { once: true });
  }
  open();
  return () => {
    stopped = true;
    clearTimeout(reconnect);
    clearTimeout(watchdog);
    activeSocket?.close();
  };
}
