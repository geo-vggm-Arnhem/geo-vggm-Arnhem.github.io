// GIS Metadata Catalogue — index page logic
// Fetches data/metadata.json and renders a filterable list of layers.

const DATA_URL = 'data/metadata.json';

const state = {
  layers: [],
  query: '',
  theme: '',
};

const listEl = document.getElementById('index-list');
const countEl = document.getElementById('result-count');
const searchEl = document.getElementById('search-input');
const themeEl = document.getElementById('theme-select');

function themeSlug(theme) {
  return (theme || '').toLowerCase().replace(/\s+/g, '-');
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function matchesQuery(layer, query) {
  if (!query) return true;
  const haystack = [
    layer.title,
    layer.theme,
    layer.organisation && layer.organisation.owner,
    ...(layer.keywords || []),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function render() {
  const filtered = state.layers.filter(
    (l) => matchesQuery(l, state.query) && (!state.theme || l.theme === state.theme)
  );

  countEl.textContent = `${filtered.length} of ${state.layers.length} layers`;

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No layers match this search. Try a different keyword or theme.</div>';
    return;
  }

  listEl.innerHTML = filtered
    .map((layer) => {
      const abstract = layer.description && layer.description.abstract ? layer.description.abstract : '';
      const status = layer.maintenance && layer.maintenance.status ? layer.maintenance.status : 'Unknown';
      const statusClass = status.toLowerCase().includes('review') ? 'review' : '';
      const updated = layer.maintenance && layer.maintenance.last_updated ? layer.maintenance.last_updated : '';

      return `
        <a class="index-row" href="layer.html?id=${encodeURIComponent(layer.id)}" role="listitem">
          <div class="title-block">
            <div class="title">${layer.title}</div>
            <div class="abstract">${abstract}</div>
          </div>
          <span class="tag theme-${themeSlug(layer.theme)}">${layer.theme}</span>
          <span class="status-dot ${statusClass}">${status}</span>
          <span class="updated">${formatDate(updated)}</span>
        </a>
      `;
    })
    .join('');
}

function populateThemes(layers) {
  const themes = [...new Set(layers.map((l) => l.theme).filter(Boolean))].sort();
  themeEl.innerHTML =
    '<option value="">All themes</option>' +
    themes.map((t) => `<option value="${t}">${t}</option>`).join('');
}

async function init() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Failed to load metadata (${res.status})`);
    state.layers = await res.json();
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">Could not load metadata.json — ${err.message}</div>`;
    countEl.textContent = '';
    return;
  }

  populateThemes(state.layers);
  render();

  searchEl.addEventListener('input', (e) => {
    state.query = e.target.value.trim();
    render();
  });

  themeEl.addEventListener('change', (e) => {
    state.theme = e.target.value;
    render();
  });
}

init();
