#!/bin/sh
# serves the repo on port 8765 for the tests; run from anywhere
cd "$(dirname "$0")/../.." && python3 -m http.server 8765
