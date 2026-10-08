import re
import json

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

cb_match = re.search(r"AF_initDataCallback\({key:\s*'ds:4'.*?data:(.*?)}\);</script>", text, re.DOTALL)
if cb_match:
    raw_data = cb_match.group(1).strip()
    try:
        data = json.loads(raw_data)
        print("Successfully parsed ds:4 as JSON!")
        # Let's inspect data keys/length
        print("Data type:", type(data))
        if isinstance(data, list):
            print("Length of list:", len(data))
            # recursive search for file id & filename pairs
            pairs = []
            def search_items(obj):
                if isinstance(obj, list):
                    # Check if this item is [file_id, [name, ...], ...]
                    if len(obj) >= 2 and isinstance(obj[0], str) and isinstance(obj[1], list):
                        if len(obj[0]) in [28, 33, 44] and len(obj[1]) > 0 and isinstance(obj[1][0], str) and ('.jpg' in obj[1][0].lower() or '.jpeg' in obj[1][0].lower()):
                            pairs.append((obj[1][0], obj[0]))
                    for x in obj:
                        search_items(x)
                elif isinstance(obj, dict):
                    for k, v in obj.items():
                        search_items(v)
            search_items(data)
            print(f"Total pairs found in ds:4: {len(pairs)}")
            for p in pairs[:10]:
                print("  ", p)
    except Exception as e:
        print("Error parsing JSON:", e)
        # regex search for ["filename.ext", ... "file_id"]
        matches = re.findall(r'\[\"(1[a-zA-Z0-9_-]{28,34})\"[,\s]+\[\"([^\"]+\.(?:jpeg|jpg|png|pdf))\"', raw_data, re.IGNORECASE)
        print(f"Regex matches in ds:4: {len(matches)}")
