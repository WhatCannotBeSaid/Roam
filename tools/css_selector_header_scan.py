from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / "roam.css"


def main():
    lines = CSS_PATH.read_text(encoding="utf-8").splitlines()

    blocks = []
    start = None
    sel_lines: list[str] = []

    def is_comment_or_blank(s: str) -> bool:
        ss = s.strip()
        return (not ss) or ss.startswith("/*") or ss.startswith("*") or ss.startswith("*/")

    for i, line in enumerate(lines, start=1):
        if start is None:
            if is_comment_or_blank(line):
                continue
            start = i
            sel_lines = [line]
        else:
            sel_lines.append(line)

        if "{" in line:
            selector_header_lines = len(sel_lines)
            preview = "".join(sel_lines).strip().replace("\t", " ")[:240]
            blocks.append((selector_header_lines, start, i, preview))
            start = None
            sel_lines = []

    blocks.sort(reverse=True)

    print(f"Scanned {CSS_PATH}")
    print("Top multi-line selector headers (physical lines >= 8):")
    shown = 0
    for n, start, end, preview in blocks:
        if n < 8:
            break
        shown += 1
        print(f"{shown:>2}. {n:>2} lines @ L{start}-L{end} :: {preview}")
        if shown >= 25:
            break


if __name__ == "__main__":
    main()

