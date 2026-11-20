// NEON LEONIDA — offline GTA VI trophy guide and tracker.
// Static files only: data comes from data/trophies.json, progress lives in localStorage.
const KEY_EARNED = 'neon-leonida-earned-v1';
const KEY_NOTES = 'neon-leonida-notes-v1';
const KEY_COUNTS = 'neon-leonida-counts-v1';
const KEY_SETTINGS = 'neon-leonida-settings-v1';

const view = document.getElementById('view');
const tabsEl = document.getElementById('tabs');

const STAGES = [
  { n: 1, title: 'Arrival', note: 'Chapter 1 — learn Vice City, and meditate on the balcony before the chapter ends.' },
  { n: 2, title: 'Vice City', note: 'Chapter 2 — the cartel heist and the first big story swings.' },
  { n: 3, title: 'The Long Con', note: 'Chapter 3 — Key Cloner and Credit Check unlock two confirmed side trophies.' },
  { n: 4, title: 'Top of the World', note: 'Chapter 4 and the finale — the gold story trophy and the road to 100%.' },
  { n: 5, title: 'Side Strands', note: 'Stranger missions across Leonida — Andy, Kenton, Billy, Randy, Tyrone and more.' },
  { n: 6, title: 'Activities & Races', note: 'Everything you can play between missions — ranges, races, bowling, fishing, the strange stuff.' },
  { n: 7, title: '100% Cleanup', note: 'Collectibles, robberies, exploration and the economy — the long tail to the platinum.' },
];
const HUNDRED = [
  { label: 'Vehicles discovered', got: 200, total: 277, note: 'Drive or ride anything new — each model logs once.' },
  { label: 'Animals', got: 100, total: 255, note: 'Hunt and log the wildlife of Leonida, including the unique animal for Bret.' },
  { label: 'Challenges', got: 70, total: 80, note: 'Small tasks scattered through the game; keep clearing them as you play.' },
  { label: 'Stunt jumps found', got: 300, total: 397, note: 'Stunt jumps feed Cunning Stunts too — keep jumping past 250.' },
];
const SEED_IDS = [2, 3, 8, 28, 44, 4, 9, 10, 11, 12, 13, 5, 45];

const state = {
  trophies: [],
  earned: new Set(),
  notes: {},
  counts: {},
  settings: { kind: 'all', grade: 'all', q: '', hideEarned: false, spoiler: true },
  route: 'roadmap',
  openId: null,
  seeded: false,
};

function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? 'null');
    return v ?? fallback;
  } catch { return fallback; }
}
function saveAll() {
  localStorage.setItem(KEY_EARNED, JSON.stringify([...state.earned]));
  localStorage.setItem(KEY_NOTES, JSON.stringify(state.notes));
  localStorage.setItem(KEY_COUNTS, JSON.stringify(state.counts));
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(state.settings));
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function medalLetter(grade) {
  return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] ?? '?';
}
function roadmapOrder(list) {
  return [...list].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
}
function earnedCount() { return state.earned.size; }
function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

function renderTabs() {
  const tabs = [
    ['roadmap', 'Platinum Roadmap'],
    ['checklist', 'Checklist'],
    ['missables', 'Missables'],
    ['hundred', '100% Checklist'],
  ];
  tabsEl.innerHTML = tabs.map(([r, label]) => {
    const n = r === 'checklist' ? ` <span class="n">${earnedCount()}/55</span>` : '';
    return `<a href="#/${r}" class="${state.route === r ? 'active' : ''}">${label}${n}</a>`;
  }).join('');
}

function renderRoadmap() {
  const total = state.trophies.length;
  const done = earnedCount();
  const p = pct(done, total);
  const stages = STAGES.map((s) => {
    const ts = roadmapOrder(state.trophies.filter((t) => t.stage === s.n));
    const got = ts.filter((t) => state.earned.has(t.name)).length;
    const names = ts.map((t) => `<b>${esc(t.name)}</b>`).join(' · ');
    return `<section class="stage">
      <span class="no">${s.n}</span>
      <div>
        <h3>${esc(s.title)} <small>Stage ${s.n} of 7</small></h3>
        <p>${esc(s.note)}</p>
        <div class="bar"><i style="width:${pct(got, ts.length)}%"></i></div>
        <p class="names">${names}</p>
      </div>
      <span class="pct"><b>${got}/${ts.length}</b> earned</span>
    </section>`;
  }).join('');
  view.innerHTML = `
    <section class="hero">
      <div>
        <h2>Platinum Roadmap</h2>
        <p>Seven stages from the first mission to the platinum, in the order the game opens them. Play the story first, then the stranger strands, then activities — and leave the long cleanup counts for last, when fast travel and the full map are open.</p>
        <p><b>${done} of ${total} trophies earned.</b> The ring fills as you tick them off; your progress is saved in this browser.</p>
        <div class="warn"><b>One missable:</b> Positive Mental Attitude — meditate at the Chapter 1 balcony spot before Chapter 1 ends. Everything else can be earned after the story.</div>
      </div>
      <div class="ringbox">
        <div class="ring" style="--pct:${p}"><b>${done}/${total}</b><span>earned</span></div>
        <p>Platinum progress</p>
      </div>
    </section>
    <div class="stages">${stages}</div>`;
}

