import subprocess
import time
import re
import sys
import urllib.request

SUBDOMAIN = "star-electric-portal"
PORT = 5173

def start_tunnel():
    print(f"[*] Starting localtunnel on port {PORT} with subdomain {SUBDOMAIN}...")
    cmd = ["cmd.exe", "/c", f"npx localtunnel --port {PORT} --subdomain {SUBDOMAIN}"]
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    url = None
    start_time = time.time()
    
    while time.time() - start_time < 30:
        line = proc.stdout.readline()
        if not line:
            if proc.poll() is not None:
                break
            continue
        print(f"[LT Output] {line.strip()}", flush=True)
        match = re.search(r"https://[a-zA-Z0-9.-]+\.loca\.lt", line)
        if match:
            url = match.group(0)
            break
            
    return proc, url

def main():
    while True:
        proc = None
        try:
            proc, url = start_tunnel()
            if not url:
                print("[-] Failed to capture URL from localtunnel, retrying in 3s...", flush=True)
                if proc:
                    proc.kill()
                time.sleep(3)
                continue
                
            print(f"[+] Tunnel online: {url}", flush=True)
            with open("scratch/tunnel_url.txt", "w", encoding="utf-8") as f:
                f.write(url)
                
            # Keep-alive loop: ping every 25 seconds
            while proc.poll() is None:
                try:
                    req = urllib.request.Request(
                        url,
                        headers={"User-Agent": "StarElectricTunnelHeartbeat/1.0", "Bypass-Tunnel-Reminder": "true"}
                    )
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        status = resp.status
                        print(f"[*] Heartbeat ping to {url}: Status {status}", flush=True)
                except Exception as ping_err:
                    print(f"[!] Heartbeat ping warning: {ping_err}", flush=True)
                
                time.sleep(25)
                
            print("[!] Tunnel process exited. Restarting in 2s...", flush=True)
        except Exception as e:
            print(f"[!] Exception in tunnel supervisor: {e}", flush=True)
            if proc:
                try:
                    proc.kill()
                except:
                    pass
            time.sleep(2)

if __name__ == "__main__":
    main()
