import os

files = sorted(os.listdir(r'C:\Users\HP\Videos\JADEED PR'))
print(f"Total files: {len(files)}")
for f in files[:10]:
    path = os.path.join(r'C:\Users\HP\Videos\JADEED PR', f)
    size = os.path.getsize(path)
    print(f"{f}: {size} bytes ({size/1024:.1f} KB)")
