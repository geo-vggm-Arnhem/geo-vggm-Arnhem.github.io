# GIS Metadata Catalogue

A lightweight, JSON-driven metadata catalogue for GIS layers. No Python,
no build step, no GitHub Actions — edit `data/metadata.json` and the
site updates itself.

## Structure

```
gis-metadata/
├── data/
│   └── metadata.json      ← the only file you normally need to edit
├── docs/
│   ├── index.html         ← catalogue listing (searchable/filterable)
│   ├── layer.html         ← single-layer detail page
│   ├── app.js             ← index page logic
│   ├── layer.js           ← detail page logic
│   ├── style.css          ← shared styling
│   └── data/
│       └── metadata.json  ← copy of data/metadata.json (see note below)
└── README.md
```

**Note on the two `metadata.json` files:** GitHub Pages can only publish
one folder (either the repo root or `/docs`), so the copy the *website*
reads lives at `docs/data/metadata.json`. The one at the repo root
(`data/metadata.json`) is there so the source data isn't buried inside
the "site" folder. Keep both in sync — the steps below show a one-line
way to do that without any tooling.

If you'd rather maintain a single copy, just delete `data/metadata.json`
at the root and only ever edit `docs/data/metadata.json`.

## Editing the data

Each layer in `metadata.json` is one object in the array. Copy an
existing entry and adjust the fields:

- `id` — used in the URL (`layer.html?id=roads`), keep it short and unique
- `theme` — free text; also used for the filter dropdown and colour tag
- `description.abstract/purpose/lineage` — shown at the top of the layer page
- `spatial.bounding_box` — draws the small extent diagram
- `access.download/wms/wfs` — rendered as buttons; omit any you don't have

No other file needs to change when you add, remove, or edit a layer.

## Running it locally

Browsers block `fetch()` on files opened directly from disk, so serve
the `docs` folder with any static server, for example:

```bash
cd gis-metadata/docs
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publishing with GitHub Pages

1. Create a new repository on GitHub and push this folder to it:
   ```bash
   cd gis-metadata
   git init
   git add .
   git commit -m "Initial GIS metadata catalogue"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch".
4. Set **Branch** to `main` and the folder to **`/docs`**, then **Save**.
5. Wait a minute or two, then your site will be live at
   `https://<your-username>.github.io/<your-repo>/`.

## Updating the catalogue after publishing

```bash
# edit docs/data/metadata.json (and data/metadata.json if you keep both)
git add .
git commit -m "Update layer metadata"
git push
```

GitHub Pages redeploys automatically within a minute or two — no
Actions, no Python, no conversion step.

## Extending it later

- **Map preview:** the `spatial.bounding_box` field already exists in
  the data; the illustrative box on the layer page could be swapped
  for a real Leaflet or OpenLayers map using the same coordinates.
- **Live WMS/WFS preview:** if `access.wms` is set, that same map could
  render the actual service as a tile layer instead of just linking to it.
- **More themes:** the theme filter and colour tags are generated from
  whatever values appear in the data — no code changes needed to add one.
