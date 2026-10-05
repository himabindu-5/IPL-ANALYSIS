
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
JSON_DIR = BASE_DIR / "data" / "raw" / "ipl_json"

files = sorted(JSON_DIR.glob("*.json"))

if not files:
    raise FileNotFoundError(
        f"No JSON files found in {JSON_DIR}"
    )

print("JSON files found:", len(files))

for file_path in files[:3]:
    print("\n" + "=" * 60)
    print("FILE:", file_path.name)
    print("=" * 60)

    with file_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    registry = data.get("info", {}).get("registry", {})
    people = registry.get("people", {})

    print("Registry keys:", list(registry.keys()))
    print("Player registry entries:", len(people))

    for name, player_id in list(people.items())[:10]:
        print(f"{name} -> {player_id}")