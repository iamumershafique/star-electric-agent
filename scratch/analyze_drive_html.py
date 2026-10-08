import re
import json

paths = {
    'dc_001_100': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md',
    'dc_101_200': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1326\content.md',
    'dc_201_300': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1328\content.md',
    'dc_301_400': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1330\content.md',
    'dc_401_500': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1332\content.md',
    'builty': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1312\content.md',
}

for cat, p in paths.items():
    with open(p, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    # Check for all occurrences of filenames like "DC ... .jpeg" or ".jpg"
    files = re.findall(r'([A-Za-z0-9 _-]+\.(?:jpeg|jpg|png|pdf))', text, re.IGNORECASE)
    print(f"{cat}: found {len(set(files))} distinct file names in raw HTML")
