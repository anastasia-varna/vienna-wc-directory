
# Free Toilets Vienna — MVP

Lightweight SEO-first directory website.

## Features
- OpenStreetMap + Leaflet
- Mobile-friendly
- SEO-optimized homepage
- Search functionality
- JSON-based data structure
- Easy deployment

## Recommended Hosting
- Cloudflare Pages
- Vercel
- Netlify

## Next Steps
1. Add 100+ toilets
2. Create district pages
3. Add user submissions
4. Add cleanliness ratings
5. Add photos
6. Add structured schema.org markup

## SEO Targets
- free toilets vienna
- public wc vienna
- clean toilets vienna
- accessible toilets vienna
- toilet near stephansplatz


## Data note
The current database is an enriched starter dataset. Schedules marked "Needs verification" should be checked against the official Stadt Wien district WC pages or by field visit before public launch.

## Added in v2
- 16 starter locations
- Schedule field
- Schedule verification notes
- Filters: free, accessible, baby changing, open now
- Better popup information

## Added in v3 — Wien.gv importer

This version includes a lightweight importer for the official Stadt Wien public WC data.

### Run the importer

```bash
pip install -r requirements.txt
python tools/import_wien_wc.py
```

The importer creates/updates:

- `data/raw/wien_wc_raw.json` — raw downloaded official JSON
- `data/toilets.json` — normalized data used by the website

### Source attribution

The imported official data should be credited on the website as:

> Source: Stadt Wien / wien.gv.at, CC BY 4.0

Do not copy long official text descriptions directly. Use the factual data as a base and add your own value layer: photos, field notes, cleanliness, safety, queue information and user reports.

### Important

The importer is defensive because official public data formats can change. Always review `data/toilets.json` after importing before publishing.
