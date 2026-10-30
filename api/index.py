import sys
from pathlib import Path

# Add project root directory to sys.path so modules can be imported
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.main import app
