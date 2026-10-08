import re
import json

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's search for a known file, e.g. "DC 0006.jpeg" or any DC file name
# and inspect 200 chars around it
for match in re.finditer(r'(DC\s*\d+\.[a-zA-Z0-9]+)', text):
    fname = match.group(1)
    start = max(0, match.start() - 200)
    end = min(len(text), match.end() + 200)
    snippet = text[start:end]
    print(f"--- Found {fname} ---")
    print(repr(snippet[:300]))
    break

# Also let's search for a file beyond the first 50, e.g. DC 0070 or DC 0080
for match in re.finditer(r'(DC\s*(?:00[6-9]\d|0100)\.[a-zA-Z0-9]+)', text):
    fname = match.group(1)
    start = max(0, match.start() - 150)
    end = min(len(text), match.end() + 150)
    snippet = text[start:end]
    print(f"--- Found beyond 50: {fname} ---")
    print(repr(snippet))
    break
