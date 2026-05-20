import json
from pathlib import Path

import requests

WFS_URL = (
    "https://data.wien.gv.at/daten/geo"
    "?service=WFS"
    "&version=1.1.0"
    "&request=GetFeature"
    "&typeName=ogdwien:WCANLAGE2OGD"
    "&srsName=EPSG:4326"
    "&outputFormat=application/json"
)

HEADERS = {
    "User-Agent": "ViennaWCDirectory/0.1 contact: your-email@example.com",
    "Accept-Language": "de-AT,de;q=0.9,en;q=0.8",
}

OUTPUT = Path("data/toilets.json")


def contains(text, keyword):
    return keyword.lower() in (text or "").lower()


def is_free(personalbetreuung):
    text = (personalbetreuung or "").lower()
    if "0,50" in text or "0.50" in text:
        return False
    if "gratis" in text:
        return True
    return True


def normalize_feature(feature):
    props = feature["properties"]
    lon, lat = feature["geometry"]["coordinates"]

    name = props.get("STRASSE") or "Public WC"
    location_note = props.get("ORTSANGABE")

    category = props.get("KATEGORIE") or ""
    equipment = props.get("AUSSTATTUNG") or ""
    personal = props.get("PERSONALBETREUUNG") or ""
    restrictions = props.get("EINSCHRAENKUNGEN") or ""

    full_text = " ".join([
        category,
        equipment,
        personal,
        restrictions,
        props.get("ICON_TXT") or "",
    ])

    return {
        "id": props.get("WC_ID"),
        "name": name,
        "district": str(props.get("BEZIRK")).zfill(2),
        "lat": lat,
        "lng": lon,
        "free": is_free(personal),
        "accessible": contains(full_text, "barrierefrei"),
        "staffed": "ja" in personal.lower() or "mo-" in personal.lower(),
        "baby_changing": contains(full_text, "wickel"),
        "euro_key": contains(full_text, "euro"),
        "defibrillator": contains(full_text, "defibrilator") or contains(full_text, "defibrillator"),
        "tampon_pads": contains(full_text, "tampon") or contains(full_text, "binden"),
        "schedule": props.get("OEFFNUNGSZEIT") or "Needs verification",
        "restrictions": restrictions,
        "location_note": location_note,
        "personal_service": personal,
        "category": category,
        "equipment": equipment,
        "active": props.get("AKTIV_TXT") == "JA",
        "department": props.get("ABTEILUNG"),
        "contact": props.get("KONTAKT"),
        "source": "Stadt Wien Open Government Data",
        "source_url": "https://www.wien.gv.at/zusammenleben/oeffentliche-wc",
        "data_license": "CC BY 4.0",
        "notes": "; ".join(
            part for part in [location_note, restrictions, equipment] if part
        )
    }


def main():
    LOCAL_GEOJSON = Path("WCANLAGE2OGD.json")

    print("Loading local WC GeoJSON...")

    with LOCAL_GEOJSON.open("r", encoding="utf-8") as f:
        geojson = json.load(f)

    features = geojson["features"]

    toilets = [normalize_feature(feature) for feature in features]

    manual_file = Path("data/manual_toilets.json")

    if manual_file.exists():
        with manual_file.open("r", encoding="utf-8") as f:
            manual_toilets = json.load(f)

        print(f"Adding {len(manual_toilets)} manual toilets")

        toilets.extend(manual_toilets)

    OUTPUT.parent.mkdir(exist_ok=True)

    with OUTPUT.open("w", encoding="utf-8") as f:
        json.dump(toilets, f, ensure_ascii=False, indent=2)

    print(f"Saved normalized site data: {OUTPUT.resolve()}")
    print(f"Imported toilets: {len(toilets)}")


if __name__ == "__main__":
    main()