#!/usr/bin/env python3
"""find_fre_button.py — find the primary forward button in an Android
uiautomator window dump and print "X Y" tap coordinates (or nothing).

Used by CI to dismiss browser first-run flows on emulators: parses
window_dump.xml, looks for clickable nodes whose text/content-desc matches
common first-run button labels, and picks the best candidate.

Selection rules (learned from live first-run screens):
- Button-like labels are SHORT: a node whose text exceeds 48 chars is a
  paragraph (e.g. a terms-of-service footer that merely CONTAINS keywords
  like "agree"), not a button — excluded.
- Sign-out / decline variants rank as primary actions on sign-in screens
  ("Stay signed out", "Not now", "Skip for now", ...).
- Among matching short-label buttons, the bottom-most one wins (the primary
  CTA position in mobile first-run layouts).
"""
import re
import sys

LABEL_RE = re.compile(
    r"\b(accept|accept.{0,12}continue|continue|next|got it|skip|skip for now|"
    r"no thanks|not now|later|agree|okay|ok|start|browse|get started|"
    r"stay signed out|sign out|done|finish)\b",
    re.IGNORECASE,
)
NODE_RE = re.compile(
    r'<node[^>]*?(?:text|content-desc)="([^"]*)"[^>]*?clickable="true"'
    r'[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"'
)
MAX_LABEL_LEN = 48
# Prefer explicit sign-out / decline labels when present on the screen.
PREFERRED = re.compile(
    r"stay signed out|sign out|not now|no thanks|skip for now|later",
    re.IGNORECASE,
)


def candidates(xml: str):
    out = []
    for m in NODE_RE.finditer(xml):
        label = (m.group(1) or "").strip()
        if not label or len(label) > MAX_LABEL_LEN:
            continue
        if not LABEL_RE.search(label):
            continue
        x = (int(m.group(2)) + int(m.group(4))) // 2
        y = (int(m.group(3)) + int(m.group(5))) // 2
        preferred = bool(PREFERRED.search(label))
        out.append((preferred, y, x, label))
    return out


def main(path: str) -> int:
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            xml = f.read()
    except OSError as e:
        print(f"ui-dump-read-error: {e}", file=sys.stderr)
        return 2

    cands = candidates(xml)
    if not cands:
        return 1

    preferred = [c for c in cands if c[0]]
    pool = preferred if preferred else cands
    # bottom-most wins inside the pool
    pool.sort(key=lambda c: c[1])
    _, y, x, label = pool[-1]
    print(f"{x} {y}")
    print(f"button: {label!r} (preferred={bool(preferred)})", file=sys.stderr)
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: find_fre_button.py <window_dump.xml>", file=sys.stderr)
        sys.exit(64)
    sys.exit(main(sys.argv[1]))