function trophyCard(t) {
  const earned = state.earned.has(t.name);
  const hidden = state.settings.spoiler && t.kind === 'story' && !earned;
  const count = state.counts[t.id] ?? 0;
  const note = state.notes[t.id] ?? '';
  const tags = [
    t.missable ? '<span class="tag miss">Missable</span>' : '',
    t.source.startsWith('PowerPyx') ? '<span class="tag conf">Confirmed</span>' : '',
  ].join('');
  return `<article class="trophy${earned ? ' earned' : ''}" data-id="${t.id}">
    <div class="top">
      <input class="box" type="checkbox" ${earned ? 'checked' : ''} data-earn="${t.id}" aria-label="Mark ${esc(t.name)} earned">
      <span class="medal ${t.grade}" title="${t.grade}">${medalLetter(t.grade)}</span>
      <div>
        <h3 class="${hidden ? 'spoiled' : ''}">${esc(t.name)}${tags}</h3>
        <p class="desc ${hidden ? 'spoiled' : ''}">${esc(t.description)} — ${t.grade}</p>
        <p class="guide">${esc(t.guide)}</p>
        <p class="src">Source: <a href="${esc(t.source_url)}" target="_blank" rel="noopener">${esc(t.source)}</a></p>
        <div class="meta">
          <span class="cnt">Count <button type="button" data-count="${t.id}" data-d="-1" aria-label="Decrease count">−</button> <b>${count}</b> <button type="button" data-count="${t.id}" data-d="1" aria-label="Increase count">+</button></span>
          <button type="button" data-note="${t.id}">${note ? 'Edit note' : 'Add note'}</button>
        </div>
        <textarea data-notetext="${t.id}" rows="2" placeholder="Your note — where you found it, what worked…" class="${note ? '' : 'hidden'}">${esc(note)}</textarea>
      </div>
    </div>
  </article>`;
}

function renderChecklist() {
  const s = state.settings;
  let list = [...state.trophies];
  if (s.kind !== 'all') list = list.filter((t) => t.kind === s.kind);
  if (s.grade !== 'all') list = list.filter((t) => t.grade === s.grade);
  if (s.hideEarned) list = list.filter((t) => !state.earned.has(t.name));
  if (s.q.trim()) {
    const q = s.q.trim().toLowerCase();
    list = list.filter((t) => (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q));
  }
  list = roadmapOrder(list);
  const open = state.openId ? state.trophies.find((t) => t.id === state.openId) : null;
  view.innerHTML = `
    <div class="controls">
      <input type="search" id="q" placeholder="Search trophies, guides…" value="${esc(s.q)}" aria-label="Search trophies">
      <select id="kind" aria-label="Filter by kind">
        ${['all', 'story', 'quest', 'activity', 'collectible', 'robbery'].map((k) => `<option value="${k}" ${s.kind === k ? 'selected' : ''}>${k === 'all' ? 'All kinds' : k[0].toUpperCase() + k.slice(1)}</option>`).join('')}
      </select>
      <select id="grade" aria-label="Filter by grade">
        ${['all', 'platinum', 'gold', 'silver', 'bronze'].map((g) => `<option value="${g}" ${s.grade === g ? 'selected' : ''}>${g === 'all' ? 'All grades' : g[0].toUpperCase() + g.slice(1)}</option>`).join('')}
      </select>
      <label class="chk"><input type="checkbox" id="hideEarned" ${s.hideEarned ? 'checked' : ''}> Hide earned</label>
      <label class="chk"><input type="checkbox" id="spoiler" ${s.spoiler ? 'checked' : ''}> Spoiler shield (hide story names until earned)</label>
    </div>
    <p class="countline"><b>${earnedCount()} of ${state.trophies.length}</b> earned · showing <b>${list.length}</b> trophies</p>
    ${open ? `<p class="countline">Guide open: <b>${esc(open.name)}</b> — ${esc(open.guide)}</p>` : ''}
    <div class="tlist">${list.map(trophyCard).join('') || '<p class="countline">Nothing matches those filters.</p>'}</div>`;
  document.getElementById('q').addEventListener('input', (e) => { state.settings.q = e.target.value; saveAll(); render(); });
  document.getElementById('kind').addEventListener('change', (e) => { state.settings.kind = e.target.value; saveAll(); render(); });
  document.getElementById('grade').addEventListener('change', (e) => { state.settings.grade = e.target.value; saveAll(); render(); });
  document.getElementById('hideEarned').addEventListener('change', (e) => { state.settings.hideEarned = e.target.checked; saveAll(); render(); });
  document.getElementById('spoiler').addEventListener('change', (e) => { state.settings.spoiler = e.target.checked; saveAll(); render(); });
}

