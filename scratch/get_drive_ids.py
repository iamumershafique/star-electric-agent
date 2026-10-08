import re
import json

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\abad5958-1aa2-4b7c-8247-1c6fee945e3a\.system_generated\steps\874\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?), sideChannel:", text, re.DOTALL)
if not callbacks:
    callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?)}\);", text, re.DOTALL)

for key, raw_data in callbacks:
    if key == 'ds:4':
        data = json.loads(raw_data.strip())
        def find_parent_with_id(node, target_names):
            if isinstance(node, list):
                # Check if this node contains any of the target names
                for name in target_names:
                    if name in node:
                        # Find all strings of length 25-45 in this node or subnodes
                        ids = []
                        def get_ids(sub):
                            if isinstance(sub, str) and re.match(r'^[1][a-zA-Z0-9_-]{25,40}$', sub):
                                ids.append(sub)
                            elif isinstance(sub, list):
                                for s in sub: get_ids(s)
                            elif isinstance(sub, dict):
                                for v in sub.values(): get_ids(v)
                        get_ids(node)
                        print(f"Target '{name}': IDs found: {ids}")
                for item in node:
                    find_parent_with_id(item, target_names)
        find_parent_with_id(data, ['DC Scan 001-100', 'DC Scan 101-200', 'DC Scan 201-300', 'DC Scan 301-400', 'DC Scan 401-500', 'DC Scan 501-600', 'DC Scan 601-700', 'Jadeed Pending Bills.xlsx'])
