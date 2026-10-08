import zipfile
import xml.etree.ElementTree as ET
import os

print(f"File size of Jadeed_Pending_Bills_Latest.xlsx: {os.path.getsize(r'scratch\Jadeed_Pending_Bills_Latest.xlsx')} bytes")

try:
    with zipfile.ZipFile(r'scratch\Jadeed_Pending_Bills_Latest.xlsx', 'r') as z:
        print("Zip contents:", z.namelist()[:10])
        # Parse shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                texts = [t.text or '' for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
                shared_strings.append(''.join(texts))
        print(f"Total shared strings: {len(shared_strings)}")
        
        sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        sheet_data = sheet_tree.find('ns:sheetData', ns)
        rows_data = []
        for row in sheet_data.findall('ns:row', ns):
            r_num = row.get('r')
            cells = {}
            for c in row.findall('ns:c', ns):
                ref = c.get('r')
                col_letter = ''.join([ch for ch in ref if ch.isalpha()])
                cell_type = c.get('t')
                val_el = c.find('ns:v', ns)
                val = val_el.text if val_el is not None else None
                if val is not None:
                    if cell_type == 's':
                        idx = int(val)
                        cells[col_letter] = shared_strings[idx] if idx < len(shared_strings) else val
                    else:
                        cells[col_letter] = val
                else:
                    is_el = c.find('ns:is', ns)
                    if is_el is not None:
                        t_el = is_el.find('ns:t', ns)
                        if t_el is not None:
                            cells[col_letter] = t_el.text or ''
            if cells:
                rows_data.append((r_num, cells))
        print(f"Total rows in latest Excel: {len(rows_data)}")
        print("Last 15 rows in latest Excel:")
        for r_num, cols in rows_data[-15:]:
            print(f"  Row {r_num}: {cols}")
except Exception as e:
    print("Error parsing Excel:", e)
    with open(r'scratch\Jadeed_Pending_Bills_Latest.xlsx', 'r', errors='ignore') as f:
        print("First 300 chars of file:", f.read()[:300])
