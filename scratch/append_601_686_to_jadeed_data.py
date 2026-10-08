import json
import re

# Load generated 601-686 DCs
with open(r'scratch\dcs_601_686.json', 'r', encoding='utf-8') as f:
    dcs_601_686 = json.load(f)

# Read jadeedHistoryData.ts
with open(r'src\data\jadeedHistoryData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update JADEED_DRIVE_LINKS.dcScanFolders
old_folders = """    '401-500': 'https://drive.google.com/drive/folders/1CpAHo_PKsIOrXtJcynrZavkGKdJZEoal',
  }"""
new_folders = """    '401-500': 'https://drive.google.com/drive/folders/1CpAHo_PKsIOrXtJcynrZavkGKdJZEoal',
    '501-600': 'https://drive.google.com/drive/folders/1LZAguU5oBXo1dA2OoXLIMz36LZKOWAzp',
    '601-700': 'https://drive.google.com/drive/folders/1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW',
  }"""
if old_folders in content:
    content = content.replace(old_folders, new_folders)
    print("Updated dcScanFolders with 501-600 and 601-700 links!")

# 2. Update getDCScanFolderLink
old_func = """  if (num <= 400) return JADEED_DRIVE_LINKS.dcScanFolders['301-400'];
  return JADEED_DRIVE_LINKS.dcScanFolders['401-500'];"""
new_func = """  if (num <= 400) return JADEED_DRIVE_LINKS.dcScanFolders['301-400'];
  if (num <= 500) return JADEED_DRIVE_LINKS.dcScanFolders['401-500'];
  if (num <= 600) return JADEED_DRIVE_LINKS.dcScanFolders['501-600'];
  return JADEED_DRIVE_LINKS.dcScanFolders['601-700'];"""
if old_func in content:
    content = content.replace(old_func, new_func)
    print("Updated getDCScanFolderLink logic!")

# 3. Find the end of JADEED_HISTORY_DCS array: "];"
last_bracket_idx = content.rfind("];")
if last_bracket_idx == -1:
    print("Error: Could not find end of array '];'")
    exit(1)

# Format the 86 new DCs as TypeScript/JSON objects
formatted_items = []
for dc in dcs_601_686:
    formatted_items.append("  " + json.dumps(dc, indent=2).replace("\n", "\n  "))

append_str = ",\n" + ",\n".join(formatted_items) + "\n];\n"

new_content = content[:last_bracket_idx] + append_str

with open(r'src\data\jadeedHistoryData.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully appended {len(dcs_601_686)} DCs (up to DC 686) into src/data/jadeedHistoryData.ts!")
