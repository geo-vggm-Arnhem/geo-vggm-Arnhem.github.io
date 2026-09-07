// GIS Metadata Catalogue — layer detail page logic
// Fetches data/metadata.json, finds the layer matching ?id=, and renders it.

const DATA_URL = 'data/metadata.json';
const contentEl = document.getElementById('layer-content');

function themeSlug(theme) {
  return (theme || '').toLowerCase().replace(/\s+/g, '-');
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function bboxSvg(bbox) {
  if (!bbox) return '';
  const { west, south, east, north } = bbox;
  // Simple normalized frame: draw the extent rectangle inside a fixed
  // reference frame, purely illustrative (not a projected map).
  const w = west, s = south, e = east, n = north;
  const pad = 0.15;
  const spanX = e - w || 1;
  const spanY = n - s || 1;
  const fx = w - spanX * pad;
  const fy = s - spanY * pad;
  const fw = spanX * (1 + pad * 2);
  const fh = spanY * (1 + pad * 2);

  const toX = (x) => ((x - fx) / fw) * 180;
  const toY = (y) => 120 - ((y - fy) / fh) * 120;

  const x1 = toX(w), x2 = toX(e);
  const y1 = toY(n), y2 = toY(s);

  return `
    <svg class="bbox-svg" width="200" height="140" viewBox="0 0 200 140" role="img"
         aria-label="Bounding box from ${w} to ${e} longitude and ${s} to ${n} latitude">
      <rect class="frame" x="10" y="10" width="180" height="120" />
      <rect class="extent" x="${(10 + x1).toFixed(1)}" y="${(10 + y1).toFixed(1)}"
            width="${(x2 - x1).toFixed(1)}" height="${(y2 - y1).toFixed(1)}" />
      <text x="10" y="8">${n.toFixed(2)}°N</text>
      <text x="10" y="136">${s.toFixed(2)}°N</text>
      <text x="12" y="20" text-anchor="start">${w.toFixed(2)}°E</text>
      <text x="188" y="20" text-anchor="end">${e.toFixed(2)}°E</text>
    </svg>
  `;
}

function accessButtons(access) {
  if (!access) return '<p class="prose">No access endpoints published.</p>';
  const buttons = [];
  if (access.download) {
    buttons.push(`<a class="action-btn primary" href="${access.download}">&#8595; Download</a>`);
  }
  if (access.wms) {
    buttons.push(`<a class="action-btn" href="${access.wms}">&#9678; WMS</a>`);
  }
  if (access.wfs) {
    buttons.push(`<a class="action-btn" href="${access.wfs}">&#9678; WFS</a>`);
  }
  if (buttons.length === 0) return '<p class="prose">No access endpoints published.</p>';
  return `<div class="action-row">${buttons.join('')}</div>`;
}

function render(layer) {
  const desc = layer.description || {};
  const spatial = layer.spatial || {};
  const temporal = layer.temporal || {};
  const data = layer.data || {};
  const quality = layer.quality || {};
  const maintenance = layer.maintenance || {};
  const org = layer.organisation || {};
  const license = layer.license || {};

  document.title = `${layer.title} — GIS Metadata Catalogue`;

  contentEl.innerHTML = `
    <header class="layer-header">
      <span class="tag theme-${themeSlug(layer.theme)} theme-tag">${escapeHtml(layer.theme || '')}</span>
      <h1>${escapeHtml(layer.title)}</h1>
      <p class="abstract">${escapeHtml(desc.abstract || '')}</p>
    </header>

    <section class="section">
      <h2>Overview</h2>
      ${desc.purpose ? `<p class="prose"><span class="label">Purpose</span>${escapeHtml(desc.purpose)}</p>` : ''}
      ${desc.lineage ? `<p class="prose"><span class="label">Lineage</span>${escapeHtml(desc.lineage)}</p>` : ''}
    </section>

    <section class="section">
      <h2>Spatial information</h2>
      <div class="bbox-figure">
        ${bboxSvg(spatial.bounding_box)}
        <div class="field-grid">
          <span class="field-label">CRS</span><span class="field-value">${escapeHtml(spatial.crs || '—')}</span>
          <span class="field-label">Geometry</span><span class="field-value">${escapeHtml(data.geometry || '—')}</span>
          <span class="field-label">Scale</span><span class="field-value">${escapeHtml(data.scale || '—')}</span>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Temporal coverage</h2>
      <div class="field-grid">
        <span class="field-label">Start</span><span class="field-value">${formatDate(temporal.start)}</span>
        <span class="field-label">End</span><span class="field-value">${formatDate(temporal.end)}</span>
      </div>
    </section>

    <section class="section">
      <h2>Data</h2>
      <div class="field-grid">
        <span class="field-label">Format</span><span class="field-value">${escapeHtml(data.format || '—')}</span>
        <span class="field-label">Encoding</span><span class="field-value">${escapeHtml(data.encoding || '—')}</span>
      </div>
    </section>

    <section class="section">
      <h2>Quality</h2>
      <div class="field-grid">
        <span class="field-label">Accuracy</span><span class="field-value">${escapeHtml(quality.accuracy || '—')}</span>
        <span class="field-label">Completeness</span><span class="field-value">${escapeHtml(quality.completeness || '—')}</span>
      </div>
    </section>

    <section class="section">
      <h2>Maintenance</h2>
      <div class="field-grid">
        <span class="field-label">Status</span><span class="field-value">${escapeHtml(maintenance.status || '—')}</span>
        <span class="field-label">Frequency</span><span class="field-value">${escapeHtml(maintenance.frequency || '—')}</span>
        <span class="field-label">Last updated</span><span class="field-value">${formatDate(maintenance.last_updated)}</span>
      </div>
    </section>

    <section class="section">
      <h2>Organisation</h2>
      <div class="field-grid">
        <span class="field-label">Owner</span><span class="field-value">${escapeHtml(org.owner || '—')}</span>
        <span class="field-label">Contact</span><span class="field-value">${escapeHtml(org.contact || '—')}</span>
      </div>
    </section>

    <section class="section">
      <h2>Access</h2>
      ${accessButtons(layer.access)}
    </section>

    <section class="section">
      <h2>License</h2>
      <p class="prose">${license.url ? `<a href="${license.url}">${escapeHtml(license.name || license.url)}</a>` : escapeHtml(license.name || '—')}</p>
    </section>

    <section class="section" style="border-bottom: none;">
      <h2>Keywords</h2>
      <div class="keywords">
        ${(layer.keywords || []).map((k) => `<span class="keyword-chip">${escapeHtml(k)}</span>`).join('')}
      </div>
    </section>
  `;
}

async function init() {
  const id = new URLSearchParams(window.location.search).get('id');

  if (!id) {
    contentEl.innerHTML = '<p class="empty-state">No layer specified. Go back to the catalogue and pick one.</p>';
    return;
  }

  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Failed to load metadata (${res.status})`);
    const layers = await res.json();
    const layer = layers.find((l) => l.id === id);

    if (!layer) {
      contentEl.innerHTML = `<p class="empty-state">No layer found with id "${escapeHtml(id)}".</p>`;
      return;
    }

    render(layer);
  } catch (err) {
    contentEl.innerHTML = `<p class="empty-state">Could not load layer — ${escapeHtml(err.message)}</p>`;
  }
}

init();
