import shutil
import os
from pathlib import Path

from import_wien_wc import main as import_toilets

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

STATIC_FILES = [
    "24-hour-toilets-vienna.html",
    "404.html",
    "accessible-toilets-vienna.html",
    "free-toilets-vienna.html",
    "index.html",
    "public-toilets-1010-vienna.html",
    "public-toilets-1070-vienna.html",
    "robots.txt",
    "script.js",
    "seo-pages.js",
    "sitemap.xml",
    "style.css",
    "toilets-near-prater.html",
    "toilets-near-schonbrunn.html",
    "toilets-near-stephansplatz.html",
    "toilets-near-westbahnhof.html",
    "wheelchair-toilets-vienna.html",
]


def copy_if_exists(relative_path):
    source = ROOT / relative_path
    if not source.exists():
        return

    destination = DIST / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def main():
    os.chdir(ROOT)
    import_toilets()

    resolved_dist = DIST.resolve()
    resolved_root = ROOT.resolve()

    if resolved_dist.exists():
        if resolved_root not in resolved_dist.parents:
            raise RuntimeError(f"Refusing to remove unexpected path: {resolved_dist}")
        shutil.rmtree(resolved_dist)

    DIST.mkdir(parents=True)

    for relative_path in STATIC_FILES:
        copy_if_exists(relative_path)

    copy_if_exists("data/toilets.json")

    print(f"Built static site: {DIST}")


if __name__ == "__main__":
    main()
