import re

content = open('src/data/jadeedHistoryData.ts', encoding='utf-8').read()
prs = re.findall(r'"prNumber":\s*"([^"]*)"', content)
print('Total prNumber entries:', len(prs))
non_empty = [p for p in prs if p.strip()]
print('Non-empty prNumbers count:', len(non_empty))
print('Sample non-empty prNumbers:', non_empty[:20])
print('Sample last 10 non-empty prNumbers:', non_empty[-10:])
