import re
from collections import Counter

with open('src/data/jadeedHistoryData.ts', encoding='utf-8') as f:
    text = f.read()

dcs = re.findall(r'"dcNumber":\s*"([^"]+)"', text)
print('Total DCs in jadeedHistoryData:', len(dcs))

counts = Counter(dcs)
dupes = {k: v for k, v in counts.items() if v > 1}
print('Duplicates in jadeedHistoryData:', dupes)

# Also check storage.ts DEFAULT_DCS
with open('src/lib/storage.ts', encoding='utf-8') as f:
    text_st = f.read()

st_dcs = re.findall(r"dcNumber:\s*'([^']+)'", text_st)
print('Total dcNumber in storage.ts:', len(st_dcs))
st_counts = Counter(st_dcs)
st_dupes = {k: v for k, v in st_counts.items() if v > 1}
print('Duplicates in storage.ts:', st_dupes)
