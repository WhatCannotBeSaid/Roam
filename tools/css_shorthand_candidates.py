import json
from pathlib import Path
from typing import Iterable, Tuple

import tinycss2


ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / "roam.css"


def _walk_rules(stylesheet_rules, at_context: str = "") -> Iterable[Tuple[str, object]]:
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


def _serialize_prelude(rule) -> str:
    return tinycss2.serialize(rule.prelude).strip()


def _serialize_declarations(rule) -> list[dict]:
    if rule.content is None:
        return []
    decls = tinycss2.parse_declaration_list(rule.content, skip_whitespace=True, skip_comments=True)
    out: list[dict] = []
    for d in decls:
        if d.type != "declaration":
            continue
        out.append(
            {
                "name": d.lower_name,
                "value": tinycss2.serialize(d.value).strip(),
                "important": bool(d.important),
                "source_line": getattr(d, "source_line", None),
            }
        )
    return out


def _four_side_candidates(decls: list[dict], base: str) -> list[dict]:
    # Returns candidates where base-top/right/bottom/left all exist with same importance.
    sides = ["top", "right", "bottom", "left"]
    last = {}
    for d in decls:
        last[d["name"]] = d
    keys = {f"{base}-{s}" for s in sides}
    if not keys.issubset(last.keys()):
        return []
    imps = {last[k]["important"] for k in keys}
    if len(imps) != 1:
        return []
    return [
        {
            "property": base,
            "important": next(iter(imps)),
            "values": {k: last[k]["value"] for k in sorted(keys)},
            "lines": {k: last[k]["source_line"] for k in sorted(keys)},
        }
    ]


def main():
    css_text = CSS_PATH.read_text(encoding="utf-8")
    stylesheet = tinycss2.parse_stylesheet(css_text, skip_whitespace=True, skip_comments=True)

    candidates = []
    for at_ctx, rule in _walk_rules(stylesheet, at_context=""):
        selector_text = _serialize_prelude(rule)
        decls = _serialize_declarations(rule)
        if not selector_text or not decls:
            continue

        for base in ["padding", "margin"]:
            for c in _four_side_candidates(decls, base):
                candidates.append(
                    {
                        "at_context": at_ctx,
                        "selector": selector_text,
                        "candidate": c,
                    }
                )

    report = {
        "meta": {"css_path": str(CSS_PATH)},
        "candidates_count": len(candidates),
        "candidates": candidates,
    }
    out_path = ROOT / "tools" / "css_shorthand_candidates.report.json"
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(json.dumps({"candidates_count": report["candidates_count"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

