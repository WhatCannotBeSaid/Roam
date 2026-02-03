/**
 * Roam Research 日/夜间模式切换
 * 参考 https://github.com/8bitgentleman/roam-depo-dark-toggle
 * - 使用 .rm-dark-theme 类（body + html），与插件约定一致
 * - 使用 Blueprint 图标字体 bp3-icon-flash / bp3-icon-moon / bp3-icon-repeat，与顶栏原生一致
 * - 三档：自动(跟随系统) / 日间 / 夜间，偏好存 localStorage
 */

(function () {
  const STORAGE_KEY = "roam-theme-mode"; // "light" | "dark" | "auto"
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

  /** Blueprint 图标名：light=flash, dark=moon, auto=repeat（与 roam-depo-dark-toggle 一致） */
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

  /** 与 roam-depo-dark-toggle 相同的按钮结构：bp3-button bp3-minimal bp3-small + bp3-icon bp3-icon-{name} */
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
