
async function loadData() {
  const res = await fetch('data/anime.json');
  if (!res.ok) throw new Error('Daten konnten nicht geladen werden.');
  return await res.json();
}

function createSlug(str) {
  return (str || 'item').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function renderList(items) {
  const list = document.getElementById('list');
  list.innerHTML = '';
  for (const it of items) {
    const a = document.createElement('a');
    const id = it.id || createSlug(it.title);
    a.href = `detail.html?id=${encodeURIComponent(id)}`;
    a.textContent = it.title;

    const title = document.createElement('div');
    title.appendChild(a);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const lang = it.language && it.language.trim() ? it.language : 'Sprache fehlt';
    meta.innerHTML = `<span class="badge">${lang}</span>`;

    const item = document.createElement('div');
    item.className = 'item';
    item.appendChild(title);
    item.appendChild(meta);

    list.appendChild(item);
  }
}

function uniqueLanguages(items) {
  const set = new Set();
  for (const it of items) {
    const lang = (it.language || '').trim();
    if (lang) set.add(lang);
  }
  return Array.from(set).sort((a,b) => a.localeCompare(b, 'de'));
}

function applyFilters(items, {q, lang, sort}) {
  let res = items.slice();
  if (q) {
    const needle = q.toLowerCase();
    res = res.filter(it =>
      (it.title || '').toLowerCase().includes(needle) ||
      (it.description || '').toLowerCase().includes(needle)
    );
  }
  if (lang) res = res.filter(it => (it.language || '').trim() === lang);

  if (sort === 'title-asc') res.sort((a,b)=> (a.title||'').localeCompare(b.title||'', 'de'));
  if (sort === 'title-desc') res.sort((a,b)=> (b.title||'').localeCompare(a.title||'', 'de'));

  return res;
}

(async function init() {
  const data = await loadData();

  const languageFilter = document.getElementById('languageFilter');
  const langs = uniqueLanguages(data);
  for (const l of langs) {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    languageFilter.appendChild(opt);
  }

  const state = { q: '', lang: '', sort: 'title-asc' };
  const search = document.getElementById('search');
  const sortSel = document.getElementById('sort');
  const empty = document.getElementById('emptyState');

  function update() {
    const out = applyFilters(data, state);
    renderList(out);
    empty.style.display = out.length ? 'none' : 'block';
  }

  search.addEventListener('input', (e)=> { state.q = e.target.value.trim(); update(); });
  languageFilter.addEventListener('change', (e)=> { state.lang = e.target.value; update(); });
  sortSel.addEventListener('change', (e)=> { state.sort = e.target.value; update(); });

  update();
})().catch(err => {
  document.getElementById('list').innerHTML = '';
  const empty = document.getElementById('emptyState');
  empty.style.display = 'block';
  empty.textContent = 'Fehler: ' + err.message;
});
