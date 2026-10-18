#!/usr/bin/env python3
"""find_fre_button.py — find the primary forward button in an Android
uiautomator window dump and print "X Y" tap coordinates (or nothing).

Used by CI to dismiss browser first-run flows on emulators: parses
window_dump.xml, looks for clickable nodes whose text/content-desc matches
common first-run button labels, and picks the lowest one on screen (the
primary "Accept / Continue" position in most mobile first-run layouts).
"""
import re
import sys

LABEL_RE = re.compile(
    r"\b(accept|continue|next|got it|skip|no thanks|agree|okay|ok|start|browse)\b",
    re.IGNORECASE,
)
NODE_RE = re.compile(
    r'<node[^>]*?(?:text|content-desc)="([^"]*)"[^>]*?clickable="true"'
    r'[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"'
)


def main(path: str) -> int:
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            xml = f.read()
    except OSError as e:
        print(f"ui-dump-read-error: {e}", file=sys.stderr)
        return 2

    cands = []
    for m in NODE_RE.finditer(xml):
        label = (m.group(1) or "").strip()
        if LABEL_RE.search(label):
            x = (int(m.group(2)) + int(m.group(4))) // 2
            y = (int(m.group(3)) + int(m.group(5))) // 2
            cands.append((y, x, label))

    if not cands:
        return 1

    # Lowest on screen first: primary forward button sits near the bottom.
    cands.sort()
    y, x, label = cands[0]
    print(f"{x} {y}")
    print(f"button: {label!r}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: find_fre_button.py <window_dump.xml>", file=sys.stderr)
        sys.exit(64)
    sys.exit(main(sys.argv[1]))
