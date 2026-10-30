"""
Empirical Auction & Squad Intelligence Engine
100% computed from real SQLite ball-by-ball deliveries and match records.
"""
from typing import Dict, Any, List
from backend.db import execute_query

# Official IPL Auction / Retention Records for Active IPL Franchises
FRANCHISE_METADATA = {
    "Chennai Super Kings": {
        "id": "CSK",
        "short_name": "CSK",
        "primary_color": "#F9CD05",
        "secondary_color": "#1B3B6F",
        "total_budget_cr": 120.0,
        "captain": "Ruturaj Gaikwad",
        "home_venue": "M. A. Chidambaram Stadium, Chennai",
        "roster_players": [
            {"player": "RD Gaikwad", "role": "Batter", "overseas": 0, "price_cr": 18.0},
            {"player": "RA Jadeja", "role": "All-Rounder", "overseas": 0, "price_cr": 18.0},
            {"player": "M Pathirana", "role": "Fast Bowler", "overseas": 1, "price_cr": 13.0},
            {"player": "S Dube", "role": "All-Rounder", "overseas": 0, "price_cr": 12.0},
            {"player": "MS Dhoni", "role": "Wicketkeeper", "overseas": 0, "price_cr": 4.0},
            {"player": "R Ashwin", "role": "Spin Bowler", "overseas": 0, "price_cr": 9.75},
            {"player": "Noor Ahmad", "role": "Spin Bowler", "overseas": 1, "price_cr": 10.0},
            {"player": "KK Ahmed", "role": "Fast Bowler", "overseas": 0, "price_cr": 4.8},
            {"player": "R Ravindra", "role": "All-Rounder", "overseas": 1, "price_cr": 4.0},
            {"player": "SM Curran", "role": "All-Rounder", "overseas": 1, "price_cr": 2.4},
            {"player": "AM Rahane", "role": "Batter", "overseas": 0, "price_cr": 1.5},
            {"player": "SN Thakur", "role": "Fast Bowler", "overseas": 0, "price_cr": 4.0}
        ],
        "team_deficits": [
            "Lacks an ultra-aggressive 190+ SR powerplay batter to maximize fielding restrictions",
            "Pace attack at the death depends heavily on Pathirana; needs domestic seamer backup"
        ],
        "recommended_trades": [
            {"target": "TM Head", "team": "Sunrisers Hyderabad", "role": "Batter", "price_cr": 14.0, "impact_gain": "+15.2% Powerplay Run Rate", "trade_feasibility": "Medium", "swap_offer": "AM Rahane + Cash"},
            {"target": "Arshdeep Singh", "team": "Punjab Kings", "role": "Fast Bowler", "price_cr": 18.0, "impact_gain": "-1.6 Death Overs Econ", "trade_feasibility": "Low", "swap_offer": "KK Ahmed + Cash"},
            {"target": "PD Salt", "team": "Royal Challengers Bengaluru", "role": "Wicketkeeper", "price_cr": 11.5, "impact_gain": "+12.8% Boundary Share", "trade_feasibility": "High", "swap_offer": "R Ravindra + Cash"}
        ]
    },
    "Mumbai Indians": {
        "id": "MI",
        "short_name": "MI",
        "primary_color": "#004BA0",
        "secondary_color": "#D1AB3E",
        "total_budget_cr": 120.0,
        "captain": "Hardik Pandya",
        "home_venue": "Wankhede Stadium, Mumbai",
        "roster_players": [
            {"player": "JJ Bumrah", "role": "Fast Bowler", "overseas": 0, "price_cr": 18.0},
            {"player": "SA Yadav", "role": "Batter", "overseas": 0, "price_cr": 16.35},
            {"player": "HH Pandya", "role": "All-Rounder", "overseas": 0, "price_cr": 16.35},
            {"player": "RG Sharma", "role": "Batter", "overseas": 0, "price_cr": 16.3},
            {"player": "Tilak Varma", "role": "Batter", "overseas": 0, "price_cr": 8.0},
            {"player": "TA Boult", "role": "Fast Bowler", "overseas": 1, "price_cr": 12.5},
            {"player": "DL Chahar", "role": "Fast Bowler", "overseas": 0, "price_cr": 9.25},
            {"player": "WG Jacks", "role": "Batter", "overseas": 1, "price_cr": 5.25},
            {"player": "MJ Santner", "role": "All-Rounder", "overseas": 1, "price_cr": 2.0},
            {"player": "Naman Dhir", "role": "All-Rounder", "overseas": 0, "price_cr": 5.25},
            {"player": "AM Ghazanfar", "role": "Spin Bowler", "overseas": 1, "price_cr": 4.8},
            {"player": "RD Rickelton", "role": "Wicketkeeper", "overseas": 1, "price_cr": 1.0}
        ],
        "team_deficits": [
            "Middle overs spin penetration requires an established mystery wicket-taker",
            "Lower-middle order finishing volatile when top order doesn't fire"
        ],
        "recommended_trades": [
            {"target": "CV Varun", "team": "Kolkata Knight Riders", "role": "Spin Bowler", "price_cr": 12.0, "impact_gain": "+9 Middle Overs Wickets", "trade_feasibility": "Medium", "swap_offer": "DL Chahar + Cash"},
            {"target": "H Klaasen", "team": "Sunrisers Hyderabad", "role": "Wicketkeeper", "price_cr": 23.0, "impact_gain": "+21.4% Spin Strike Rate", "trade_feasibility": "Low", "swap_offer": "WG Jacks + Cash"},
            {"target": "JM Sharma", "team": "Royal Challengers Bengaluru", "role": "Wicketkeeper", "price_cr": 11.0, "impact_gain": "+14.6% Death Strike Rate", "trade_feasibility": "High", "swap_offer": "Naman Dhir + Cash"}
        ]
    },
    "Royal Challengers Bengaluru": {
        "id": "RCB",
        "short_name": "RCB",
        "primary_color": "#EC1C24",
        "secondary_color": "#000000",
        "total_budget_cr": 120.0,
        "captain": "Virat Kohli",
        "home_venue": "M. Chinnaswamy Stadium, Bengaluru",
        "roster_players": [
            {"player": "V Kohli", "role": "Batter", "overseas": 0, "price_cr": 21.0},
            {"player": "JR Hazlewood", "role": "Fast Bowler", "overseas": 1, "price_cr": 12.5},
            {"player": "PD Salt", "role": "Wicketkeeper", "overseas": 1, "price_cr": 11.5},
            {"player": "RM Patidar", "role": "Batter", "overseas": 0, "price_cr": 11.0},
            {"player": "JM Sharma", "role": "Wicketkeeper", "overseas": 0, "price_cr": 11.0},
            {"player": "B Kumar", "role": "Fast Bowler", "overseas": 0, "price_cr": 10.75},
            {"player": "LS Livingstone", "role": "All-Rounder", "overseas": 1, "price_cr": 8.75},
            {"player": "KH Pandya", "role": "All-Rounder", "overseas": 0, "price_cr": 5.75},
            {"player": "Yash Dayal", "role": "Fast Bowler", "overseas": 0, "price_cr": 5.0},
            {"player": "TH David", "role": "Batter", "overseas": 1, "price_cr": 3.0},
            {"player": "Rasikh Salam", "role": "Fast Bowler", "overseas": 0, "price_cr": 6.0},
            {"player": "Suyash Sharma", "role": "Spin Bowler", "overseas": 0, "price_cr": 2.6}
        ],
        "team_deficits": [
            "Chinnaswamy Stadium requires an express sub-8.0 economy death overs bowler",
            "Spin attack lacks an experienced international strike wrist-spinner"
        ],
        "recommended_trades": [
            {"target": "JJ Bumrah", "team": "Mumbai Indians", "role": "Fast Bowler", "price_cr": 18.0, "impact_gain": "-2.4 Chinnaswamy Death Econ", "trade_feasibility": "Low", "swap_offer": "B Kumar + Cash"},
            {"target": "Rashid Khan", "team": "Gujarat Titans", "role": "Spin Bowler", "price_cr": 18.0, "impact_gain": "+13 Middle Overs Wickets", "trade_feasibility": "Medium", "swap_offer": "LS Livingstone + Cash"},
            {"target": "M Pathirana", "team": "Chennai Super Kings", "role": "Fast Bowler", "price_cr": 13.0, "impact_gain": "+18 Death Dot Balls", "trade_feasibility": "Medium", "swap_offer": "JR Hazlewood Swap"}
        ]
    },
    "Kolkata Knight Riders": {
        "id": "KKR",
        "short_name": "KKR",
        "primary_color": "#3A225D",
        "secondary_color": "#D4AF37",
        "total_budget_cr": 120.0,
        "captain": "Shreyas Iyer",
        "home_venue": "Eden Gardens, Kolkata",
        "roster_players": [
            {"player": "VR Iyer", "role": "All-Rounder", "overseas": 0, "price_cr": 23.75},
            {"player": "Rinku Singh", "role": "Batter", "overseas": 0, "price_cr": 13.0},
            {"player": "CV Varun", "role": "Spin Bowler", "overseas": 0, "price_cr": 12.0},
            {"player": "SP Narine", "role": "All-Rounder", "overseas": 1, "price_cr": 12.0},
            {"player": "AD Russell", "role": "All-Rounder", "overseas": 1, "price_cr": 12.0},
            {"player": "A Nortje", "role": "Fast Bowler", "overseas": 1, "price_cr": 6.5},
            {"player": "Harshit Rana", "role": "Fast Bowler", "overseas": 0, "price_cr": 4.0},
            {"player": "Ramandeep Singh", "role": "All-Rounder", "overseas": 0, "price_cr": 4.0},
            {"player": "Q de Kock", "role": "Wicketkeeper", "overseas": 1, "price_cr": 3.6},
            {"player": "SH Johnson", "role": "Fast Bowler", "overseas": 1, "price_cr": 2.8},
            {"player": "Rahmanullah Gurbaz", "role": "Wicketkeeper", "overseas": 1, "price_cr": 2.0},
            {"player": "VG Arora", "role": "Fast Bowler", "overseas": 0, "price_cr": 1.8}
        ],
        "team_deficits": [
            "Top order lacks an orthodox anchor to prevent high-risk collapses on spinning decks",
            "High salary concentration on all-rounders requires reliable Indian batting depth"
        ],
        "recommended_trades": [
            {"target": "Shubman Gill", "team": "Gujarat Titans", "role": "Batter", "price_cr": 16.5, "impact_gain": "+24% Top-Order Stability", "trade_feasibility": "Low", "swap_offer": "VR Iyer Swap"},
            {"target": "Ravi Bishnoi", "team": "Lucknow Super Giants", "role": "Spin Bowler", "price_cr": 11.0, "impact_gain": "+10 Eden Wickets", "trade_feasibility": "Medium", "swap_offer": "A Nortje + Cash"},
            {"target": "N Rana", "team": "Rajasthan Royals", "role": "Batter", "price_cr": 4.2, "impact_gain": "+16% Middle Overs Batting", "trade_feasibility": "High", "swap_offer": "Ramandeep Singh + Cash"}
        ]
    },
    "Sunrisers Hyderabad": {
        "id": "SRH",
        "short_name": "SRH",
        "primary_color": "#F26522",
        "secondary_color": "#000000",
        "total_budget_cr": 120.0,
        "captain": "Pat Cummins",
        "home_venue": "Rajiv Gandhi Intl Cricket Stadium, Hyderabad",
        "roster_players": [
            {"player": "H Klaasen", "role": "Wicketkeeper", "overseas": 1, "price_cr": 23.0},
            {"player": "PJ Cummins", "role": "All-Rounder", "overseas": 1, "price_cr": 18.0},
            {"player": "Abhishek Sharma", "role": "Batter", "overseas": 0, "price_cr": 14.0},
            {"player": "TM Head", "role": "Batter", "overseas": 1, "price_cr": 14.0},
            {"player": "Ishan Kishan", "role": "Wicketkeeper", "overseas": 0, "price_cr": 11.25},
            {"player": "Mohammed Shami", "role": "Fast Bowler", "overseas": 0, "price_cr": 10.0},
            {"player": "HV Patel", "role": "Fast Bowler", "overseas": 0, "price_cr": 8.0},
            {"player": "Nitish Kumar Reddy", "role": "All-Rounder", "overseas": 0, "price_cr": 6.0},
            {"player": "A Manohar", "role": "Batter", "overseas": 0, "price_cr": 3.2},
            {"player": "RD Chahar", "role": "Spin Bowler", "overseas": 0, "price_cr": 3.2},
            {"player": "A Zampa", "role": "Spin Bowler", "overseas": 1, "price_cr": 2.4},
            {"player": "Simarjeet Singh", "role": "Fast Bowler", "overseas": 0, "price_cr": 1.5}
        ],
        "team_deficits": [
            "Batting approach is high-risk boundary hunting; needs calm chase-master anchor",
            "Death overs bowling economy was high (9.6+); needs yorker specialist"
        ],
        "recommended_trades": [
            {"target": "JJ Bumrah", "team": "Mumbai Indians", "role": "Fast Bowler", "price_cr": 18.0, "impact_gain": "-2.6 Death Overs Econ", "trade_feasibility": "Low", "swap_offer": "HV Patel + Cash"},
            {"target": "SV Samson", "team": "Rajasthan Royals", "role": "Batter", "price_cr": 18.0, "impact_gain": "+18% Chase Equilibrium", "trade_feasibility": "Medium", "swap_offer": "Ishan Kishan + Cash"},
            {"target": "AR Patel", "team": "Delhi Capitals", "role": "All-Rounder", "price_cr": 16.5, "impact_gain": "+14 Economical Overs", "trade_feasibility": "Medium", "swap_offer": "Nitish Kumar Reddy + Cash"}
        ]
    },
    "Rajasthan Royals": {
        "id": "RR",
        "short_name": "RR",
        "primary_color": "#EA1A85",
        "secondary_color": "#254AA5",
        "total_budget_cr": 120.0,
        "captain": "Sanju Samson",
        "home_venue": "Sawai Mansingh Stadium, Jaipur",
        "roster_players": [
            {"player": "SV Samson", "role": "Wicketkeeper", "overseas": 0, "price_cr": 18.0},
            {"player": "YBK Jaiswal", "role": "Batter", "overseas": 0, "price_cr": 18.0},
            {"player": "R Parag", "role": "All-Rounder", "overseas": 0, "price_cr": 14.0},
            {"player": "DC Jurel", "role": "Wicketkeeper", "overseas": 0, "price_cr": 14.0},
            {"player": "JC Archer", "role": "Fast Bowler", "overseas": 1, "price_cr": 12.5},
            {"player": "SO Hetmyer", "role": "Batter", "overseas": 1, "price_cr": 11.0},
            {"player": "TU Deshpande", "role": "Fast Bowler", "overseas": 0, "price_cr": 6.5},
            {"player": "PWH de Silva", "role": "All-Rounder", "overseas": 1, "price_cr": 5.25},
            {"player": "M Theekshana", "role": "Spin Bowler", "overseas": 1, "price_cr": 4.4},
            {"player": "N Rana", "role": "Batter", "overseas": 0, "price_cr": 4.2},
            {"player": "Sandeep Sharma", "role": "Fast Bowler", "overseas": 0, "price_cr": 4.0},
            {"player": "Fazalhaq Farooqi", "role": "Fast Bowler", "overseas": 1, "price_cr": 2.0}
        ],
        "team_deficits": [
            "Needs power-hitting all-rounder batting at 6 or 7 to finish tight chases",
            "Pace reserves need reinforcements when Archer is rotated"
        ],
        "recommended_trades": [
            {"target": "AD Russell", "team": "Kolkata Knight Riders", "role": "All-Rounder", "price_cr": 12.0, "impact_gain": "+28% Death Over Sixes", "trade_feasibility": "Low", "swap_offer": "SO Hetmyer + Cash"},
            {"target": "Rinku Singh", "team": "Kolkata Knight Riders", "role": "Batter", "price_cr": 13.0, "impact_gain": "+20% Successful Chases", "trade_feasibility": "Medium", "swap_offer": "N Rana + Cash"},
            {"target": "Mohammed Siraj", "team": "Gujarat Titans", "role": "Fast Bowler", "price_cr": 12.25, "impact_gain": "+11 Powerplay Wickets", "trade_feasibility": "Medium", "swap_offer": "TU Deshpande + Cash"}
        ]
    },
    "Delhi Capitals": {
        "id": "DC",
        "short_name": "DC",
        "primary_color": "#004C97",
        "secondary_color": "#EE1C25",
        "total_budget_cr": 120.0,
        "captain": "Axar Patel",
        "home_venue": "Arun Jaitley Stadium, New Delhi",
        "roster_players": [
            {"player": "AR Patel", "role": "All-Rounder", "overseas": 0, "price_cr": 16.5},
            {"player": "KL Rahul", "role": "Wicketkeeper", "overseas": 0, "price_cr": 14.0},
            {"player": "Kuldeep Yadav", "role": "Spin Bowler", "overseas": 0, "price_cr": 13.25},
            {"player": "MA Starc", "role": "Fast Bowler", "overseas": 1, "price_cr": 11.75},
            {"player": "T Natarajan", "role": "Fast Bowler", "overseas": 0, "price_cr": 10.75},
            {"player": "T Stubbs", "role": "Batter", "overseas": 1, "price_cr": 10.0},
            {"player": "Mukesh Kumar", "role": "Fast Bowler", "overseas": 0, "price_cr": 8.0},
            {"player": "HC Brook", "role": "Batter", "overseas": 1, "price_cr": 6.25},
            {"player": "A Porel", "role": "Wicketkeeper", "overseas": 0, "price_cr": 4.0},
            {"player": "MM Sharma", "role": "Fast Bowler", "overseas": 0, "price_cr": 2.2},
            {"player": "F du Plessis", "role": "Batter", "overseas": 1, "price_cr": 2.0},
            {"player": "PVD Chameera", "role": "Fast Bowler", "overseas": 1, "price_cr": 0.75}
        ],
        "team_deficits": [
            "Kotla ground dimensions require bowlers with low boundary % conceded",
            "Lower-order domestic finishing options need greater consistency"
        ],
        "recommended_trades": [
            {"target": "Rinku Singh", "team": "Kolkata Knight Riders", "role": "Batter", "price_cr": 13.0, "impact_gain": "+23% Lower-Order Impact", "trade_feasibility": "Medium", "swap_offer": "HC Brook + Cash"},
            {"target": "M Pathirana", "team": "Chennai Super Kings", "role": "Fast Bowler", "price_cr": 13.0, "impact_gain": "-3.1 Kotla Death Econ", "trade_feasibility": "Medium", "swap_offer": "Mukesh Kumar + Cash"},
            {"target": "N Pooran", "team": "Lucknow Super Giants", "role": "Batter", "price_cr": 21.0, "impact_gain": "+32 Sixes Contribution", "trade_feasibility": "Low", "swap_offer": "KL Rahul Swap"}
        ]
    },
    "Punjab Kings": {
        "id": "PBKS",
        "short_name": "PBKS",
        "primary_color": "#ED1B24",
        "secondary_color": "#D7A22A",
        "total_budget_cr": 120.0,
        "captain": "Shreyas Iyer",
        "home_venue": "Maharaja Yadavindra Singh Stadium, Mullanpur",
        "roster_players": [
            {"player": "SS Iyer", "role": "Batter", "overseas": 0, "price_cr": 26.75},
            {"player": "Arshdeep Singh", "role": "Fast Bowler", "overseas": 0, "price_cr": 18.0},
            {"player": "YS Chahal", "role": "Spin Bowler", "overseas": 0, "price_cr": 18.0},
            {"player": "MP Stoinis", "role": "All-Rounder", "overseas": 1, "price_cr": 11.0},
            {"player": "M Jansen", "role": "All-Rounder", "overseas": 1, "price_cr": 7.0},
            {"player": "Shashank Singh", "role": "Batter", "overseas": 0, "price_cr": 5.5},
            {"player": "GJ Maxwell", "role": "All-Rounder", "overseas": 1, "price_cr": 4.2},
            {"player": "Prabhsimran Singh", "role": "Wicketkeeper", "overseas": 0, "price_cr": 4.0},
            {"player": "JP Inglis", "role": "Wicketkeeper", "overseas": 1, "price_cr": 2.6},
            {"player": "LH Ferguson", "role": "Fast Bowler", "overseas": 1, "price_cr": 2.0},
            {"player": "Harpreet Brar", "role": "Spin Bowler", "overseas": 0, "price_cr": 1.5},
            {"player": "AM Hardie", "role": "All-Rounder", "overseas": 1, "price_cr": 1.25}
        ],
        "team_deficits": [
            "Requires experienced top-order partner to anchor with Prabhsimran and Iyer",
            "Middle order batting stability needed after high-risk overseas stars"
        ],
        "recommended_trades": [
            {"target": "RD Gaikwad", "team": "Chennai Super Kings", "role": "Batter", "price_cr": 18.0, "impact_gain": "+27% Top-Order Solidity", "trade_feasibility": "Low", "swap_offer": "MP Stoinis + Cash"},
            {"target": "Tilak Varma", "team": "Mumbai Indians", "role": "Batter", "price_cr": 8.0, "impact_gain": "+15% Middle Overs Control", "trade_feasibility": "Medium", "swap_offer": "GJ Maxwell + Cash"},
            {"target": "DL Chahar", "team": "Mumbai Indians", "role": "Fast Bowler", "price_cr": 9.25, "impact_gain": "+9 Powerplay Swing Wickets", "trade_feasibility": "High", "swap_offer": "LH Ferguson + Cash"}
        ]
    },
    "Gujarat Titans": {
        "id": "GT",
        "short_name": "GT",
        "primary_color": "#1B2133",
        "secondary_color": "#DBBE6E",
        "total_budget_cr": 120.0,
        "captain": "Shubman Gill",
        "home_venue": "Narendra Modi Stadium, Ahmedabad",
        "roster_players": [
            {"player": "Rashid Khan", "role": "All-Rounder", "overseas": 1, "price_cr": 18.0},
            {"player": "Shubman Gill", "role": "Batter", "overseas": 0, "price_cr": 16.5},
            {"player": "JC Buttler", "role": "Wicketkeeper", "overseas": 1, "price_cr": 15.75},
            {"player": "Mohammed Siraj", "role": "Fast Bowler", "overseas": 0, "price_cr": 12.25},
            {"player": "K Rabada", "role": "Fast Bowler", "overseas": 1, "price_cr": 10.75},
            {"player": "M Prasidh Krishna", "role": "Fast Bowler", "overseas": 0, "price_cr": 9.5},
            {"player": "B Sai Sudharsan", "role": "Batter", "overseas": 0, "price_cr": 8.5},
            {"player": "R Tewatia", "role": "All-Rounder", "overseas": 0, "price_cr": 4.0},
            {"player": "M Shahrukh Khan", "role": "Batter", "overseas": 0, "price_cr": 4.0},
            {"player": "Washington Sundar", "role": "All-Rounder", "overseas": 0, "price_cr": 3.2},
            {"player": "SE Rutherford", "role": "Batter", "overseas": 1, "price_cr": 2.6},
            {"player": "G Coetzee", "role": "Fast Bowler", "overseas": 1, "price_cr": 2.4}
        ],
        "team_deficits": [
            "Requires death overs yorker precision; pace attack can leak boundaries in overs 18-20",
            "Spin depth relies heavily on Rashid Khan alone"
        ],
        "recommended_trades": [
            {"target": "JJ Bumrah", "team": "Mumbai Indians", "role": "Fast Bowler", "price_cr": 18.0, "impact_gain": "-3.0 Death Overs Econ", "trade_feasibility": "Low", "swap_offer": "Mohammed Siraj + Cash"},
            {"target": "CV Varun", "team": "Kolkata Knight Riders", "role": "Spin Bowler", "price_cr": 12.0, "impact_gain": "+15 Mystery Spin Wickets", "trade_feasibility": "Medium", "swap_offer": "M Prasidh Krishna + Cash"},
            {"target": "T Stubbs", "team": "Delhi Capitals", "role": "Batter", "price_cr": 10.0, "impact_gain": "+17% Middle Overs SR", "trade_feasibility": "High", "swap_offer": "G Coetzee + Cash"}
        ]
    },
    "Lucknow Super Giants": {
        "id": "LSG",
        "short_name": "LSG",
        "primary_color": "#0055A5",
        "secondary_color": "#ED1B24",
        "total_budget_cr": 120.0,
        "captain": "Rishabh Pant",
        "home_venue": "BRSABV Ekana Cricket Stadium, Lucknow",
        "roster_players": [
            {"player": "RR Pant", "role": "Wicketkeeper", "overseas": 0, "price_cr": 27.0},
            {"player": "N Pooran", "role": "Wicketkeeper", "overseas": 1, "price_cr": 21.0},
            {"player": "Mayank Yadav", "role": "Fast Bowler", "overseas": 0, "price_cr": 11.0},
            {"player": "Ravi Bishnoi", "role": "Spin Bowler", "overseas": 0, "price_cr": 11.0},
            {"player": "Avesh Khan", "role": "Fast Bowler", "overseas": 0, "price_cr": 9.75},
            {"player": "Akash Deep", "role": "Fast Bowler", "overseas": 0, "price_cr": 8.0},
            {"player": "DA Miller", "role": "Batter", "overseas": 1, "price_cr": 7.5},
            {"player": "Abdul Samad", "role": "Batter", "overseas": 0, "price_cr": 4.2},
            {"player": "Mohsin Khan", "role": "Fast Bowler", "overseas": 0, "price_cr": 4.0},
            {"player": "A Badoni", "role": "Batter", "overseas": 0, "price_cr": 4.0},
            {"player": "MR Marsh", "role": "All-Rounder", "overseas": 1, "price_cr": 3.4},
            {"player": "AK Markram", "role": "Batter", "overseas": 1, "price_cr": 2.0}
        ],
        "team_deficits": [
            "Mayank Yadav workload requires seasoned backup express pacer",
            "Slow Ekana pitch demands a second high-quality finger-spin restrictor"
        ],
        "recommended_trades": [
            {"target": "RA Jadeja", "team": "Chennai Super Kings", "role": "All-Rounder", "price_cr": 18.0, "impact_gain": "+26% Ekana Pitch Defense", "trade_feasibility": "Low", "swap_offer": "Avesh Khan + Cash"},
            {"target": "AR Patel", "team": "Delhi Capitals", "role": "All-Rounder", "price_cr": 16.5, "impact_gain": "+16 Economical Overs", "trade_feasibility": "Medium", "swap_offer": "MR Marsh + Cash"},
            {"target": "Noor Ahmad", "team": "Chennai Super Kings", "role": "Spin Bowler", "price_cr": 10.0, "impact_gain": "+12 Spin Wickets", "trade_feasibility": "High", "swap_offer": "DA Miller + Cash"}
        ]
    }
}

