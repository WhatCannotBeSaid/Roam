/**
 * Roam Research 标签隐藏前缀 "#"
 * - 当 "#" 在 span 的文本里时，用 JS 去掉首字
 * - 用 data-tag-hash-hidden 标记已处理，避免重复
 * - MutationObserver 处理后续动态插入的标签
 */
(function () {
  const ATTR = "data-tag-hash-hidden";
  const selector = 'span.rm-page-ref--tag, span[data-tag]';

  function stripHash(span) {
    if (span.hasAttribute(ATTR)) return;
    var text = span.textContent;
    if (!text || text.charAt(0) !== "#") return;
    span.textContent = text.slice(1);
    span.setAttribute(ATTR, "true");
  }

  function scan(root) {
    try {
      root.querySelectorAll(selector).forEach(stripHash);
    } catch (_) {}
  }

  function run() {
    scan(document.body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  try {
    var obs = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(selector)) stripHash(node);
          if (node.querySelectorAll) scan(node);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  } catch (_) {}
})();
