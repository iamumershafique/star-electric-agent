import re

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\68fd0f4e-f10f-4828-80d6-bb7bfb9e483b\.system_generated\steps\806\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

callbacks = re.findall(r'AF_initDataCallback\((.*?)\);</script>', text, re.DOTALL)
cb4 = callbacks[4]

for name in ['DC Scan 501-600', 'Jadeed Pending Bills.xlsx']:
    pos = cb4.find(name)
    if pos != -1:
        print(f'=== {name} ===')
        print(cb4[max(0, pos-200):min(len(cb4), pos+200)])
