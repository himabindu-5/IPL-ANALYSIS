# IPL Analysis Web Application (2008–2026)

A complete, high-performance, full-stack cricket analytics web application built on top of the comprehensive historical IPL dataset covering **1,243 matches**, **295,732 deliveries**, **809 players**, and **19 seasons** (from 2007/08 through 2026).

---

## 🚀 Key Features

1. **Master Dashboard**: Real-time summary cards, season-wise match counts, team victories leaderboard, and season scoring trends.
2. **Match Explorer & Scorecards**: Search and filter 1,243 matches by season, team, venue, or toss decision, with full match scorecards and top performers.
3. **Player Directory & Master Profiles**: Searchable registry of 809 players with career aggregates, season-by-season breakdown, and verified match identity aliases.
4. **Franchise & Team Analytics**: Complete win/loss track records, win percentages, top all-time batters, and match history for all 19 franchises.
5. **Batting Analytics Leaderboard**: Sortable leaderboard by runs, batting average, strike rate, boundaries, 50s, and 100s.
6. **Bowling Analytics Leaderboard**: Sortable leaderboard by wickets, economy rate, bowling average, strike rate, and legal overs.
7. **Head-to-Head Comparison**: Select any two teams to compare overall victories, season-by-season head-to-head records, highest individual scores, and best bowling figures.
8. **Data Quality & Integrity Audit**: Empirical runtime validation verifying ball-by-ball checksums, match counts, and player alias resolutions.

---

## 📊 Dataset & Verified Database Schema

The application uses seven relational data tables:

| Table | Description | Verified Row Count |
| :--- | :--- | :--- |
| `players` | Master registry of unique player IDs and display names | **809** |
| `player_match_aliases` | Match-specific player name resolution mappings | **27,909** |
| `matches` | Match metadata, date, season, venue, toss, winner & result | **1,243** |
| `deliveries` | Ball-by-ball delivery log with runs, extras, and wickets | **295,732** |
| `batting_stats` | Season-by-season batting metrics per player | **2,987** |
| `bowling_stats` | Season-by-season bowling metrics per player | **2,200** |
| `team_season_stats` | Season-by-season franchise win/loss/run records | **166** |

**Match Date Range:** April 18, 2008 – May 31, 2026.

---

## 🛠️ Technology Stack

* **Backend**: Python 3.13, **FastAPI**, Uvicorn, Pydantic, `pg8000` (PostgreSQL client), `sqlite3`
* **Frontend**: **React 19**, TypeScript, **Vite**, **Tailwind CSS v4**, **Recharts**, Lucide Icons
* **Database Layer**: Dual-mode database manager:
  - **Primary**: PostgreSQL database (`ipl_analysis`) on `127.0.0.1:5432`
  - **Secure Integration Fallback**: Local indexed SQLite database (`database/ipl_analysis.db`) generated directly from `data/cleaned/*.csv` if PostgreSQL credentials are not provided.

---

## 🔒 Security & Environment Setup

Database credentials are managed strictly on the server side using environment variables. **No passwords or connection strings are exposed to the browser.**

### Environment Variables (.env)

Create a `.env` file in the project root:

```env
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password_here
PGDATABASE=ipl_analysis
```

*If `PGPASSWORD` is set and PostgreSQL is reachable, the backend connects to your PostgreSQL database. If `PGPASSWORD` is omitted or PostgreSQL is unreachable, the system automatically falls back to `database/ipl_analysis.db` (which contains the exact verified CSV records).*

---

## 🏃 Quickstart: Running the Application Locally

### Option A: Development Mode (Backend + Vite Frontend)

1. **Activate Python Virtual Environment**:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

2. **Start Backend Server (Port 8000)**:
   ```powershell
   uvicorn backend.main:app --reload --port 8000
   ```

3. **Start Frontend Dev Server (Port 3000)** (in a new terminal):
   ```powershell
   cd frontend
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`.

---

### Option B: Production Single-Port Mode

To build the React frontend bundle and serve the entire web application and API through FastAPI:

1. **Build Frontend**:
   ```powershell
   cd frontend
   npm run build
   cd ..
   ```

2. **Start Unified Server**:
   ```powershell
   uvicorn backend.main:app --port 8000
   ```

3. Open your browser at `http://localhost:8000`.

---

## 🧪 Database & Data Quality Audit Results

The application includes an automated audit endpoint (`/api/quality-report`) that verifies dataset integrity on startup:

1. **Delivery Checksum**: `batter_runs + extra_runs == total_runs` was verified across all **295,732** deliveries. **0 mismatches found.**
2. **Match Counts**: `team_season_stats` match sum equals **2,486** (exactly `2 * 1,243` matches, as each match records 2 participating team rows).
3. **Match Winners**: **1,218** decisive match victories recorded in `matches`, matching the sum of wins in `team_season_stats`. The remaining 25 matches account for ties and no-results.
4. **Wicket Rules**: Bowler wickets exclude non-bowler dismissals (run outs, retired hurt) following official MCC Laws of Cricket.
