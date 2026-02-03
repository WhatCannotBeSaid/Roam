import json
from pathlib import Path
from typing import Iterable, Tuple

import tinycss2


ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / "roam.css"


def _walk_rules(stylesheet_rules, at_context: str = "") -> Iterable[Tuple[str, object]]:
    """Yield (at_context, qualified_rule). at_context is a stable string key."""
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


def main():
    css_text = CSS_PATH.read_text(encoding="utf-8")
    stylesheet = tinycss2.parse_stylesheet(css_text, skip_whitespace=True, skip_comments=True)

    redundant_same_prop = []
    redundant_border_top_in_block = []
    redundant_longhand_under_shorthand = []

    for at_ctx, rule in _walk_rules(stylesheet, at_context=""):
        selector_text = _serialize_prelude(rule)
        decls = _serialize_declarations(rule)
        if not selector_text or not decls:
            continue

        # 1) Same property repeated with same (value, important) in the same block.
        seen: dict[str, tuple[str, bool, int | None]] = {}
        for d in decls:
            prop = d["name"]
            val = d["value"]
            imp = d["important"]
            line = d["source_line"]
            if prop in seen and seen[prop][:2] == (val, imp):
                redundant_same_prop.append(
                    {
                        "at_context": at_ctx,
                        "selector": selector_text,
                        "property": prop,
                        "value": val,
                        "important": imp,
                        "line": line,
                        "prev_line": seen[prop][2],
                    }
                )
            seen[prop] = (val, imp, line)

        # 2) `border-top: none !important` is redundant if the same block already has
        #    `border: none !important` (same importance).
        if "border" in seen and "border-top" in seen:
            b_val, b_imp, _ = seen["border"]
            bt_val, bt_imp, bt_line = seen["border-top"]
            if b_val.strip() == "none" and bt_val.strip() == "none" and b_imp == bt_imp:
                redundant_border_top_in_block.append(
                    {"at_context": at_ctx, "selector": selector_text, "line": bt_line}
                )

        # 3) `background-color` is redundant under later `background` (both !important)
        #    within the same block. Be conservative: only report the simplest safe case.
        props = [d["name"] for d in decls]
        if "background" in props and "background-color" in props:
            last_bg = max(i for i, p in enumerate(props) if p == "background")
            last_bgc = max(i for i, p in enumerate(props) if p == "background-color")
            if last_bg > last_bgc:
                bg_imp = decls[last_bg]["important"]
                bgc_imp = decls[last_bgc]["important"]
                if bg_imp and bgc_imp:
                    redundant_longhand_under_shorthand.append(
                        {
                            "at_context": at_ctx,
                            "selector": selector_text,
                            "line": decls[last_bgc]["source_line"],
                            "longhand": "background-color",
                            "shorthand": "background",
                        }
                    )

    report = {
        "meta": {"css_path": str(CSS_PATH)},
        "redundant_same_prop_count": len(redundant_same_prop),
        "redundant_border_top_in_block_count": len(redundant_border_top_in_block),
        "redundant_longhand_under_shorthand_count": len(redundant_longhand_under_shorthand),
        "samples": {
            "redundant_same_prop": redundant_same_prop[:50],
            "redundant_border_top_in_block": redundant_border_top_in_block[:50],
            "redundant_longhand_under_shorthand": redundant_longhand_under_shorthand[:50],
        },
    }

    out_path = ROOT / "tools" / "css_redundancy.report.json"
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(json.dumps({k: report[k] for k in report if k.endswith('_count')}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

