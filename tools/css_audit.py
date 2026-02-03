import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

import tinycss2
from cssselect2 import ElementWrapper
from cssselect2.compiler import CompiledSelector, compile_selector_list
from cssselect2.parser import (
    CombinedSelector,
    CompoundSelector,
    NegationSelector,
    PseudoClassSelector,
    Selector,
    parse as parse_selector_list,
)
from lxml import html


ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / "roam.css"
HTML_PATH = ROOT / "index.html"


INTERACTIVE_PSEUDO_CLASSES = {
    "hover",
    "active",
    "focus",
    "focus-within",
    "focus-visible",
    "visited",
    "link",
    "checked",
    "disabled",
    "enabled",
    "target",
}


@dataclass(frozen=True)
class RuleRef:
    at_context: str
    selector_text: str
    source_line: int


def _strip_interactive_pseudos_from_tree(node):
    """Return a selector AST tree with interactive pseudo-classes removed.

    Goal: for DOM-existence checks, avoid false 'unused' when selector is
    stateful (hover/focus/etc). Structural pseudos are preserved.
    """
    if isinstance(node, CombinedSelector):
        return CombinedSelector(
            _strip_interactive_pseudos_from_tree(node.left),
            node.combinator,
            _strip_interactive_pseudos_from_tree(node.right),
        )

    if isinstance(node, CompoundSelector):
        stripped = []
        for ss in node.simple_selectors:
            if isinstance(ss, PseudoClassSelector) and ss.name in INTERACTIVE_PSEUDO_CLASSES:
                continue

            if isinstance(ss, NegationSelector):
                # Strip interactive pseudos inside :not(). If it becomes effectively
                # empty (e.g. :not(:hover)), drop it to avoid false negatives.
                new_list = []
                for sub in ss.selector_list:
                    new_sub_tree = _strip_interactive_pseudos_from_tree(sub.parsed_tree)
                    new_sub = Selector(new_sub_tree)
                    # Heuristic: empty selector string means "no-op" after stripping.
                    if str(new_sub).strip():
                        new_list.append(new_sub)
                if not new_list:
                    continue
                stripped.append(NegationSelector(new_list))
                continue

            stripped.append(ss)
        return CompoundSelector(stripped)

    # All other node types are treated as immutable/leaf-like.
    return node


_RE_WHITESPACE = re.compile(r"\s+")


def _normalize_selector_text(selector_text: str) -> str:
    # Keep semantics; normalize whitespace to ease grouping.
    return _RE_WHITESPACE.sub(" ", selector_text.strip())


def _parse_html_root() -> ElementWrapper:
    # NOTE:
    # The repo's index.html is typically a body-fragment snapshot of Roam's DOM.
    # If we parse it as a fragment root (<div class="roam-app">...), selectors
    # starting with `html`/`body` would never match and would be falsely reported
    # as unused. Parse as a full HTML document so `html`/`body` selectors can
    # match when appropriate.
    dom = html.document_fromstring(HTML_PATH.read_text(encoding="utf-8"))
    return ElementWrapper.from_html_root(dom)


def _compiled_selector_has_dom_hit(
    root: ElementWrapper, compiled: CompiledSelector
) -> bool:
    if getattr(compiled, "pseudo_element", None) is not None:
        return False
    for el in root.iter_subtree():
        if compiled.test(el):
            return True
    return False


def _rule_selectors_dom_hits(root: ElementWrapper, selector_input) -> Tuple[bool, List[str]]:
    """Return (any_hit, errors).

    selector_input: string or tinycss2 component values (e.g. rule.prelude)
    """
    errors: List[str] = []
    any_hit = False
    try:
        selectors = list(parse_selector_list(selector_input))
    except Exception as e:
        return False, [f"parse_error: {e.__class__.__name__}: {e}"]

    for sel in selectors:
        try:
            stripped_tree = _strip_interactive_pseudos_from_tree(sel.parsed_tree)
            stripped_sel = Selector(stripped_tree, pseudo_element=None)
            compiled = CompiledSelector(stripped_sel)
            if _compiled_selector_has_dom_hit(root, compiled):
                any_hit = True
        except Exception as e:  # pragma: no cover
            errors.append(f"strip_or_match_error: {e.__class__.__name__}: {e}")
    return any_hit, errors


