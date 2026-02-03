import json
from pathlib import Path
from typing import Iterable, Tuple

import tinycss2


ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / "roam.css"


def _walk_rules(stylesheet_rules, at_context: str = "") -> Iterable[Tuple[str, object]]:
    """Yield (at_context, qualified_rule) in source order."""
    for r in stylesheet_rules:
        if r.type == "at-rule":
            prelude = tinycss2.serialize(r.prelude).strip() if r.prelude else ""
            key = f"{at_context}@{r.lower_at_keyword} {prelude}".strip()
            if r.content is None:
                continue
            nested = tinycss2.parse_rule_list(r.content, skip_whitespace=True, skip_comments=True)
            yield from _walk_rules(nested, at_context=key + " | ")
        elif r.type == "qualified-rule":
            yield at_context.strip(), r


def _selector_text(rule) -> str:
    return tinycss2.serialize(rule.prelude).strip()


def _decl_fingerprint(rule) -> list[tuple[str, str, bool]]:
    """Keep declaration order; tinycss2 already preserves it."""
    if rule.content is None:
        return []
    decls = tinycss2.parse_declaration_list(rule.content, skip_whitespace=True, skip_comments=True)
    out: list[tuple[str, str, bool]] = []
    for d in decls:
        if d.type != "declaration":
            continue
        out.append((d.lower_name, tinycss2.serialize(d.value).strip(), bool(d.important)))
    return out


def main():
    css_text = CSS_PATH.read_text(encoding="utf-8")
    stylesheet = tinycss2.parse_stylesheet(css_text, skip_whitespace=True, skip_comments=True)

    flat = []
    for at_ctx, rule in _walk_rules(stylesheet, at_context=""):
        sel = _selector_text(rule)
        if not sel:
            continue
        fp = _decl_fingerprint(rule)
        if not fp:
            continue
        flat.append(
            {
                "at_context": at_ctx,
                "selector": sel,
                "source_line": rule.source_line,
                "decl_fingerprint": fp,
            }
        )

    candidates = []
    for prev, cur in zip(flat, flat[1:]):
        if prev["at_context"] != cur["at_context"]:
            continue
        if prev["decl_fingerprint"] != cur["decl_fingerprint"]:
            continue
        candidates.append(
            {
                "at_context": cur["at_context"],
                "selectors": [prev["selector"], cur["selector"]],
                "lines": [prev["source_line"], cur["source_line"]],
            }
        )

    report = {
        "meta": {"css_path": str(CSS_PATH)},
        "adjacent_merge_candidates_count": len(candidates),
        "adjacent_merge_candidates": candidates,
    }
    out_path = ROOT / "tools" / "css_adjacent_merge_candidates.report.json"
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(json.dumps({"adjacent_merge_candidates_count": report["adjacent_merge_candidates_count"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

