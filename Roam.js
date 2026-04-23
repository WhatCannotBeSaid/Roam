    /*!
    * Roam Research Scripts: Theme-Toggle & Smile CheckBox
    * Copyright (c) 2026 Axiom
    * Licensed under the MIT License
    */
    /**
     Theme-Toggle（日夜切换）
    */

    (function () {
      const STORAGE_KEY = "roam-theme-mode";
      const THEME_CLASS = "rm-dark-theme";
      const CYCLE = ["auto", "light", "dark"];
      var lastThemeIsDark = null;
      var excalidrawRootObservers = [];

      function getStored() {
        try {
          var m = localStorage.getItem(STORAGE_KEY);
          return CYCLE.indexOf(m) >= 0 ? m : "auto";
        } catch (_) {
          return "auto";
        }
      }

      function setStored(mode) {
        try {
          localStorage.setItem(STORAGE_KEY, mode);
        } catch (_) {}
      }

      function getEffectiveDark() {
        var stored = getStored();
        if (stored === "dark") return true;
        if (stored === "light") return false;
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
        var dark = getEffectiveDark();
        setThemeClass(dark);
        updateButtonIcon();
      }

      function cycleMode() {
        var stored = getStored();
        var next = CYCLE[(CYCLE.indexOf(stored) + 1) % CYCLE.length];
        setStored(next);
        applyEffectiveTheme();
      }

      function getIconName(stored) {
        if (stored === "light") return "flash";
        if (stored === "dark") return "moon";
        return "repeat";
      }

      function updateButtonIcon() {
        var btn = document.getElementById("roam-theme-toggle-btn");
        if (!btn) return;
        var stored = getStored();
        var dark = getEffectiveDark();
        var iconSpan = btn.querySelector(".bp3-icon");
        if (iconSpan) {
          iconSpan.className = "bp3-icon bp3-icon-" + getIconName(stored);
        }
        var titles = {
          auto: "跟随系统 (当前" + (dark ? "夜间" : "日间") + ")",
          light: "日间模式",
          dark: "夜间模式"
        };
        btn.setAttribute("title", (titles[stored] || titles.auto) + " · 点击切换");
      }

      function createIconButton(iconName) {
        var popoverButton = document.createElement("span");
        popoverButton.id = "roam-theme-toggle-btn";
        popoverButton.className = "bp3-button bp3-minimal bp3-small";
        popoverButton.tabIndex = 0;
        popoverButton.setAttribute("aria-label", "切换主题 (自动/日间/夜间)");

        var popoverIcon = document.createElement("span");
        popoverIcon.className = "bp3-icon bp3-icon-" + iconName;
        popoverButton.appendChild(popoverIcon);

        return popoverButton;
      }

      function createToggle() {
        if (document.getElementById("roam-theme-toggle-btn")) return false;

        var roamTopbar = document.getElementsByClassName("rm-topbar");
        if (!roamTopbar || !roamTopbar[0]) return false;

        var lastChild = roamTopbar[0].lastElementChild;
        var mainButton = createIconButton(getIconName(getStored()));
        mainButton.addEventListener("click", cycleMode);

        if (lastChild) {
          lastChild.insertAdjacentElement("afterend", mainButton);
        } else {
          roamTopbar[0].appendChild(mainButton);
        }

        updateButtonIcon();
        return true;
      }

      function setupSystemListener() {
        try {
          var mq = window.matchMedia("(prefers-color-scheme: dark)");
          if (mq.addEventListener) {
            mq.addEventListener("change", function () {
              if (getStored() === "auto") applyEffectiveTheme();
            });
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

      function tryCreateToggle() {
        setThemeClass(getEffectiveDark());
        setupSystemListener();
        setupExcalidrawThemeSync();
        if (createToggle()) return;
        var attempts = 0;
        var interval = setInterval(function () {
          attempts++;
          if (createToggle() || attempts >= 50) clearInterval(interval);
        }, 200);
      }

      function init() {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", tryCreateToggle);
        } else {
          tryCreateToggle();
        }
      }

      init();
    })();
