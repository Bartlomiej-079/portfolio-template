#!/usr/bin/env python3
"""Local static server that serves custom 404.html for missing paths."""

from __future__ import annotations

from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen
import argparse
import os
import socket


PROJECT_ROOT = Path(__file__).resolve().parent.parent
CUSTOM_404_FILE = PROJECT_ROOT / "404.html"

# Browser Huxley2 demo is down / CORS-blocked from localhost. Proxy Darwin so
# National Rail live positions still work in local development.
DARWIN_UPSTREAMS = (
    "https://hux.azurewebsites.net",
    "https://national-rail-api.davwheat.dev",
    "https://huxley2.azurewebsites.net",
)

# The flight board (Avionio) and the ADS-B feed (adsb.lol) answer without an
# Access-Control-Allow-Origin header, so in production the page bounces them off
# a public CORS relay. Locally we can just proxy them ourselves, which is faster
# and does not burn someone else's free tier while developing.
PROXY_ALLOWED_HOSTS = frozenset({
    "www.avionio.com",
    "avionio.com",
    "api.adsb.lol",
    "api.adsbdb.com",
})


class Custom404RequestHandler(SimpleHTTPRequestHandler):
    """Serve static files and fall back to project 404.html when not found."""

    def end_headers(self) -> None:
        # Keep local development responses fresh so 404/CSS/JS edits show immediately.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self) -> None:
        if self._darwin_path() is not None:
            self.proxy_darwin()
            return
        if self.path.split("?", 1)[0] == "/proxy":
            self.proxy_generic()
            return
        super().do_GET()

    def do_HEAD(self) -> None:
        if self._darwin_path() is not None:
            self.proxy_darwin()
            return
        if self.path.split("?", 1)[0] == "/proxy":
            self.proxy_generic()
            return
        super().do_HEAD()

    def proxy_generic(self) -> None:
        """GET /proxy?url=… for the handful of keyless flight feeds that lack CORS."""
        query = self.path.split("?", 1)[1] if "?" in self.path else ""
        target = parse_qs(query).get("url", [""])[0]
        parsed = urlparse(target)
        if parsed.scheme != "https" or parsed.hostname not in PROXY_ALLOWED_HOSTS:
            self.send_error(HTTPStatus.FORBIDDEN, "host not allowed")
            return

        req = Request(
            target,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; TrainTrack-local/1.0)",
                "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-GB,en;q=0.9",
            },
        )
        try:
            with urlopen(req, timeout=15) as resp:
                body = resp.read()
                ctype = resp.headers.get("Content-Type", "text/plain")
        except HTTPError as exc:
            body = exc.read() or b""
            ctype = "text/plain"
            self.send_response(exc.code)
        except (URLError, TimeoutError, OSError):
            self.send_error(HTTPStatus.BAD_GATEWAY, "upstream unreachable")
            return
        else:
            self.send_response(HTTPStatus.OK)

        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _darwin_path(self) -> str | None:
        path_only = self.path.split("?", 1)[0]
        if path_only != "/darwin" and not path_only.startswith("/darwin/"):
            return None
        rel = path_only[len("/darwin"):] or "/"
        query = self.path.split("?", 1)[1] if "?" in self.path else ""
        if ".." in rel or rel.startswith("//") or "://" in rel:
            return None
        if any(c in query for c in ("\n", "\r", " ")):
            return None
        return rel + (("?" + query) if query else "")

    def proxy_darwin(self) -> None:
        rel = self._darwin_path()
        if rel is None:
            self.send_error(HTTPStatus.BAD_REQUEST)
            return

        last_status = int(HTTPStatus.BAD_GATEWAY)
        last_body = b""
        last_type = "application/json"
        for base in DARWIN_UPSTREAMS:
            url = base + rel
            req = Request(
                url,
                headers={
                    "User-Agent": "TrainTrack-local/1.0",
                    "Accept": "application/json",
                },
            )
            try:
                with urlopen(req, timeout=8) as resp:
                    body = resp.read()
                    ctype = resp.headers.get("Content-Type", "application/json")
                    self.send_response(resp.status)
                    self.send_header("Content-Type", ctype)
                    self.send_header("Content-Length", str(len(body)))
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    if self.command != "HEAD":
                        self.wfile.write(body)
                    return
            except HTTPError as exc:
                last_status = int(exc.code)
                last_body = exc.read() or b""
                last_type = exc.headers.get("Content-Type", "application/json") if exc.headers else last_type
                if exc.code < 500:
                    self.send_response(exc.code)
                    self.send_header("Content-Type", last_type)
                    self.send_header("Content-Length", str(len(last_body)))
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    if self.command != "HEAD":
                        self.wfile.write(last_body)
                    return
            except (URLError, TimeoutError, OSError):
                continue

        self.send_response(last_status)
        self.send_header("Content-Type", last_type)
        self.send_header("Content-Length", str(len(last_body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if self.command != "HEAD" and last_body:
            self.wfile.write(last_body)

    def send_error(self, code: int, message: str | None = None, explain: str | None = None) -> None:
        if code != HTTPStatus.NOT_FOUND or not CUSTOM_404_FILE.exists():
            super().send_error(code, message, explain)
            return

        try:
            html_bytes = CUSTOM_404_FILE.read_bytes()
        except OSError:
            super().send_error(code, message, explain)
            return

        self.send_response(HTTPStatus.NOT_FOUND)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(html_bytes)))
        self.end_headers()

        if self.command != "HEAD":
            self.wfile.write(html_bytes)


class DualStackServer(ThreadingHTTPServer):
    """Listen on IPv6 and IPv4 so `localhost` works whichever the browser picks."""

    address_family = socket.AF_INET6
    request_queue_size = 128
    daemon_threads = True
    allow_reuse_address = True

    def server_bind(self) -> None:
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run local static server with custom 404 page")
    parser.add_argument("port", nargs="?", type=int, default=5500, help="Port to bind (default: 5500)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    os.chdir(PROJECT_ROOT)

    server = DualStackServer(("::", args.port), Custom404RequestHandler)
    print(f"Serving {PROJECT_ROOT} at http://localhost:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
