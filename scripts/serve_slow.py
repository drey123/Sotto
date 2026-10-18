#!/usr/bin/env python3
"""serve_slow.py — static file server with a deliberately slow endpoint.

Serves the stress/ directory like `python3 -m http.server`, except paths
starting with `/slow.png` sleep a configurable delay before responding with
a 1x1 PNG. Pages that reference the slow resource stay in the loading state
across navigation commits (in-flight-work straining), which is the point.
"""
import os
import sys
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PNG_1x1 = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000d49444154789c626001000000ffff03000006000557bfabd40000000049"
    "454e44ae426082"
)


class SlowHandler(SimpleHTTPRequestHandler):
    delay_s = 3.0

    def do_GET(self):
        if self.path.startswith("/slow.png"):
            time.sleep(self.delay_s)
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Content-Length", str(len(PNG_1x1)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(PNG_1x1)
            return
        # slow favicon to avoid instant 404 noise
        if self.path == "/favicon.ico":
            self.send_response(404)
            self.end_headers()
            return
        return super().do_GET()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))
        sys.stderr.flush()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8791
    root = sys.argv[2] if len(sys.argv) > 2 else "."
    delay = float(os.environ.get("SLOW_DELAY_S", "3.0"))
    SlowHandler.delay_s = delay
    os.chdir(root)
    server = ThreadingHTTPServer(("0.0.0.0", port), SlowHandler)
    print(f"serving {root} on :{port} (slow.png delay {delay}s)", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
