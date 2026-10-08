import re

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\abad5958-1aa2-4b7c-8247-1c6fee945e3a\.system_generated\steps\874\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

targets = [
    'DC Scan 001-100',
    'DC Scan 101-200',
    'DC Scan 201-300',
    'DC Scan 301-400',
    'DC Scan 401-500',
    'DC Scan 501-600',
    'DC Scan 601-700',
    'Jadeed Pending Bills.xlsx',
    'Builty'
]

for name in targets:
    matches = [m.start() for m in re.finditer(re.escape(name), text)]
    print(f"\n=== {name} (found {len(matches)} occurrences) ===")
    for m in matches[:3]:
        snippet = text[max(0, m - 300):min(len(text), m + 300)]
        ids = re.findall(r'\"(1[a-zA-Z0-9_-]{25,40})\"', snippet)
        print(f"  At offset {m}: IDs = {ids}")
        # Also print snippet
        clean_snippet = re.sub(r'\s+', ' ', snippet)
        print(f"  Snippet: {clean_snippet[:200]}")
