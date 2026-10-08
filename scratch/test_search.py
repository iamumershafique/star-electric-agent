import urllib.request
import re

# Test search query on drive
url = "https://drive.google.com/drive/folders/1Mn--qMdo7WmK6I57c9KS9EZTDRIX_iS_"

# Check if there is an embedded JSON or JavaScript in the HTML that contains more data
with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Let's search for "DC 0070" or "0080" anywhere in html
print("DC 0070 in html:", "0070" in html)
print("DC 0080 in html:", "0080" in html)
print("DC 0090 in html:", "0090" in html)
print("DC 0100 in html:", "0100" in html)

# Let's find all occurrences of "DC " in html
all_dc_mentions = re.findall(r'DC\s*(\d+)', html)
print("Unique DC numbers in 1322 HTML:", sorted(list(set(int(x) for x in all_dc_mentions))))
