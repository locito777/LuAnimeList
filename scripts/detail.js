
async function loadData() {
  const res = await fetch('data/anime.json');
  if (!res.ok) throw new Error('Daten konnten nicht geladen werden.');
  return await res.json();
}

function getParam(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

function byId(list, id) {
  return list.find(it => (it.id || '').toLowerCase() === id.toLowerCase());
}

function sanitizeUrl(url) {
  try {
    const u = new URL(url);
    return u.href;
  } catch {
    return '';
  }
}

(async function init() {
  const id = getParam('id');
  const data = await loadData();
  const item = byId(data, id);

  const titleEl = document.getElementById('title');
  const descEl = document.getElementById('description');
  const langEl = document.getElementById('language');
  const linkWrap = document.getElementById('linkWrap');
  const trailerEl = document.getElementById('trailer');
  const extraLinksEl = document.getElementById('extraLinks');


  if (!item) {
    titleEl.textContent = 'Nicht gefunden';
    descEl.textContent = 'Kein Eintrag mit dieser ID.';
    langEl.textContent = '–';
    linkWrap.textContent = '–';
    return;
  }

  document.title = item.title + ' – Details';
  titleEl.textContent = item.title;
  descEl.textContent = (item.description && item.description.trim()) ? item.description : 'Keine Beschreibung hinterlegt.';
  langEl.textContent = (item.language && item.language.trim()) ? item.language : '–';

  if (item.watch_url && sanitizeUrl(item.watch_url)) {
    const a = document.createElement('a');
    a.href = item.watch_url;
    a.className = 'button primary';
    a.textContent = 'Jetzt ansehen';
    a.target = '_blank';
    a.rel = 'noopener';
    linkWrap.innerHTML = '';
    linkWrap.appendChild(a);
  } else {
    linkWrap.textContent = 'Link fehlt – in data/anime.json ergänzen.';
  }
})().catch(err => {
  document.getElementById('title').textContent = 'Fehler';
  document.getElementById('description').textContent = err.message;
});


  // Trailer (YouTube embed)
  if (item.trailer_url && sanitizeUrl(item.trailer_url)) {
    trailerEl.style.display = 'block';
    const iframe = document.createElement('iframe');
    iframe.src = item.trailer_url;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');
    trailerEl.innerHTML = '';
    trailerEl.appendChild(iframe);
  } else {
    trailerEl.style.display = 'none';
  }

  // Extra Links
  if (Array.isArray(item.extra_links) && item.extra_links.length) {
    extraLinksEl.style.display = 'flex';
    extraLinksEl.innerHTML = '';
    for (const link of item.extra_links) {
      if (!link || !link.url) continue;
      const a = document.createElement('a');
      a.href = link.url;
      a.className = 'button';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = link.label || 'Link';
      extraLinksEl.appendChild(a);
    }
  } else {
    extraLinksEl.style.display = 'none';
  }
