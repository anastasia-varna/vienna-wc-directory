# 🚻 Free Toilets Vienna

Find free, clean and accessible public toilets in Vienna.

This project is a lightweight directory and interactive map of Vienna's public WC locations built using official Open Government Data from Stadt Wien.

## ✨ Features

- 🗺 Interactive map of public toilets in Vienna
- ♿ Accessible / wheelchair-friendly toilets
- 👶 Baby changing facilities
- 🔑 Euro Key toilets
- 🕒 Opening hours
- 🔎 Search and filtering
- 📱 Mobile-friendly design
- 📍 "Near me" nearest toilet feature
- 🧭 SEO landing pages with structured data
- ⚡ Fast lightweight frontend (no framework)

---

## 📦 Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Leaflet.js
- OpenStreetMap
- Python import scripts

---

## 📂 Project Structure

```text
vienna-wc-directory/
├── data/
│   ├── raw/
│   ├── manual_toilets.json
│   └── toilets.json
│
├── tools/
│   ├── build_static.py
│   └── import_wien_wc.py
│
├── dist/
├── index.html
├── style.css
├── script.js
├── WCANLAGE2OGD.json
└── README.md
```

---

## 🚀 Local Development

### 1. Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/vienna-wc-directory.git
```

### 2. Open project

```bash
cd vienna-wc-directory
```

### 3. Start local server

Generate the site data:

```bash
python tools/import_wien_wc.py
```

Then use VS Code Live Server or any local static server.

---

## ☁️ Cloudflare Pages

Use Cloudflare Pages, not `npx wrangler deploy`.

Recommended settings:

```text
Build command: python tools/build_static.py
Build output directory: dist
Root directory: /
```

The build script generates `data/toilets.json` and copies only public website files into `dist/`.
This avoids publishing `.git`, `.venv`, source data, or temporary Wrangler files.

---

## 🔄 Import Latest Toilet Data

The project uses official Vienna Open Government Data.

Run:

```bash
python tools/import_wien_wc.py
```

This generates:

```text
data/toilets.json
```

---

## 🛠 Manual Toilet Entries

Custom manually verified toilets can be added in:

```text
data/manual_toilets.json
```

These entries are automatically merged into the final dataset during import.

---

## 📊 Data Source

Toilet location data:
Stadt Wien – data.wien.gv.at

License:
CC BY 4.0

This project is not affiliated with or endorsed by Stadt Wien.

---

## 🌍 Future Ideas

- Multilingual support
- Toilet cleanliness ratings
- User submissions
- District pages for SEO
- Europe-wide expansion

---

## ❤️ Why This Exists

Sometimes you urgently need a toilet and government websites are difficult to use on mobile.

This project aims to make finding public toilets in Vienna:
- faster
- simpler
- more accessible
- tourist friendly

---

## ☕ Contributing

Found a missing toilet or wrong information?

Open an issue or submit a pull request.

---

## 📄 License

Code: MIT License

Public toilet location data: CC BY 4.0 — Stadt Wien Open Government Data
https://data.wien.gv.at

This project is not affiliated with or endorsed by Stadt Wien.
