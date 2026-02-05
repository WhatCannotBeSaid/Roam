/**
 * Roam Research 合并脚本：Theme-Toggle（日夜切换）+ Smile CheckBox（笑脸复选框）
 * 标签样式仅由 roam.css 提供，此处不再包含标签相关 JS。
 */

/* ============================================================ */
/* 1. 日/夜间模式切换（Theme Toggle）                             */
/* ============================================================ */
(function () {
  const STORAGE_KEY = "roam-theme-mode";
  const THEME_CLASS = "rm-dark-theme";
  const CYCLE = ["auto", "light", "dark"];

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

  function tryCreateToggle() {
    setThemeClass(getEffectiveDark());
    setupSystemListener();
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

/* ============================================================ */
/* 2. 笑脸复选框（Smile CheckBox）                                */
/* ============================================================ */
(function () {
  if (window.__roamSmileyCheckboxInited) return;
  window.__roamSmileyCheckboxInited = true;

  function injectSmileyFace() {
    var checks = document.querySelectorAll(".check-container .checkmark");
    checks.forEach(function (span) {
      if (!span.querySelector(".smiley-face")) {
        var face = document.createElement("i");
        face.className = "smiley-face";
        face.textContent = "";
        span.appendChild(face);
      }
    });
  }

  injectSmileyFace();

  var pending = false;
  function scheduleInject() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      injectSmileyFace();
    });
  }

  var observer = new MutationObserver(function (mutations) {
    var shouldCheck = mutations.some(function (mutation) {
      if (!mutation.addedNodes || mutation.addedNodes.length === 0) return false;
      return Array.from(mutation.addedNodes).some(function (node) {
        if (node.nodeType !== 1) return false;
        var el = node;
        return (el.classList && el.classList.contains("roam-block-container")) ||
          (el.classList && el.classList.contains("check-container")) ||
          (el.classList && el.classList.contains("checkmark")) ||
          (el.querySelector && el.querySelector(".roam-block-container")) ||
          (el.querySelector && el.querySelector(".check-container")) ||
          (el.querySelector && el.querySelector(".checkmark")) ||
          (el.classList && el.classList.contains("rm-block__input")) ||
          (el.querySelector && el.querySelector(".rm-block__input"));
      });
    });
    if (!shouldCheck) return;
    scheduleInject();
  });

  var root = document.querySelector(".roam-app") || document.body;
  observer.observe(root, { childList: true, subtree: true });

  root.addEventListener("click", function (e) {
    if (e.target.closest(".check-container")) {
      requestAnimationFrame(function () { injectSmileyFace(); });
    }
  }, true);

  setTimeout(injectSmileyFace, 500);
  setTimeout(injectSmileyFace, 1500);
})();
