import subprocess
import time
import urllib.request
import json
import os
import shutil

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
USER_DATA = r"C:\Users\HP\.gemini\antigravity\scratch\star-electric-portal\scratch\chrome_temp"

if os.path.exists(USER_DATA):
    try:
        shutil.rmtree(USER_DATA)
    except:
        pass
os.makedirs(USER_DATA, exist_ok=True)

cmd = [
    CHROME,
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    f"--user-data-dir={USER_DATA}",
    "about:blank"
]

proc = subprocess.Popen(cmd)
time.sleep(2)

try:
    with urllib.request.urlopen("http://localhost:9222/json/version") as resp:
        print("Chrome CDP version:", resp.read().decode('utf-8'))
finally:
    proc.terminate()
    try:
        shutil.rmtree(USER_DATA)
    except:
        pass