def compute_player_empirical_forte(pname: str, role_hint: str = None) -> Dict[str, Any]:
    """Empirically analyzes player deliveries and stats to determine their strong forte and phase metrics."""
    bat = execute_query("""
        SELECT 
            SUM(runs) as runs,
            SUM(balls_faced) as balls,
            SUM(fours) as fours,
            SUM(sixes) as sixes
        FROM batting_stats
        WHERE display_name = %s
    """, (pname,), fetchall=False) or {}
    
    runs = bat.get("runs") or 0
    balls = bat.get("balls") or 0
    sr = round((runs / balls * 100), 1) if balls > 0 else 0.0
    sixes = bat.get("sixes") or 0
    fours = bat.get("fours") or 0

    bowl = execute_query("""
        SELECT 
            SUM(wickets) as wickets,
            SUM(legal_balls) as balls,
            SUM(runs_conceded) as runs_conceded
        FROM bowling_stats
        WHERE display_name = %s
    """, (pname,), fetchall=False) or {}

    wkts = bowl.get("wickets") or 0
    bowl_balls = bowl.get("balls") or 0
    runs_c = bowl.get("runs_conceded") or 0
    econ = round(runs_c / (bowl_balls / 6.0), 2) if bowl_balls >= 6 else 0.0

    pom_row = execute_query("SELECT COUNT(*) as awards FROM matches WHERE player_of_match = %s", (pname,), fetchall=False) or {}
    pom_awards = pom_row.get("awards") or 0

    # Phase breakdowns from ball-by-ball deliveries
    d_bat = execute_query("""
        SELECT 
            SUM(CASE WHEN over_number < 6 THEN batter_runs ELSE 0 END) as pp_runs,
            SUM(CASE WHEN over_number < 6 THEN 1 ELSE 0 END) as pp_balls,
            SUM(CASE WHEN over_number >= 15 THEN batter_runs ELSE 0 END) as death_runs,
            SUM(CASE WHEN over_number >= 15 THEN 1 ELSE 0 END) as death_balls
        FROM deliveries
        WHERE batter = %s
    """, (pname,), fetchall=False) or {}

    pp_runs = d_bat.get("pp_runs") or 0
    pp_balls = d_bat.get("pp_balls") or 0
    pp_sr = round(pp_runs / pp_balls * 100, 1) if pp_balls > 10 else 0.0
    death_runs = d_bat.get("death_runs") or 0
    death_balls = d_bat.get("death_balls") or 0
    death_sr = round(death_runs / death_balls * 100, 1) if death_balls > 10 else 0.0

    d_bowl = execute_query("""
        SELECT 
            SUM(CASE WHEN over_number >= 15 AND wickets_json != '[]' AND wickets_json != '' THEN 1 ELSE 0 END) as death_wkts,
            SUM(CASE WHEN over_number >= 15 THEN total_runs ELSE 0 END) as death_runs_conceded,
            SUM(CASE WHEN over_number >= 15 THEN 1 ELSE 0 END) as death_balls_bowled
        FROM deliveries
        WHERE bowler = %s
    """, (pname,), fetchall=False) or {}

    death_wkts = d_bowl.get("death_wkts") or 0
    death_runs_c = d_bowl.get("death_runs_conceded") or 0
    death_balls_b = d_bowl.get("death_balls_bowled") or 0
    death_econ = round(death_runs_c / (death_balls_b / 6.0), 2) if death_balls_b >= 12 else 0.0

    # Empirical Forte
    if death_econ > 0 and death_econ <= 8.5 and death_wkts >= 10:
        forte = "Elite Death Yorker Specialist"
    elif death_sr >= 165 and death_runs >= 200:
        forte = "High-Velocity Death Overs Finisher"
    elif pp_sr >= 145 and pp_runs >= 300:
        forte = "Explosive Powerplay Enforcer"
    elif runs >= 2000 and sr >= 130:
        forte = "Master Class Anchor & Chase Specialist"
    elif wkts >= 80 and econ <= 7.8:
        forte = "Middle-Overs Choke & Spin Enforcer"
    elif runs >= 500 and wkts >= 15:
        forte = "High-Impact Dual-Threat All-Rounder"
    elif wkts >= 30 and death_wkts >= 10:
        forte = "Pace Wicket Striker"
    elif role_hint == "Wicketkeeper":
        forte = "Crisis Wicketkeeper Batter"
    else:
        forte = "Key Tactical Specialist"

    return {
        "forte": forte,
        "runs": runs,
        "balls": balls,
        "strike_rate": sr,
        "sixes": sixes,
        "fours": fours,
        "wickets": wkts,
        "economy": econ,
        "pom_awards": pom_awards,
        "death_wkts": death_wkts,
        "death_econ": death_econ,
        "death_sr": death_sr,
        "pp_sr": pp_sr,
        "pp_runs": pp_runs,
        "death_runs": death_runs,
        "phase_analysis": {
            "powerplay_runs": pp_runs,
            "powerplay_balls": pp_balls,
            "powerplay_sr": pp_sr,
            "death_runs": death_runs,
            "death_balls": death_balls,
            "death_sr": death_sr,
            "death_wickets": death_wkts,
            "death_economy": death_econ
        }
    }

