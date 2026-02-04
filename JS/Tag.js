/**
 * Roam Research 标签：隐藏前缀 "#" + 「隐迹」The Hidden Path
 * - 当 "#" 在 span 的文本里时，用 JS 去掉首字
 * - 用 data-tag-hash-hidden 标记已处理，避免重复
 * - 主样式由 roam.css「隐迹」提供：无背景、底部 scaleX 下划线，currentColor 适配日夜
 * - 点击标签时墨迹脉冲反馈（Web Animations API）
 * - MutationObserver 处理后续动态插入的标签
 */
(function () {
  const ATTR = "data-tag-hash-hidden";
  const selector = "span.rm-page-ref--tag, span[data-tag]";

  function stripHash(span) {
    if (span.hasAttribute(ATTR)) return;
    var text = span.textContent;
    if (!text || text.charAt(0) !== "#") return;
    span.textContent = text.slice(1);
    span.setAttribute(ATTR, "true");
  }

  function scan(root) {
    try {
      root.querySelectorAll(selector).forEach(function (el) {
        var text = el.textContent;
        if (text && text.charAt(0) === "#") {
          el.textContent = text.slice(1);
          el.setAttribute(ATTR, "true");
        }
      });
    } catch (_) {}
  }

  /** 「隐迹」墨迹扩散：点击标签时脉冲反馈 */
  function initInkPulse() {
    if (window.hiddenPathInited) return;
    document.addEventListener("mousedown", function (e) {
      var tag = e.target.closest(".rm-page-ref--tag, span[data-tag]");
      if (!tag || !tag.closest || !tag.closest(".roam-app")) return;

      var pulse = document.createElement("span");
      pulse.className = "tag-ink-pulse";

      var rect = tag.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);

      pulse.style.width = pulse.style.height = size + "px";
      pulse.style.left = (e.clientX - rect.left - size / 2) + "px";
      pulse.style.top = (e.clientY - rect.top - size / 2) + "px";

      tag.style.overflow = "hidden";
      tag.appendChild(pulse);

      pulse.animate(
        [
          { transform: "scale(0)", opacity: 0.3 },
          { transform: "scale(4)", opacity: 0 }
        ],
        { duration: 500, easing: "ease-out" }
      ).onfinish = function () { pulse.remove(); };
    });
    window.hiddenPathInited = true;
  }

  function run() {
    initInkPulse();
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
          if (node.matches && node.matches(selector)) {
            var text = node.textContent;
            if (text && text.charAt(0) === "#") {
              node.textContent = text.slice(1);
              node.setAttribute(ATTR, "true");
            }
          }
          if (node.querySelectorAll) scan(node);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  } catch (_) {}
})();
