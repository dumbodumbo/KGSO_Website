#!/bin/bash
# Double-click to run the KGSO site locally. Close this window to stop it.
cd "$(dirname "$0")"
PORT=8000
while lsof -i :$PORT >/dev/null 2>&1; do PORT=$((PORT+1)); done
if command -v python3 >/dev/null 2>&1; then
  echo ""
  echo "  KGSO site running at http://localhost:$PORT"
  echo "  Close this window (or press Ctrl+C) to stop it."
  echo ""
  (sleep 1; open "http://localhost:$PORT") &
  python3 -m http.server $PORT
else
  echo "Python 3 was not found, so opening the page directly instead."
  open index.html
fi
