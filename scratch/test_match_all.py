import re

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Match aria-label and ssk with regex
pattern = re.compile(r'aria-label="([^"]+)"[^>]*ssk=[\'"]5:auSv138:([a-zA-Z0-9_-]+)-0-16[\'"]')
matches = pattern.findall(text)
print("Total regex matches with auSv138:", len(matches))

# Also check without auSv138 or other patterns
pattern2 = re.compile(r'aria-label="([^"]+\.(?:jpeg|jpg|png|pdf))[^"]*"[^>]*ssk=[\'"][^:\'"]*:[^:\'"]*:([a-zA-Z0-9_-]+)')
matches2 = pattern2.findall(text)
print("Total regex matches with general ssk:", len(matches2))

# Also check data-id or jslog or similar
pattern3 = re.compile(r'aria-label="([^"]+\.(?:jpeg|jpg|png|pdf))[^"]*".{1,300}?([a-zA-Z0-9_-]{28,34})')
matches3 = pattern3.findall(text)
print("Total pattern3 matches:", len(matches3))
