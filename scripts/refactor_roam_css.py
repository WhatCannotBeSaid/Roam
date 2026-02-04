# -*- coding: utf-8 -*-
"""
Refactor roam.css using system.css as layout reference.
- Selectors only in roam.css: keep as-is.
- Selectors in both: use system.css for non-font, non-color properties; keep roam's font-family and colors.
- Output: roam-refactored.css
"""
import re
import os

# Properties we must NOT take from system (keep from roam or leave unchanged)
SKIP_FROM_SYSTEM = {
    "color", "background", "background-color", "font-family", "font-weight",
    "fill", "stroke", "opacity", "box-shadow", "text-shadow",
    "border-color", "outline-color", "caret-color",
}
# Also skip any property that ends with -color or contains "color"
def is_color_or_font(prop):
    p = prop.strip().lower()
    if p in SKIP_FROM_SYSTEM:
        return True
    if "color" in p or "font-" in p or p == "font":
        return True
    return False

def normalize_selector(sel, prefix_roam_app=True):
    """Normalize for matching: strip .roam-body .roam-app from system, .roam-app from roam."""
    s = sel.strip()
    # System style: .roam-body .roam-app .roam-main .roam-article -> .roam-main .roam-article
    if ".roam-body .roam-app " in s or s.startswith(".roam-body .roam-app"):
        s = re.sub(r"^\.roam-body\s+\.roam-app\s+", "", s)
    # Roam style: .roam-app .roam-article -> .roam-article (so it matches system's .roam-main .roam-article when we key by tail)
    if prefix_roam_app and (".roam-app " in s or s.startswith(".roam-app ")):
        s = re.sub(r"^\.roam-app\s+", "", s)
    return s

def parse_css_rules(content):
    """Parse CSS into list of (selector, declarations_string)."""
    rules = []
    # Remove comments first to avoid matching inside them
    content_no_comments = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
    # Split by }; then each block is selector { decls }
    blocks = re.split(r"\}\s*", content_no_comments)
    for block in blocks:
        block = block.strip()
        if not block or block.startswith("@"):
            continue
        if "{" in block:
            sel, _, rest = block.partition("{")
            sel = sel.strip().strip(",")
            decls = rest.strip()
            if sel and decls:
                rules.append((sel, decls))
    return rules

def declarations_to_dict(decls):
    """Parse declarations string into { prop: value }."""
    d = {}
    for part in decls.split(";"):
        part = part.strip()
        if not part:
            continue
        if ":" in part:
            k, _, v = part.partition(":")
            d[k.strip()] = v.strip()
    return d

def dict_to_declarations(d):
    return "; ".join(k + ": " + v for k, v in d.items())

def extract_layout_from_system(decls_dict):
    """Keep only layout/non-color non-font properties."""
    return {k: v for k, v in decls_dict.items() if not is_color_or_font(k)}

def merge_rule(roam_decls, system_layout_decls):
    """Roam decls: keep color/font; replace other with system_layout_decls where present."""
    roam_d = declarations_to_dict(roam_decls)
    out = dict(system_layout_decls)  # start with system layout
    for k, v in roam_d.items():
        if is_color_or_font(k):
            out[k] = v  # keep roam color/font
        elif k not in system_layout_decls:
            out[k] = v  # keep roam prop if system didn't set it
    return dict_to_declarations(out)

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    roam_path = os.path.join(base, "roam.css")
    system_path = os.path.join(base, ".cursor", "skills", "roam-research-visual-system", "system.css")
    out_path = os.path.join(base, "roam-refactored.css")

    with open(system_path, "r", encoding="utf-8") as f:
        system_css = f.read()
    with open(roam_path, "r", encoding="utf-8") as f:
        roam_css = f.read()

    system_rules = parse_css_rules(system_css)
    # Build map: normalized_selector -> layout-only declarations dict
    system_layout_map = {}
    for sel, decls in system_rules:
        norm = normalize_selector(sel, prefix_roam_app=False)
        layout = extract_layout_from_system(declarations_to_dict(decls))
        if layout:
            # Same normalized key might appear with different full selectors; merge layout
            if norm not in system_layout_map:
                system_layout_map[norm] = {}
            system_layout_map[norm].update(layout)

    # Also add keys without .roam-main for article (roam has .roam-app .roam-article, system has .roam-body .roam-app .roam-main .roam-article)
    for k in list(system_layout_map):
        if k.startswith("roam-main "):
            short = k.replace("roam-main ", "", 1)
            if short not in system_layout_map:
                system_layout_map[short] = {}
            system_layout_map[short].update(system_layout_map[k])

    # Rebuild roam.css: split by "}", then for each block that has "{", extract selector and merge decls
    parts = roam_css.split("}")
    out_parts = []
    for part in parts:
        if "{" not in part:
            out_parts.append(part)
            continue
        before_brace, _, decls = part.rpartition("{")
        selector = before_brace.strip()
        decls = decls.strip()
        if not selector or not decls:
            out_parts.append(part)
            continue
        if "{" in decls:
            out_parts.append(part)
            continue
        first_sel = selector.split(",")[0].strip()
        norm_roam = normalize_selector(first_sel, prefix_roam_app=True)
        if norm_roam in system_layout_map:
            merged = merge_rule(decls, system_layout_map[norm_roam])
            sep = ";\n  " if "\n" in decls else "; "
            out_parts.append(before_brace + "{\n  " + merged.replace("; ", sep) + "\n")
        else:
            out_parts.append(part)
    result = "}".join(out_parts)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(result)
    print("Wrote", out_path)

if __name__ == "__main__":
    main()
