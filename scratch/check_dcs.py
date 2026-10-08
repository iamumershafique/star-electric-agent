import re

content = open('src/data/jadeedHistoryData.ts', encoding='utf-8').read()
dcs = re.findall(r'"dcNumber":\s*"([^"]+)"', content)
print('Total DCs in jadeedHistoryData.ts:', len(dcs))
print('First 5:', dcs[:5])
print('Last 5:', dcs[-5:])