function renderMissables() {
  const m = state.trophies.find((t) => t.missable);
  view.innerHTML = `
    <section class="hero">
      <div>
        <h2>Missables</h2>
        <p>Only <b>one</b> trophy in GTA VI can be missed, and it is early. Everything else stays earnable after the story ends, so there is no need to rush the rest.</p>
      </div>
    </section>
    <div class="cards">
      <article class="card">
        <h3>${esc(m.name)} — the one missable</h3>
        <p><b>${esc(m.description)}</b></p>
        <p>${esc(m.guide)}</p>
        <p>Source: <a href="${esc(m.source_url)}" target="_blank" rel="noopener">${esc(m.source)}</a></p>
        <p><b>When:</b> Chapter 1, before the chapter ends. <b>Where:</b> the balcony meditation spot, plus the other 17 spots across Leonida (18 in all).</p>
      </article>
      <article class="card">
        <h3>Safe after the story</h3>
        <p>Every other trophy — all 54 of them — can still be earned once the credits roll: story missions replay, strangers stay on the map, and activities, collectibles and robberies never lock away. If you missed the balcony, that is the only trophy a new playthrough is needed for.</p>
      </article>
    </div>`;
}

function renderHundred() {
  const cards = HUNDRED.map((h) => `
    <article class="card">
      <h3>${esc(h.label)}</h3>
      <p><span class="big">${h.got}/${h.total}</span></p>
      <div class="bar"><i style="width:${pct(h.got, h.total)}%"></i></div>
      <p>${esc(h.note)}</p>
    </article>`).join('');
  const next = roadmapOrder(state.trophies.filter((t) => !state.earned.has(t.name))).slice(0, 5);
  const items = next.map((t) => `<li><b>${esc(t.name)}</b> — ${esc(t.description)} <span style="color:var(--faint)">(Stage ${t.stage}, ${t.grade})</span></li>`).join('');
  view.innerHTML = `
    <section class="hero">
      <div>
        <h2>100% Checklist</h2>
        <p><b>A Long Road</b> needs 100% completion, and completion is counted in real numbers. These are the counts the game tracks, as the guide had them part-way: finish the story and strands first, then sweep these four lists.</p>
      </div>
    </section>
    <div class="cards">${cards}</div>
    <div class="cards">
      <article class="card">
        <h3>Next Up — your next 5 trophies</h3>
        <ol class="nextup">${items}</ol>
        <p>Earn one, come back, and the list moves on. Tick trophies off on the Checklist and the roadmap ring fills with them.</p>
      </article>
    </div>`;
}

function render() {
  renderTabs();
  if (state.route === 'checklist') renderChecklist();
  else if (state.route === 'missables') renderMissables();
  else if (state.route === 'hundred') renderHundred();
  else renderRoadmap();
}

function routeFromHash() {
  const h = (location.hash || '#/roadmap').replace(/^#\/?/, '');
  state.route = ['roadmap', 'checklist', 'missables', 'hundred'].includes(h) ? h : 'roadmap';
}

view.addEventListener('change', (e) => {
  const earn = e.target.closest('[data-earn]');
  if (earn) {
    const t = state.trophies.find((x) => x.id === Number(earn.dataset.earn));
    if (t) {
      if (earn.checked) state.earned.add(t.name);
      else state.earned.delete(t.name);
      saveAll(); render();
    }
  }
});
view.addEventListener('click', (e) => {
  const cnt = e.target.closest('[data-count]');
  if (cnt) {
    const id = Number(cnt.dataset.count);
    state.counts[id] = Math.max(0, (state.counts[id] ?? 0) + Number(cnt.dataset.d));
    saveAll(); render();
    return;
  }
  const nb = e.target.closest('[data-note]');
  if (nb) {
    const ta = view.querySelector(`[data-notetext="${nb.dataset.note}"]`);
    if (ta) { ta.classList.toggle('hidden'); ta.focus(); }
  }
});
view.addEventListener('input', (e) => {
  const ta = e.target.closest('[data-notetext]');
  if (ta) {
    state.notes[Number(ta.dataset.notetext)] = ta.value;
    saveAll();
  }
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ earned: [...state.earned], notes: state.notes, counts: state.counts }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'neon-leonida-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (Array.isArray(data.earned)) state.earned = new Set(data.earned);
    if (data.notes) state.notes = data.notes;
    if (data.counts) state.counts = data.counts;
    saveAll(); render();
  } catch { alert('That file is not a NEON LEONIDA progress export.'); }
});

window.addEventListener('hashchange', () => { routeFromHash(); render(); });

const params = new URLSearchParams(location.search);
state.earned = new Set(loadJSON(KEY_EARNED, []));
state.notes = loadJSON(KEY_NOTES, {});
state.counts = loadJSON(KEY_COUNTS, {});
Object.assign(state.settings, loadJSON(KEY_SETTINGS, {}));
const doc = await (await fetch('data/trophies.json')).json();
state.trophies = doc.trophies;
if (params.get('seed') === '13') {
  const byId = Object.fromEntries(state.trophies.map((t) => [t.id, t]));
  state.earned = new Set(SEED_IDS.map((id) => byId[id].name).filter(Boolean));
  state.seeded = true;
}
if (params.get('open')) {
  const id = Number(params.get('open'));
  if (state.trophies.some((t) => t.id === id)) { state.openId = id; state.route = 'checklist'; }
}
routeFromHash();
if (state.openId) state.route = 'checklist';
render();
