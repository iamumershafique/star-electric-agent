import re

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\68fd0f4e-f10f-4828-80d6-bb7bfb9e483b\.system_generated\steps\806\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

callbacks = re.findall(r'AF_initDataCallback\((.*?)\);</script>', text, re.DOTALL)
cb4 = callbacks[4]

pos = cb4.find('Jadeed Pending Bills.xlsx')
print('=== 800 chars before Jadeed Pending Bills.xlsx ===')
print(cb4[max(0, pos-800):pos])