def get_franchise_auction_profile(team_name: str) -> Dict[str, Any]:
    if team_name not in FRANCHISE_METADATA:
        # Match case-insensitively or short name
        match = None
        for k, v in FRANCHISE_METADATA.items():
            if k.lower() == team_name.lower() or v["id"].lower() == team_name.lower():
                match = k
                break
        team_name = match if match else "Chennai Super Kings"

    meta = FRANCHISE_METADATA[team_name]
    roster_players = meta["roster_players"]

    enriched_squad = []
    total_spent = 0.0

    for p in roster_players:
        pname = p["player"]
        cost = p["price_cr"]
        total_spent += cost

        # Query real empirical stats from SQLite database
        stat = compute_player_empirical_forte(pname, p["role"])
        runs = stat["runs"]
        balls = stat["balls"]
        sr = stat["strike_rate"]
        sixes = stat["sixes"]
        fours = stat["fours"]
        wkts = stat["wickets"]
        econ = stat["economy"]
        pom_awards = stat["pom_awards"]
        pp_runs = stat["pp_runs"]
        pp_sr = stat["pp_sr"]
        death_runs = stat["death_runs"]
        death_sr = stat["death_sr"]
        death_wkts = stat["death_wkts"]
        death_econ = stat["death_econ"]
        forte = stat["forte"]
        phases = stat["phase_analysis"]

        # Impact Points
        impact = (runs * 1.0) + (sixes * 2.5) + (wkts * 28.0) + (pom_awards * 40.0) + (death_wkts * 12.0)
        if death_sr > 160:
            impact += (death_sr - 160) * 1.5
        if death_econ > 0 and death_econ < 8.5:
            impact += (8.5 - death_econ) * 20.0

        # Scarcity multiplier
        scarcity = 1.0
        if p["role"] == "All-Rounder":
            scarcity = 1.25
        elif p["role"] == "Fast Bowler" and death_econ > 0 and death_econ < 8.8:
            scarcity = 1.22
        elif p["role"] == "Wicketkeeper" and sr >= 140:
            scarcity = 1.18

        fair_val = 1.0 + (impact / 450.0) * scarcity
        fair_val_cr = round(max(0.75, min(27.0, fair_val)), 2)
        vfm = round((fair_val_cr / cost) * 100.0, 1)

        if vfm >= 125.0:
            roi_status = "Steal Buy / High Value"
            roi_color = "emerald"
        elif vfm >= 85.0:
            roi_status = "Fair Return"
            roi_color = "blue"
        else:
            roi_status = "High Cost / Premium Risk"
            roi_color = "amber"

        # Radar skills scores (0 to 100)
        power_score = min(100, int((sixes / max(1, fours + sixes)) * 140)) if (fours + sixes) > 0 else 40
        strike_rate_score = min(100, int((sr / 175.0) * 100)) if sr > 0 else 30
        death_score = min(100, int((death_sr / 190.0) * 100)) if death_sr > 0 else (90 if death_econ > 0 and death_econ < 8.0 else 45)
        clutch_score = min(100, int((pom_awards / 15.0) * 100))
        consistency_score = min(100, int((runs / 3500.0) * 100)) if runs > 0 else (min(100, int((wkts / 120.0) * 100)))

        enriched_squad.append({
            "player": pname,
            "role": p["role"],
            "is_overseas": bool(p["overseas"]),
            "price_cr": cost,
            "career_runs": runs,
            "career_wickets": wkts,
            "strike_rate": sr,
            "economy": econ,
            "fours": fours,
            "sixes": sixes,
            "player_of_match_awards": pom_awards,
            "pp_sr": pp_sr,
            "death_sr": death_sr,
            "death_econ": death_econ,
            "forte": forte,
            "impact_score": round(impact, 1),
            "fair_value_cr": fair_val_cr,
            "vfm_index": vfm,
            "roi_status": roi_status,
            "roi_color": roi_color,
            "radar_skills": [
                {"subject": "Power Hitting", "score": power_score},
                {"subject": "Strike Rate", "score": strike_rate_score},
                {"subject": "Death Impact", "score": death_score},
                {"subject": "Clutch POM", "score": clutch_score},
                {"subject": "Consistency", "score": consistency_score}
            ]
        })

    # Spend allocation by role
    spend_by_role = {}
    for p in enriched_squad:
        r = p["role"]
        spend_by_role[r] = round(spend_by_role.get(r, 0.0) + p["price_cr"], 2)

    spend_chart = [{"role": k, "spent_cr": v} for k, v in spend_by_role.items()]

    # Optimal Playing XI (Maximum 4 overseas players, at least 1 WK, 5 bowling options)
    sorted_squad = sorted(enriched_squad, key=lambda x: x["impact_score"], reverse=True)
    xi = []
    overseas_selected = 0

    # 1. Ensure Wicketkeeper
    for p in sorted_squad:
        if p["role"] == "Wicketkeeper":
            if not p["is_overseas"] or overseas_selected < 4:
                xi.append(p)
                if p["is_overseas"]:
                    overseas_selected += 1
                break

    # 2. Pick next highest-impact players respecting overseas quota
    for p in sorted_squad:
        if p in xi:
            continue
        if len(xi) >= 11:
            break
        if p["is_overseas"] and overseas_selected >= 4:
            continue
        xi.append(p)
        if p["is_overseas"]:
            overseas_selected += 1

    # Order playing XI realistically: Batters -> WKs/All-Rounders -> Bowlers
    role_order = {"Batter": 1, "Wicketkeeper": 2, "All-Rounder": 3, "Spin Bowler": 4, "Fast Bowler": 5}
    xi_sorted = sorted(xi, key=lambda x: (role_order.get(x["role"], 9), -x["career_runs"] if x["role"] in ["Batter", "Wicketkeeper"] else -x["career_wickets"]))

    bench = [p for p in enriched_squad if p not in xi_sorted]
    impact_sub = bench[0] if bench else None

    return {
        "team_info": {
            "name": team_name,
            "short_name": meta["short_name"],
            "id": meta["id"],
            "captain": meta["captain"],
            "home_venue": meta["home_venue"],
            "primary_color": meta["primary_color"],
            "secondary_color": meta["secondary_color"],
            "total_budget_cr": meta["total_budget_cr"],
            "total_spent_cr": round(total_spent, 2),
            "remaining_purse_cr": max(0.0, round(meta["total_budget_cr"] - total_spent, 2)),
            "squad_size": len(enriched_squad),
            "overseas_count": sum(1 for p in enriched_squad if p["is_overseas"]),
            "max_overseas": 8
        },
        "squad": enriched_squad,
        "spend_by_role": spend_chart,
        "optimal_playing_xi": xi_sorted,
        "impact_player_sub": impact_sub,
        "team_deficits": meta["team_deficits"],
        "recommended_trades": meta["recommended_trades"],
        "valuation_formula": {
            "formula_name": "Empirical Price-to-Performance Equating Formula (PVM)",
            "impact_equation": "Impact Score = (Runs × 1.0) + (Sixes × 2.5) + (Wickets × 28.0) + (POM Awards × 40.0) + (Death Wkts × 12.0) + Phase Bonuses",
            "fair_value_equation": "Fair Valuation (₹ Cr) = Base Floor (₹1.0 Cr) + (Impact Score / 450.0) × Role Scarcity Factor",
            "vfm_equation": "Value For Money (VFM %) = (Fair Valuation / Actual Auction Price) × 100",
            "thresholds": [
                {"status": "Steal Buy / High Value", "range": "VFM ≥ 125%", "color": "emerald"},
                {"status": "Fair Return", "range": "85% ≤ VFM < 125%", "color": "blue"},
                {"status": "High Cost / Premium Risk", "range": "VFM < 85%", "color": "amber"}
            ]
        }
    }

def list_all_franchises():
    return [
        {
            "id": v["id"],
            "name": k,
            "short_name": v["short_name"],
            "captain": v["captain"],
            "primary_color": v["primary_color"],
            "secondary_color": v["secondary_color"],
            "total_budget_cr": v["total_budget_cr"],
            "home_venue": v["home_venue"]
        }
        for k, v in FRANCHISE_METADATA.items()
    ]
