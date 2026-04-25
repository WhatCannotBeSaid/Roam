    /*!
    * Roam Research Scripts: System Theme Sync & Math Input Shortcut
    * Copyright (c) 2026 Axiom
    * Licensed under the MIT License
    */
    /**
     系统日夜同步（无顶栏按钮，始终跟随 prefers-color-scheme）
    */

    (function () {
      const THEME_CLASS = "rm-dark-theme";
      var lastThemeIsDark = null;
      var excalidrawRootObservers = [];

      function getSystemDark() {
        try {
          return window.matchMedia("(prefers-color-scheme: dark)").matches;
        } catch (_) {
          return false;
        }
      }

      function setThemeClass(dark) {
        if (dark) {
          document.body.classList.add(THEME_CLASS);
          document.documentElement.classList.add(THEME_CLASS);
        } else {
          document.body.classList.remove(THEME_CLASS);
          document.documentElement.classList.remove(THEME_CLASS);
        }
        lastThemeIsDark = !!dark;
        syncExcalidrawTheme(dark);
      }

      function syncExcalidrawTheme(dark) {
        var excalidrawRoots = document.querySelectorAll(".excalidraw");
        if (!excalidrawRoots.length) return;
        for (var i = 0; i < excalidrawRoots.length; i++) {
          var root = excalidrawRoots[i];
          root.classList.toggle("theme--dark", !!dark);
          root.classList.toggle("theme--light", !dark);
        }
      }

      function applyEffectiveTheme() {
        setThemeClass(getSystemDark());
      }

      function removeLegacyThemeButton() {
        var btn = document.getElementById("roam-theme-toggle-btn");
        if (btn) btn.remove();
      }

      function setupSystemListener() {
        try {
          var mq = window.matchMedia("(prefers-color-scheme: dark)");
          var onChange = function () {
            applyEffectiveTheme();
          };
          if (mq.addEventListener) {
            mq.addEventListener("change", onChange);
          } else if (mq.addListener) {
            mq.addListener(onChange);
          }
        } catch (_) {}
      }

      function setupExcalidrawThemeSync() {
        function disconnectExcalidrawRootObservers() {
          for (var i = 0; i < excalidrawRootObservers.length; i++) {
            excalidrawRootObservers[i].disconnect();
          }
          excalidrawRootObservers = [];
        }

        function observeExcalidrawRoots() {
          disconnectExcalidrawRootObservers();
          var roots = document.querySelectorAll(".excalidraw");
          for (var i = 0; i < roots.length; i++) {
            (function (root) {
              var rootObserver = new MutationObserver(function (mutations) {
                for (var j = 0; j < mutations.length; j++) {
                  var mutation = mutations[j];
                  if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    syncExcalidrawTheme(document.body.classList.contains(THEME_CLASS));
                    break;
                  }
                }
              });
              rootObserver.observe(root, {
                attributes: true,
                attributeFilter: ["class"]
              });
              excalidrawRootObservers.push(rootObserver);
            })(roots[i]);
          }
        }

        var observer = new MutationObserver(function (mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var mutation = mutations[i];
            if (
              mutation.type === "attributes" &&
              mutation.target === document.body &&
              mutation.attributeName === "class"
            ) {
              var isDark = document.body.classList.contains(THEME_CLASS);
              if (isDark !== lastThemeIsDark) {
                lastThemeIsDark = isDark;
                syncExcalidrawTheme(isDark);
              }
              break;
            }
            if (mutation.type === "childList" && mutation.addedNodes.length) {
              observeExcalidrawRoots();
              syncExcalidrawTheme(document.body.classList.contains(THEME_CLASS));
            }
          }
        });

        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ["class"],
          childList: true,
          subtree: true
        });

        document.addEventListener("fullscreenchange", function () {
          var isDark = document.body.classList.contains(THEME_CLASS);
          lastThemeIsDark = isDark;
          syncExcalidrawTheme(isDark);
          observeExcalidrawRoots();
        });

        lastThemeIsDark = document.body.classList.contains(THEME_CLASS);
        syncExcalidrawTheme(lastThemeIsDark);
        observeExcalidrawRoots();
      }

      function initSystemTheme() {
        removeLegacyThemeButton();
        applyEffectiveTheme();
        setupSystemListener();
        setupExcalidrawThemeSync();
      }

      function init() {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", initSystemTheme);
        } else {
          initSystemTheme();
        }
      }

      init();
    })();

    /**
     Math Input Shortcuts:
       1. `￥￥` → `$$$$`，光标停在两对 $$ 之间（参考 Roam 自带 `【【 → [[]]` 的思路：
          选中触发字符 + execCommand("insertText")，走浏览器原生输入通路）。
       2. 在 `$$...$$` 内按回车 → 不换行/不新建块，而是把光标挪到闭合 $$ 之后。
     仅在 Roam block textarea 中触发；输入单个 `￥` 时保持不变。
     额外监听 `compositionend`，覆盖中文输入法下 isComposing 的场景。
    */
    (function () {
      var TRIGGER = "￥￥";
      var REPLACEMENT = "$$$$";
      var DELIMITER = "$$";
      var CURSOR_MIDDLE_OFFSET = 2;
      var GUARD = false;

      function isRoamBlockTextarea(el) {
        if (!(el instanceof HTMLTextAreaElement)) return false;
        if (el.id && el.id.indexOf("block-input-") === 0) return true;
        return !!(el.closest && el.closest(".rm-block__input"));
      }

      function placeCursor(ta, pos) {
        try {
          ta.setSelectionRange(pos, pos);
        } catch (_) {}
      }

      function countOccurrences(text, needle) {
        var count = 0;
        var idx = 0;
        while ((idx = text.indexOf(needle, idx)) !== -1) {
          count++;
          idx += needle.length;
        }
        return count;
      }

      function attemptReplace(ta) {
        if (GUARD) return;
        if (!ta || !isRoamBlockTextarea(ta)) return;

        var cursor = ta.selectionStart;
        if (cursor == null || cursor < TRIGGER.length) return;

        var before = ta.value.slice(0, cursor);
        if (!before.endsWith(TRIGGER)) return;

        var triggerStart = cursor - TRIGGER.length;
        var middlePos = triggerStart + CURSOR_MIDDLE_OFFSET;

        GUARD = true;
        try {
          ta.setSelectionRange(triggerStart, cursor);
          var ok = false;
          try {
            ok = document.execCommand("insertText", false, REPLACEMENT);
          } catch (_) {}

          if (!ok) {
            var setter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              "value"
            ).set;
            var after = ta.value.slice(cursor);
            var stripped = ta.value.slice(0, triggerStart);
            setter.call(ta, stripped + REPLACEMENT + after);
            ta.dispatchEvent(new Event("input", { bubbles: true }));
          }
        } finally {
          GUARD = false;
        }

        placeCursor(ta, middlePos);
        requestAnimationFrame(function () {
          placeCursor(ta, middlePos);
        });
      }

      function handleInput(e) {
        if (e.isComposing) return;
        attemptReplace(e.target);
      }

      function handleCompositionEnd(e) {
        var ta = e.target;
        setTimeout(function () {
          attemptReplace(ta);
        }, 0);
      }

      function handleKeydown(e) {
        if (e.key !== "Enter") return;
        if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.isComposing) return;

        var ta = e.target;
        if (!isRoamBlockTextarea(ta)) return;

        var cursor = ta.selectionStart;
        if (cursor == null || cursor !== ta.selectionEnd) return;

        var before = ta.value.slice(0, cursor);
        var after = ta.value.slice(cursor);

        // 光标前 $$ 出现次数为奇数 → 处于一对未闭合的 $$...$$ 内部
        if (countOccurrences(before, DELIMITER) % 2 !== 1) return;

        var closeIdx = after.indexOf(DELIMITER);
        if (closeIdx === -1) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        var targetPos = cursor + closeIdx + DELIMITER.length;
        placeCursor(ta, targetPos);
        requestAnimationFrame(function () {
          placeCursor(ta, targetPos);
        });
      }

      document.addEventListener("input", handleInput, true);
      document.addEventListener("compositionend", handleCompositionEnd, true);
      document.addEventListener("keydown", handleKeydown, true);
    })();