def _serialize_prelude(rule) -> str:
    return tinycss2.serialize(rule.prelude).strip()


def _serialize_declarations(rule) -> List[dict]:
    if rule.content is None:
        return []
    decls = tinycss2.parse_declaration_list(rule.content, skip_whitespace=True, skip_comments=True)
    out = []
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
            yield at_context, r


def main():
    root = _parse_html_root()
    css_text = CSS_PATH.read_text(encoding="utf-8")
    stylesheet = tinycss2.parse_stylesheet(css_text, skip_whitespace=True, skip_comments=True)

    # Build rule inventory
    rules = []
    for at_ctx, rule in _walk_rules(stylesheet, at_context=""):
        selector_text = _normalize_selector_text(_serialize_prelude(rule))
        if not selector_text:
            continue
        prelude_tokens = rule.prelude
        rules.append(
            {
                "at_context": at_ctx.strip(),
                "selector": selector_text,
                "prelude_tokens": prelude_tokens,
                "source_line": rule.source_line,
                "declarations": _serialize_declarations(rule),
            }
        )

    # 1) DOM hit map (per rule selector list)
    unused_candidates = []
    dom_parse_errors = []
    for r in rules:
        any_hit, errors = _rule_selectors_dom_hits(root, r["prelude_tokens"])
        if errors:
            dom_parse_errors.append(
                {
                    "at_context": r["at_context"],
                    "selector": r["selector"],
                    "source_line": r["source_line"],
                    "errors": errors,
                }
            )
        if not any_hit:
            unused_candidates.append(
                {
                    "at_context": r["at_context"],
                    "selector": r["selector"],
                    "source_line": r["source_line"],
                }
            )

    # 2) Conflicts for "same selector multiple blocks" within same at-context.
    by_selector = {}
    for r in rules:
        key = (r["at_context"], r["selector"])
        by_selector.setdefault(key, []).append(r)

    multi_blocks = []
    for (at_ctx, sel), rs in by_selector.items():
        if len(rs) <= 1:
            continue
        rs_sorted = sorted(rs, key=lambda x: x["source_line"])
        # Detect overlapping props with different values/important.
        seen = {}
        conflicts = []
        for rr in rs_sorted:
            for d in rr["declarations"]:
                prop = d["name"]
                val = (d["value"], d["important"])
                if prop in seen and seen[prop] != val:
                    conflicts.append(
                        {
                            "property": prop,
                            "prev": {"value": seen[prop][0], "important": seen[prop][1]},
                            "next": {"value": val[0], "important": val[1]},
                            "line": rr["source_line"],
                        }
                    )
                seen[prop] = val
        multi_blocks.append(
            {
                "at_context": at_ctx,
                "selector": sel,
                "occurrences": [r["source_line"] for r in rs_sorted],
                "conflicts": conflicts,
            }
        )

    report = {
        "meta": {
            "css_path": str(CSS_PATH),
            "html_path": str(HTML_PATH),
            "total_rules": len(rules),
            "unused_candidates_count": len(unused_candidates),
            "dom_parse_errors_count": len(dom_parse_errors),
            "multi_blocks_count": sum(1 for x in multi_blocks if len(x["occurrences"]) > 1),
        },
        "unused_candidates": unused_candidates,
        "dom_parse_errors": dom_parse_errors,
        "multi_blocks": sorted(multi_blocks, key=lambda x: (-len(x["occurrences"]), x["selector"]))[:400],
    }

    out_path = ROOT / "tools" / "css_audit.report.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(json.dumps(report["meta"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

