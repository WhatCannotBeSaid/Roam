import argparse
import sys
from pathlib import Path

import tinycss2


def compact_css(css_text: str) -> str:
    """
    Compact formatting without changing semantics:
    - removes comments (handled by parser skip_comments)
    - removes extra whitespace/newlines by serializing rules
    - preserves rule order and at-rule nesting
    """
    stylesheet = tinycss2.parse_stylesheet(css_text, skip_whitespace=True, skip_comments=True)
    out_parts: list[str] = []

    def serialize_rule_list(rules) -> str:
        parts: list[str] = []
        for r in rules:
            if r.type == "at-rule":
                prelude = tinycss2.serialize(r.prelude).strip() if r.prelude else ""
                if r.content is None:
                    # Keep semicolon form.
                    if prelude:
                        parts.append(f"@{r.lower_at_keyword} {prelude};")
                    else:
                        parts.append(f"@{r.lower_at_keyword};")
                    continue

                nested = tinycss2.parse_rule_list(
                    r.content, skip_whitespace=True, skip_comments=True
                )
                inner = serialize_rule_list(nested)
                if prelude:
                    parts.append(f"@{r.lower_at_keyword} {prelude}{{{inner}}}")
                else:
                    parts.append(f"@{r.lower_at_keyword}{{{inner}}}")

            elif r.type == "qualified-rule":
                sel = tinycss2.serialize(r.prelude).strip()
                if r.content is None:
                    continue
                decls = tinycss2.parse_declaration_list(
                    r.content, skip_whitespace=True, skip_comments=True
                )
                decl_texts: list[str] = []
                for d in decls:
                    if d.type != "declaration":
                        continue
                    name = d.lower_name
                    value = tinycss2.serialize(d.value).strip()
                    important = " !important" if d.important else ""
                    decl_texts.append(f"{name}:{value}{important}")
                parts.append(f"{sel}{{{';'.join(decl_texts)}}}")
        return "".join(parts)

    out = serialize_rule_list(stylesheet)

    # Add a trailing newline for nicer diffs / editors.
    return out + "\n"


def main():
    ap = argparse.ArgumentParser(description="Compact CSS formatting via AST.")
    ap.add_argument("input", help="Input CSS path")
    ap.add_argument("--stdout", action="store_true", help="Write compact CSS to stdout")
    ap.add_argument(
        "--output",
        help="Write compact CSS to this path as UTF-8 (recommended on Windows)",
    )
    args = ap.parse_args()

    in_path = Path(args.input)
    css_text = in_path.read_text(encoding="utf-8")
    compacted = compact_css(css_text)

    # Report line counts to stderr (so stdout can be redirected cleanly).
    in_lines = css_text.count("\n") + 1
    out_lines = compacted.count("\n") + 1
    print(
        f"[compact_css] {in_path.name}: {in_lines} -> {out_lines} lines",
        file=sys.stderr,
    )

    if args.stdout:
        sys.stdout.write(compacted)
        return

    if args.output:
        out_path = Path(args.output)
        out_path.write_text(compacted, encoding="utf-8", newline="\n")
        return

    # Default: just report.
    return


if __name__ == "__main__":
    main()

