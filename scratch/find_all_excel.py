import re

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\68fd0f4e-f10f-4828-80d6-bb7bfb9e483b\.system_generated\steps\806\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

callbacks = re.findall(r'AF_initDataCallback\((.*?)\);</script>', text, re.DOTALL)
cb4 = callbacks[4]

matches = [m.start() for m in re.finditer('Jadeed Pending Bills.xlsx', cb4)]
for m in matches:
    print('Match at:', m)
    print(cb4[max(0, m-200):min(len(cb4), m+100)])
