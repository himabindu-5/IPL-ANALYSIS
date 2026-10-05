
from pathlib import Path
import json

# Folder containing the extracted IPL JSON files
DATA_FOLDER = Path("data/raw/ipl_json")

# Find JSON files, including those inside subfolders
json_files = list(DATA_FOLDER.rglob("*.json"))

print("IPL DATA CHECK")
print("-------------------------")
print("JSON files found:", len(json_files))

if not json_files:
    print("No JSON files found.")
    print("Check the folder path and your extracted files.")
else:
    print("\nFirst five JSON filenames:")

    for file_path in json_files[:5]:
        print(file_path.name)

    # Open one JSON file and inspect its structure
    with json_files[0].open("r", encoding="utf-8") as file:
        match_data = json.load(file)

    print("\nFirst file loaded successfully.")
    print("Top-level sections:", list(match_data.keys()))

    print("\nMatch information:")
    print(match_data.get("info", {}))