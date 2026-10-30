import os
import sys
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

PUBLIC_API_DIR = ROOT / "frontend" / "public" / "api"
DIST_API_DIR = ROOT / "frontend" / "dist" / "api"

for d in [PUBLIC_API_DIR, DIST_API_DIR]:
    d.mkdir(parents=True, exist_ok=True)

def safe_write(file_path: Path, content: bytes):
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        if file_path.is_dir():
            return
        file_path.write_bytes(content)
    except Exception as e:
        print(f"Warning writing {file_path}: {e}")

def save_endpoint(path_str: str, content: bytes, is_index: bool = False):
    clean_path = path_str.split("?")[0]
    if clean_path.startswith("/api/"):
        clean_path = clean_path[5:]
    elif clean_path.startswith("api/"):
        clean_path = clean_path[4:]
    clean_path = clean_path.lstrip("/")

    for base_dir in [PUBLIC_API_DIR, DIST_API_DIR]:
        if is_index:
            target_dir = base_dir / clean_path
            target_dir.mkdir(parents=True, exist_ok=True)
            safe_write(target_dir / "index", content)
            safe_write(target_dir / "index.json", content)
            safe_write(base_dir / f"{clean_path}.json", content)
        else:
            target = base_dir / clean_path
            if target.is_dir():
                safe_write(target / "index", content)
                safe_write(target / "index.json", content)
            else:
                safe_write(target, content)
            safe_write(Path(str(target) + ".json"), content)

def main():
    print("Generating static API JSON responses...")
    
    leaf_routes = [
        "/api/status",
        "/api/dashboard",
        "/api/seasons",
        "/api/batting",
        "/api/bowling",
        "/api/quality-report"
    ]
    
    for r in leaf_routes:
        resp = client.get(r)
        if resp.status_code == 200:
            save_endpoint(r, resp.content)
            print(f"  [OK] {r}")
        else:
            print(f"  [ERR {resp.status_code}] {r}")
            
    save_endpoint("/api/teams", client.get("/api/teams").content, is_index=True)
    save_endpoint("/api/players", client.get("/api/players?limit=1000").content, is_index=True)
    save_endpoint("/api/matches", client.get("/api/matches?limit=1000").content, is_index=True)
    print("  [OK] Base index routes: teams, players, matches")

    # Team profiles
    teams_resp = client.get("/api/teams")
    if teams_resp.status_code == 200:
        teams_data = teams_resp.json()
        teams = teams_data.get("teams", []) if isinstance(teams_data, dict) else teams_data
        for t in teams:
            team_name = t if isinstance(t, str) else (t.get("name") or t.get("team") or t.get("team_name"))
            if team_name:
                t_route = f"/api/teams/{team_name}"
                resp = client.get(t_route)
                if resp.status_code == 200:
                    save_endpoint(t_route, resp.content)
                    
                t_analysis_route = f"/api/team-analysis?team={team_name}"
                resp_a = client.get(t_analysis_route)
                if resp_a.status_code == 200:
                    save_endpoint(f"/api/team-analysis/{team_name}", resp_a.content)
        print("  [OK] Team profiles and team-analysis generated")

    # Top player profiles
    players_resp = client.get("/api/players?limit=200")
    if players_resp.status_code == 200:
        players_data = players_resp.json()
        players = players_data.get("players", []) if isinstance(players_data, dict) else players_data
        for p in players:
            pid = p.get("player_id") if isinstance(p, dict) else None
            if pid:
                p_route = f"/api/players/{pid}"
                resp = client.get(p_route)
                if resp.status_code == 200:
                    save_endpoint(p_route, resp.content)
        print("  [OK] Top player profiles generated")

    # Match details for recent matches
    matches_resp = client.get("/api/matches?limit=100")
    if matches_resp.status_code == 200:
        matches_data = matches_resp.json()
        matches = matches_data.get("matches", []) if isinstance(matches_data, dict) else matches_data
        for m in matches:
            mid = m.get("match_id") if isinstance(m, dict) else None
            if mid:
                m_route = f"/api/matches/{mid}"
                resp = client.get(m_route)
                if resp.status_code == 200:
                    save_endpoint(m_route, resp.content)
        print("  [OK] Match detail files generated")

    print("Static API JSON generation complete!")

if __name__ == "__main__":
    main()
