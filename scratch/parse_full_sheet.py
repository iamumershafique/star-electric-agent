import zipfile
import xml.etree.ElementTree as ET
import json

def parse_xlsx(file_path):
    with zipfile.ZipFile(file_path, 'r') as z:
        # 1. Parse shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            # Each <si> has one or more <t>
            for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                texts = [t.text or '' for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
                shared_strings.append(''.join(texts))
        print(f"Total shared strings: {len(shared_strings)}")

        # 2. Parse sheet1.xml
        sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows_data = []
        
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        sheet_data = sheet_tree.find('ns:sheetData', ns)
        
        for row in sheet_data.findall('ns:row', ns):
            r_num = row.get('r')
            cells = {}
            for c in row.findall('ns:c', ns):
                ref = c.get('r') # e.g. A1, B2
                col_letter = ''.join([ch for ch in ref if ch.isalpha()])
                cell_type = c.get('t')
                val_el = c.find('ns:v', ns)
                val = val_el.text if val_el is not None else None
                
                if val is not None:
                    if cell_type == 's': # shared string
                        idx = int(val)
                        if idx < len(shared_strings):
                            cells[col_letter] = shared_strings[idx]
                        else:
                            cells[col_letter] = val
                    else:
                        cells[col_letter] = val
                else:
                    # check inline string <is><t>
                    is_el = c.find('ns:is', ns)
                    if is_el is not None:
                        t_el = is_el.find('ns:t', ns)
                        if t_el is not None:
                            cells[col_letter] = t_el.text or ''
            if cells:
                rows_data.append((r_num, cells))
                
        return rows_data

rows = parse_xlsx(r'scratch\Jadeed_Pending_Bills_Full.xlsx')
print(f"Total rows parsed: {len(rows)}")

# Print first 5 rows
print("=== First 5 rows ===")
for r_num, cols in rows[:5]:
    print(r_num, cols)

# Print rows around 500 to 620
print("\n=== Rows around 500 to 620 ===")
for r_num, cols in rows:
    try:
        n = int(cols.get('A', 0))
        if 490 <= n <= 610:
            print(f"Row {r_num} | No: {cols.get('A')} | Date: {cols.get('B')} | Site: {cols.get('C')} | DC: {cols.get('D')} | Builty: {cols.get('E')}")
    except (ValueError, TypeError):
        pass

# Save parsed rows to json
with open(r'scratch\parsed_sheet_full.json', 'w', encoding='utf-8') as f:
    json.dump(rows, f, indent=2)
print("Saved to scratch\parsed_sheet_full.json")
