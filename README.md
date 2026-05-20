# Free Toilets Vienna

Find free, clean and accessible public toilets in Vienna.

This project is a lightweight directory and interactive map of Vienna's public WC locations built using official Open Government Data from Stadt Wien.

## Features

- Interactive Leaflet map of public toilets in Vienna
- Marker clustering for dense city areas
- "Near me" feature with directions
- Accessible / wheelchair-friendly toilet filter
- Baby changing facilities filter
- Opening hours and status hints
- Search and filtering
- Mobile-friendly design
- SEO landing pages
- Structured data with Schema.org JSON-LD
- Fast lightweight frontend with no framework

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Leaflet.js
- OpenStreetMap
- Python import scripts

## Project Structure

```text
vienna-wc-directory/
├── data/
│   ├── raw/
│   ├── manual_toilets.json
│   └── toilets.json
│
├── tools/
│   └── import_wien_wc.py
│
├── index.html
├── style.css
├── script.js
├── seo-pages.js
├── WCANLAGE2OGD.json
└── README.md
```

## Local Development

Clone the repository:

```bash
git clone https://github.com/anastasia-varna/vienna-wc-directory.git
cd vienna-wc-directory
```

Generate the website data:

```bash
python tools/import_wien_wc.py
```

Start a local static server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Import Latest Toilet Data

The project currently reads the local official data snapshot:

```text
WCANLAGE2OGD.json
```

Run:

```bash
python tools/import_wien_wc.py
```

This generates:

```text
data/toilets.json
```

`data/toilets.json` is ignored by git because it is generated.

## Manual Toilet Entries

Custom manually verified toilets can be added in:

```text
data/manual_toilets.json
```

These entries are automatically merged into the final dataset during import.

## SEO Pages

The project includes focused static pages for search traffic:

- `free-toilets-vienna.html`
- `accessible-toilets-vienna.html`
- `public-toilets-1010-vienna.html`
- `toilets-near-stephansplatz.html`
- `toilets-near-prater.html`

Remember to replace `https://yourdomain.at/` in canonical links, `robots.txt`, and `sitemap.xml` before production launch.

## Data Source

Toilet location data:
Stadt Wien Open Government Data

License:
CC BY 4.0

This project is not affiliated with or endorsed by Stadt Wien.

## Future Ideas

- Multilingual support
- Toilet cleanliness ratings
- User submissions
- Photos and field notes
- More district and landmark pages
- Europe-wide expansion

## License

Code:
MIT License

Public toilet location data:
CC BY 4.0 - Stadt Wien Open Government Data
https://data.wien.gv.at
