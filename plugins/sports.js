const axios = require('axios');
const { fetchJson } = require('../lib/dreadfunc');

const HOSTS = [
  process.env.KEITH_API,
  'https://keithhostdeploysite-t3pgatgm-21717a2c2837.herokuapp.com',
  'https://keithhostdeploysite-22l75uk5-ff0ccc337078.herokuapp.com',
].filter(Boolean).map((host) => host.replace(/\/+$/, ''));

async function api(path) {
  const failures = [];
  for (const host of HOSTS) {
    try {
      const response = await axios.get(`${host}${path}`, { timeout: 25000, validateStatus: () => true });
      const body = response.data;
      if (response.status === 200 && body && body.status !== false && body.result) return body.result;
      failures.push(`${host}: HTTP ${response.status}`);
    } catch (error) {
      failures.push(`${host}: ${error.message}`);
    }
  }
  throw new Error(failures.join(' | ') || 'no football API configured');
}

const BOLD_UPPER = 0x1D5D4;
const BOLD_LOWER = 0x1D5EE;
const BOLD_DIGIT = 0x1D7EC;

function bold(text) {
  return [...String(text)].map((ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(BOLD_UPPER + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(BOLD_LOWER + code - 97);
    if (code >= 48 && code <= 57) return String.fromCodePoint(BOLD_DIGIT + code - 48);
    return ch;
  }).join('');
}

const len = (text) => [...String(text)].length;

const TEAM_ALIASES = {
  'wolverhampton wanderers': 'Wolves',
  'wolverhampton': 'Wolves',
  'tottenham hotspur': 'Tottenham',
  'brighton & hove albion': 'Brighton',
  'brighton and hove albion': 'Brighton',
  'brighton & hove': 'Brighton',
  'nottingham forest': "Nott'm Forest",
  'newcastle united': 'Newcastle',
  'manchester united': 'Man United',
  'manchester city': 'Man City',
  'west ham united': 'West Ham',
  'leicester city': 'Leicester',
  'leeds united': 'Leeds',
  'paris saint-germain': 'PSG',
  'paris saint germain': 'PSG',
  'atletico madrid': 'Atletico',
  'atlético madrid': 'Atletico',
  'bayer leverkusen': 'Leverkusen',
  'borussia dortmund': 'Dortmund',
  'bayern munich': 'Bayern',
  'bayern münchen': 'Bayern',
};

function shortTeam(name) {
  const text = String(name === undefined || name === null ? '' : name).replace(/\s+/g, ' ').trim();
  const hit = TEAM_ALIASES[text.toLowerCase()];
  if (hit) return hit;
  return text
    .replace(/\s+(FC|AFC|CF|SC)$/i, '')
    .replace(/\bRepublic\b/i, 'Rep.')
    .replace(/^South\b/i, 'S.')
    .replace(/^North\b/i, 'N.')
    .replace(/\bUnited\b/i, 'Utd');
}

function shortPlayer(name) {
  const text = String(name === undefined || name === null ? '' : name).replace(/\s+/g, ' ').trim();
  const parts = text.split(' ');
  if (text.length <= 10 || parts.length < 2) return text;
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

function fit(value, width, align) {
  let text = String(value === undefined || value === null ? '' : value).normalize('NFC').replace(/\s+/g, ' ').trim();
  if (len(text) > width) text = [...text].slice(0, width - 1).join('') + '…';
  const pad = width - len(text);
  if (align === 'r') return ' '.repeat(pad) + text;
  if (align === 'c') return ' '.repeat(Math.floor(pad / 2)) + text + ' '.repeat(Math.ceil(pad / 2));
  return text + ' '.repeat(pad);
}

function table(columns, rows, breaks) {
  const cut = new Set(breaks || []);
  const line = (left, mid, right) => left + columns.map((c) => '─'.repeat(c.width + 2)).join(mid) + right;
  const row = (cells, header) => '│' + columns.map((c, i) => ' ' + fit(cells[i], c.width, header ? 'c' : c.align) + ' ').join('│') + '│';
  const out = [line('┌', '┬', '┐'), row(columns.map((c) => c.title), true), line('├', '┼', '┤')];
  rows.forEach((cells, index) => {
    out.push(row(cells, false));
    if (cut.has(index) && index < rows.length - 1) out.push(line('├', '┼', '┤'));
  });
  out.push(line('└', '┴', '┘'));
  return '```\n' + out.join('\n') + '\n```';
}

const signed = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return value === undefined || value === null ? '' : String(value);
  return n > 0 ? `+${n}` : String(n);
};

function breakIndexes(positions, total) {
  return (positions || []).map((p) => (p < 0 ? total + p - 1 : p - 1)).filter((i) => i >= 0 && i < total - 1);
}

function standingsTable(teams, breaks) {
  const has = (key) => teams.some((t) => t[key] !== undefined && t[key] !== null);
  const columns = [{ title: '#', width: 2, align: 'r' }, { title: 'Team', width: has('played') ? 14 : 20, align: 'l' }];
  if (has('played')) columns.push({ title: 'P', width: 2, align: 'r' });
  if (has('goalDifference')) columns.push({ title: 'GD', width: 3, align: 'r' });
  columns.push({ title: 'Pts', width: 3, align: 'r' });
  const rows = teams.map((t) => {
    const cells = [t.position, shortTeam(t.team)];
    if (has('played')) cells.push(t.played);
    if (has('goalDifference')) cells.push(signed(t.goalDifference));
    cells.push(t.points);
    return cells;
  });
  return table(columns, rows, breakIndexes(breaks, rows.length));
}

function standingsCommand(command, aliases, description, path, title, flag, breaks, legend) {
  return {
    command: [command],
    aliases,
    description,
    category: 'sports',
    handler: async (client, m) => {
      try {
        await client.sendMessage(m.chat, { react: { text: '📊', key: m.key } });
        const result = await api(path);
        const teams = Array.isArray(result.standings) ? result.standings : [];
        if (!teams.length) return m.reply(`❌ No ${title} standings available right now.`);
        let text = `${flag} ${bold(title + ' Standings')}\n\n${standingsTable(teams, breaks)}`;
        if (legend) text += `\n_${legend}_`;
        await m.reply(text);
      } catch (error) {
        m.reply(`❌ Could not fetch ${title} standings right now.`);
      }
    },
  };
}

function scorersCommand(command, aliases, description, path, title) {
  return {
    command: [command],
    aliases,
    description,
    category: 'sports',
    handler: async (client, m) => {
      try {
        await client.sendMessage(m.chat, { react: { text: '⚽', key: m.key } });
        const result = await api(path);
        const scorers = Array.isArray(result.topScorers) ? result.topScorers.slice(0, 10) : [];
        if (!scorers.length) return m.reply(`❌ No ${title} scorers available right now.`);
        const hasAssists = scorers.some((s) => s.assists !== undefined && s.assists !== null);
        const columns = [
          { title: '#', width: 2, align: 'r' },
          { title: 'Player', width: 10, align: 'l' },
          { title: 'Team', width: 9, align: 'l' },
          { title: 'G', width: 2, align: 'r' },
        ];
        if (hasAssists) columns.push({ title: 'A', width: 2, align: 'r' });
        const rows = scorers.map((s, index) => {
          const cells = [s.rank || index + 1, shortPlayer(s.player), shortTeam(s.team || ''), s.goals];
          if (hasAssists) cells.push(s.assists === undefined || s.assists === null ? '' : s.assists);
          return cells;
        });
        await m.reply(`⚽ ${bold(title + ' Top Scorers')}\n\n${table(columns, rows)}\n_G = goals${hasAssists ? ', A = assists' : ''}_`);
      } catch (error) {
        m.reply(`❌ Could not fetch ${title} scorers right now.`);
      }
    },
  };
}

function groupTable(teams) {
  const columns = [
    { title: '#', width: 1, align: 'r' },
    { title: 'Team', width: 11, align: 'l' },
    { title: 'W-D-L', width: 5, align: 'c' },
    { title: 'GD', width: 3, align: 'r' },
    { title: 'Pts', width: 3, align: 'r' },
  ];
  const rows = teams.map((t, i) => [i + 1, shortTeam(t.shortName || t.name), `${t.wins}-${t.draws}-${t.losses}`, signed(t.goalConDiff), t.pts]);
  return table(columns, rows, [1]);
}

const shortDate = (utc) => (utc ? new Date(utc).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'TBD');


const FD_LEAGUES = [
  { code: 'PL', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Premier League' },
  { code: 'PD', flag: '🇪🇸', name: 'La Liga' },
  { code: 'BL1', flag: '🇩🇪', name: 'Bundesliga' },
  { code: 'SA', flag: '🇮🇹', name: 'Serie A' },
  { code: 'FL1', flag: '🇫🇷', name: 'Ligue 1' },
  { code: 'CL', flag: '🏆', name: 'Champions League' },
];

const EAT = 'Africa/Nairobi';
const eatDay = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: EAT, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const eatTime = (date) => new Intl.DateTimeFormat('en-GB', { timeZone: EAT, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
const eatLabel = (date) => new Intl.DateTimeFormat('en-GB', { timeZone: EAT, weekday: 'short', day: '2-digit', month: 'short' }).format(date);

async function footballDataMatches(from, to) {
  const key = process.env.FOOTBALL_DATA_KEY;
  if (!key) return null;
  const response = await axios.get('https://api.football-data.org/v4/matches', {
    params: { competitions: FD_LEAGUES.map((l) => l.code).join(','), dateFrom: from, dateTo: to },
    headers: { 'X-Auth-Token': key.trim() },
    timeout: 25000,
    validateStatus: () => true,
  });
  if (response.status === 429) throw new Error('football-data.org rate limit reached, try again in a minute');
  if (response.status === 401 || response.status === 403) throw new Error('football-data.org rejected the key');
  if (response.status !== 200 || !response.data || !Array.isArray(response.data.matches)) throw new Error(`football-data.org returned HTTP ${response.status}`);
  return response.data.matches;
}

function fixturesMessage(matches, label) {
  const upcoming = matches
    .filter((match) => !['FINISHED', 'CANCELLED', 'AWARDED'].includes(match.status))
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  if (!upcoming.length) return null;

  const days = new Map();
  for (const match of upcoming) {
    const when = new Date(match.utcDate);
    const day = eatDay(when);
    if (!days.has(day)) days.set(day, { label: eatLabel(when), leagues: new Map() });
    const leagues = days.get(day).leagues;
    const code = (match.competition && match.competition.code) || '';
    if (!leagues.has(code)) leagues.set(code, []);
    leagues.get(code).push(match);
  }

  const columns = [
    { title: 'EAT', width: 5, align: 'c' },
    { title: 'Home', width: 11, align: 'l' },
    { title: 'Away', width: 11, align: 'l' },
  ];

  let text = `⚽ ${bold('Football Fixtures')}\n_${label}_\n`;
  for (const [, day] of days) {
    text += `\n📅 *${day.label}*\n`;
    for (const league of FD_LEAGUES) {
      const list = day.leagues.get(league.code);
      if (!list) continue;
      const rows = list.map((match) => {
        const when = new Date(match.utcDate);
        const time = match.status === 'IN_PLAY' || match.status === 'PAUSED' ? 'LIVE' : eatTime(when);
        return [time, shortTeam(match.homeTeam.shortName || match.homeTeam.name), shortTeam(match.awayTeam.shortName || match.awayTeam.name)];
      });
      text += `${league.flag} *${league.name}*\n${table(columns, rows)}\n`;
    }
  }
  return text.trim() + '\n_Times are East Africa Time (EAT)_';
}

async function legacyFixtures(client, m) {
    {
     try {
            let pl, laliga, bundesliga, serieA, ligue1;

            const plData = await fetchJson('https://api.dreaded.site/api/matches/PL');
            pl = plData.data;

            const laligaData = await fetchJson('https://api.dreaded.site/api/matches/PD');
            laliga = laligaData.data;

            const bundesligaData = await fetchJson('https://api.dreaded.site/api/matches/BL1');
            bundesliga = bundesligaData.data;

            const serieAData = await fetchJson('https://api.dreaded.site/api/matches/SA');
            serieA = serieAData.data;

            const ligue1Data = await fetchJson('https://api.dreaded.site/api/matches/FR');
            ligue1 = ligue1Data.data;

            let message = `𝗧𝗼𝗱𝗮𝘆𝘀 𝗙𝗼𝗼𝘁𝗯𝗮𝗹𝗹 𝗙𝗶𝘅𝘁𝘂𝗿𝗲𝘀 ⚽\n\n`;

            message += typeof pl === 'string' ? `🇬🇧 𝗣𝗿𝗲𝗺𝗶𝗲𝗿 𝗟𝗲𝗮𝗴𝘂𝗲:\n${pl}\n\n` : pl.length > 0 ? `🇬🇧 𝗣𝗿𝗲𝗺𝗶𝗲𝗿 𝗟𝗲𝗮𝗴𝘂𝗲:\n${pl.map(match => {
                const { game, date, time } = match;
                return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
            }).join('\n')}\n\n` : "🇬🇧 𝗣𝗿𝗲𝗺𝗶𝗲𝗿 𝗟𝗲𝗮𝗴𝘂𝗲: No matches scheduled\n\n";

            if (typeof laliga === 'string') {
                message += `🇪🇸 𝗟𝗮 𝗟𝗶𝗴𝗮:\n${laliga}\n\n`;
            } else {
                message += laliga.length > 0 ? `🇪🇸 𝗟𝗮 𝗟𝗶𝗴𝗮:\n${laliga.map(match => {
                    const { game, date, time } = match;
                    return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
                }).join('\n')}\n\n` : "🇪🇸 𝗟𝗮 𝗟𝗶𝗴𝗮: No matches scheduled\n\n";
            }

            message += typeof bundesliga === 'string' ? `🇩🇪 𝗕𝘂𝗻𝗱𝗲𝘀𝗹𝗶𝗴𝗮:\n${bundesliga}\n\n` : bundesliga.length > 0 ? `🇩🇪 𝗕𝘂𝗻𝗱𝗲𝘀𝗹𝗶𝗴𝗮:\n${bundesliga.map(match => {
                const { game, date, time } = match;
                return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
            }).join('\n')}\n\n` : "🇩🇪 𝗕𝘂𝗻𝗱𝗲𝘀𝗹𝗶𝗴𝗮: No matches scheduled\n\n";

            message += typeof serieA === 'string' ? `🇮🇹 𝗦𝗲𝗿𝗶𝗲 𝗔:\n${serieA}\n\n` : serieA.length > 0 ? `🇮🇹 𝗦𝗲𝗿𝗶𝗲 𝗔:\n${serieA.map(match => {
                const { game, date, time } = match;
                return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
            }).join('\n')}\n\n` : "🇮🇹 𝗦𝗲𝗿𝗶𝗲 𝗔: No matches scheduled\n\n";

            message += typeof ligue1 === 'string' ? `🇫🇷 𝗟𝗶𝗴𝘂𝗲 1:\n${ligue1}\n\n` : ligue1.length > 0 ? `🇫🇷 𝗟𝗶𝗴𝘂𝗲 1:\n${ligue1.map(match => {
                const { game, date, time } = match;
                return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
            }).join('\n')}\n\n` : "🇫🇷 𝗟𝗶𝗴𝘂𝗲- 1: No matches scheduled\n\n";

            message += "𝗧𝗶𝗺𝗲 𝗮𝗻𝗱 𝗗𝗮𝘁𝗲 𝗮𝗿𝗲 𝗶𝗻 𝗘𝗮𝘀𝘁 𝗔𝗳𝗿𝗶𝗰𝗮 𝗧𝗶𝗺𝗲𝘇𝗼𝗻𝗲 (𝗘𝗔𝗧).";

            await m.reply(message);
        } catch (error) {
            m.reply('Something went wrong. Unable to fetch matches.' + error);
        }
    };
}

module.exports = [

  standingsCommand('epl', ['epl-table', 'premierleague'], 'Premier League standings', '/epl/standings', 'Premier League', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', [4, 6, -3], 'Lines: top 4 · 5th-6th · bottom 3'),
  standingsCommand('laliga', ['pd-table', 'laliga-table'], 'La Liga standings', '/laliga/standings', 'La Liga', '🇪🇸', [4, -3], 'Lines: top 4 · bottom 3'),
  standingsCommand('bundesliga', ['bl-table'], 'Bundesliga standings', '/bundesliga/standings', 'Bundesliga', '🇩🇪', [4, -3], 'Lines: top 4 · bottom 3'),
  standingsCommand('ligue1', ['lg1'], 'Ligue 1 standings', '/ligue1/standings', 'Ligue 1', '🇫🇷', [3, -3], 'Lines: top 3 · bottom 3'),
  standingsCommand('seriea', ['sl1'], 'Serie A standings', '/seriea/standings', 'Serie A', '🇮🇹', [4, -3], 'Lines: top 4 · bottom 3'),
  standingsCommand('ucl', ['uefa'], 'UEFA Champions League standings', '/ucl/standings', 'UCL', '🏆', [8, 24], 'Lines: top 8 · playoff places 9-24'),
  standingsCommand('euro', ['eu'], 'Euro standings', '/euros/standings', 'Euro', '🇪🇺'),

  {
    command: ['fixtures'],
    aliases: ['matches'],
    description: 'Upcoming football matches (today, tomorrow or week)',
    category: 'sports',
    handler: async (client, m, { text }) => {
      const word = String(text || '').trim().toLowerCase();
      const now = new Date();
      const offset = (days) => new Date(now.getTime() + days * 86400000);
      let from = eatDay(now);
      let to = from;
      let label = 'Today';
      if (word === 'tomorrow') {
        from = to = eatDay(offset(1));
        label = 'Tomorrow';
      } else if (word === 'week') {
        to = eatDay(offset(6));
        label = 'Next 7 days';
      }
      try {
        await client.sendMessage(m.chat, { react: { text: '⚽', key: m.key } });
        let matches = null;
        try {
          matches = await footballDataMatches(from, to);
        } catch (error) {
          if (!process.env.FOOTBALL_DATA_KEY) throw error;
          return m.reply(`❌ ${error.message}`);
        }
        if (matches === null) return legacyFixtures(client, m);
        const message = fixturesMessage(matches, label);
        if (!message) return m.reply(`⚽ No matches scheduled for ${label.toLowerCase()} in the big leagues.\n\n${word === 'week' ? '' : 'Try *.fixtures week* to see the next 7 days.'}`);
        await m.reply(message);
      } catch (error) {
        m.reply('❌ Could not fetch fixtures right now.');
      }
    },
  },

  {
    command: ['fifa'],
    aliases: ['ffa', 'worldcup'],
    description: 'FIFA World Cup group standings and best thirds',
    category: 'sports',
    handler: async (client, m) => {
      try {
        await client.sendMessage(m.chat, { react: { text: '🌍', key: m.key } });
        const data = await api('/fifastandings');
        const tables = (data.table && data.table[0] && data.table[0].data && data.table[0].data.tables) || [];
        const groups = tables.filter((g) => /Grp\.\s*[A-L]/i.test(g.leagueName));
        if (!groups.length) return m.reply('❌ No group standings found.');

        const thirds = [];
        let text = `🌍 ${bold('FIFA World Cup')}\n`;

        for (const group of groups) {
          const name = group.leagueName.replace('Grp.', 'Group').trim();
          const teams = (group.table && group.table.all) || [];
          text += `\n🚩 *${name}*\n${groupTable(teams)}\n`;
          if (teams[2]) {
            const t = teams[2];
            thirds.push({
              group: name.replace('Group', '').trim(),
              name: t.shortName || t.name,
              played: t.played,
              gd: Number(t.goalConDiff),
              gf: Number(t.goalConFor !== undefined ? t.goalConFor : (t.scored || 0)),
              pts: Number(t.pts),
            });
          }
        }

        if (thirds.length) {
          thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
          const columns = [
            { title: '#', width: 2, align: 'r' },
            { title: 'Grp', width: 3, align: 'c' },
            { title: 'Team', width: 11, align: 'l' },
            { title: 'GD', width: 3, align: 'r' },
            { title: 'Pts', width: 3, align: 'r' },
          ];
          const rows = thirds.map((t, i) => [i + 1, t.group, shortTeam(t.name), signed(t.gd), t.pts]);
          text += `\n🔥 ${bold('Best Third-Placed Teams')}\n${table(columns, rows, [7])}\n_Above the line: best 8 advance to the Round of 32_`;
        }

        await m.reply(text);
      } catch (error) {
        m.reply('❌ Could not fetch World Cup standings right now.');
      }
    },
  },

  {
    command: ['fifaplayoffs'],
    aliases: ['playoffs', 'wcbracket', 'wcko'],
    description: 'FIFA World Cup knockout bracket',
    category: 'sports',
    handler: async (client, m) => {
      try {
        await client.sendMessage(m.chat, { react: { text: '🏆', key: m.key } });
        const data = await api('/fifastandings');
        const playoff = data.playoff;
        if (!playoff || !Array.isArray(playoff.rounds) || !playoff.rounds.length) {
          return m.reply('❌ Knockout bracket not available yet. Check back once the group stage ends.');
        }
        const season = (data.details && data.details.selectedSeason) || '';

        const stageLabels = {
          '1/16': 'Round of 32',
          '1/8': 'Round of 16',
          '1/4': 'Quarter-finals',
          '1/2': 'Semi-finals',
          final: 'Final',
        };

        const columns = [
          { title: 'Home', width: 11, align: 'l' },
          { title: 'Score', width: 6, align: 'c' },
          { title: 'Away', width: 11, align: 'l' },
        ];

        const matchRow = (matchup) => {
          const match = matchup.matches && matchup.matches[0];
          const home = shortTeam(matchup.homeTeam || 'TBD');
          const away = shortTeam(matchup.awayTeam || 'TBD');
          const status = (match && match.status) || {};
          if (!match || !status.started) return [home, shortDate(status.utcTime), away];
          const hs = match.home && match.home.score !== undefined ? match.home.score : 0;
          const as = match.away && match.away.score !== undefined ? match.away.score : 0;
          if (!status.finished) return [home, `${hs}-${as} L`, away];
          let winner = null;
          const id = matchup.aggregatedWinner;
          if (id && match.home && match.home.id == id) winner = 'home';
          else if (id && match.away && match.away.id == id) winner = 'away';
          else if (hs > as) winner = 'home';
          else if (as > hs) winner = 'away';
          return [winner === 'home' ? `${home}*` : home, `${hs}-${as}`, winner === 'away' ? `${away}*` : away];
        };

        let text = `🏆 ${bold('FIFA World Cup ' + season)}\n🎯 ${bold('Knockout Bracket')}\n`;
        for (const round of playoff.rounds) {
          const label = stageLabels[round.stage] || String(round.stage).toUpperCase();
          text += `\n*${label}*\n${table(columns, (round.matchups || []).map(matchRow))}\n`;
        }

        const bronze = playoff.bronzeFinal;
        if (bronze && bronze.matchups && bronze.matchups.length) {
          text += `\n*Third place*\n${table(columns, bronze.matchups.slice(0, 1).map(matchRow))}\n`;
        }

        text += '\n_* advances · L = live · a date means not yet played_';
        await m.reply(text);
      } catch (error) {
        m.reply('❌ Could not fetch the World Cup bracket right now.');
      }
    },
  },

  scorersCommand('eplscorers', ['epls', 'topscorers'], 'Premier League top scorers', '/epl/scorers', 'Premier League'),
  scorersCommand('laligascorers', ['ligas'], 'La Liga top scorers', '/laliga/scorers', 'La Liga'),
  scorersCommand('bundesligascorers', ['bdls'], 'Bundesliga top scorers', '/bundesliga/scorers', 'Bundesliga'),
  scorersCommand('serieascorers', ['serieas'], 'Serie A top scorers', '/seriea/scorers', 'Serie A'),
  scorersCommand('ligue1scorers', ['l1s'], 'Ligue 1 top scorers', '/ligue1/scorers', 'Ligue 1'),
  scorersCommand('uclscorers', ['ucls', 'uefas'], 'UCL top scorers', '/ucl/scorers', 'UCL'),
];
