// Radial menu system

import { openUrl } from "@tauri-apps/plugin-opener";
import { state } from "./state";
import { SPRITE_WIDTH, SPRITE_HEIGHT } from "./cat";
import { showDragHandle, hideDragHandle } from "./drag";
import { openSettings, closeSettings } from "./components/settings-dialog";
import { getPomodoroSettings, savePomodoroSettings } from "./main";

import settingsLogo from "./assets/logos/settings.svg";
import chatgptLogo from "./assets/logos/chatgpt.png";
import feedLogo from "./assets/logos/feed.svg";
import socialLogo from "./assets/logos/social.svg";
import ytmusicLogo from "./assets/logos/ytmusic.png";
import facebookLogo from "./assets/logos/facebook.png";
import translateLogo from "./assets/logos/translate.png";
import vnexpressLogo from "./assets/logos/vnexpress.png";
import pomodoroLogo from "./assets/logos/pomodoro.svg";
import priceLogo from "./assets/logos/price.svg";

const MENU_BUTTONS = [
  {
    id: "settings",
    icon: settingsLogo,
    label: "Settings",
    color: "#f4a83d",
  },
  {
    id: "pomodoro",
    icon: pomodoroLogo,
    label: "Focus",
    color: "#e74c3c",
  },
  {
    id: "chatgpt",
    icon: chatgptLogo,
    label: "ChatGPT",
    color: "#10a37f",
  },
  {
    id: "social",
    icon: socialLogo,
    label: "Social",
    color: "#1877f2",
  },
  {
    id: "feed",
    icon: feedLogo,
    label: "Feed",
    color: "#f4a83d",
  },
  {
    id: "translate",
    icon: translateLogo,
    label: "Translate",
    color: "#4285f4",
  },
  {
    id: "vnexpress",
    icon: vnexpressLogo,
    label: "VnExpress",
    color: "#b71c1c",
  },
  {
    id: "price",
    icon: priceLogo,
    label: "Prices",
    color: "#f7931a",
  },
];

const URL_MAP: Record<string, string> = {
  chatgpt: "https://chatgpt.com",
  ytmusic: "https://music.youtube.com",
  facebook: "https://www.facebook.com",
  translate: "https://translate.google.com",
  vnexpress: "https://vnexpress.net",
};

const SOCIAL_ITEMS = [
  { id: "facebook", icon: facebookLogo, label: "Facebook", color: "#1877f2" },
  { id: "ytmusic", icon: ytmusicLogo, label: "YT Music", color: "#ff4e45" },
];

export async function toggleMenu() {
  if (state.settingsOpen) {
    closeSettings();
    return;
  }
  if (state.menuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

async function openMenu() {
  if (!state.game || !state.win) return;
  state.menuOpen = true;
  state.game.pause();
  await state.win.setIgnoreCursorEvents(false);

  showDragHandle();
  renderMenuButtons();

  // Click outside to close
  setTimeout(() => {
    document.addEventListener("click", onClickOutside);
  }, 50);
}

function renderMenuButtons() {
  if (!state.game) return;
  const centerX = state.game.catX + SPRITE_WIDTH / 2;
  const centerY = state.game.catY + SPRITE_HEIGHT / 2;
  const radius = 70;
  const count = MENU_BUTTONS.length;
  const angleStep = 360 / count;

  const menu = document.getElementById("radial-menu")!;
  menu.className = "radial-menu";
  menu.innerHTML = "";

  MENU_BUTTONS.forEach((btn, i) => {
    const angle = (i * angleStep - 90) * (Math.PI / 180);
    const bx = centerX + radius * Math.cos(angle);
    const by = centerY + radius * Math.sin(angle);

    const el = document.createElement("button");
    el.className = "radial-btn";
    el.style.left = `${bx}px`;
    el.style.top = `${by}px`;
    el.style.backgroundColor = btn.color;
    el.style.animationDelay = `${i * 40}ms`;
    el.innerHTML = `<img class="radial-icon" src="${btn.icon}" alt="${btn.label}" />`;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (btn.id === "social") {
        showSocialSubMenu(el);
      } else {
        handleMenuAction(btn.id);
      }
    });
    menu.appendChild(el);
  });
}

export function updateMenuPositions() {
  if (!state.game || !state.menuOpen) return;
  const centerX = state.game.catX + SPRITE_WIDTH / 2;
  const centerY = state.game.catY + SPRITE_HEIGHT / 2;
  const radius = 70;
  const count = MENU_BUTTONS.length;
  const angleStep = 360 / count;

  const menu = document.getElementById("radial-menu")!;
  const buttons = menu.querySelectorAll<HTMLButtonElement>(".radial-btn");
  buttons.forEach((el, i) => {
    const angle = (i * angleStep - 90) * (Math.PI / 180);
    el.style.left = `${centerX + radius * Math.cos(angle)}px`;
    el.style.top = `${centerY + radius * Math.sin(angle)}px`;
  });
}

function onClickOutside(e: MouseEvent) {
  if (state.dragging) return;
  const menu = document.getElementById("radial-menu");
  const settings = document.getElementById("settings-dialog");
  const handle = document.getElementById("drag-handle");
  if (
    menu &&
    !menu.contains(e.target as Node) &&
    settings &&
    !settings.contains(e.target as Node) &&
    handle &&
    !handle.contains(e.target as Node)
  ) {
    closeMenu();
  }
}

export async function closeMenu() {
  if (!state.game || !state.win) return;
  state.menuOpen = false;
  state.settingsOpen = false;
  state.dragging = false;
  state.cursorOverCat = false;

  document.removeEventListener("click", onClickOutside);

  document.querySelector(".social-submenu")?.remove();

  const menu = document.getElementById("radial-menu")!;
  menu.className = "radial-menu hidden";
  menu.innerHTML = "";

  const settings = document.getElementById("settings-dialog")!;
  settings.className = "settings-dialog hidden";
  settings.innerHTML = "";

  hideDragHandle();

  const hitbox = document.getElementById("cat-hitbox");
  if (hitbox) hitbox.style.display = "none";

  state.game.resume();
  await state.win.setIgnoreCursorEvents(true);
}

function showSocialSubMenu(anchorEl: HTMLButtonElement) {
  // Remove existing sub-menu if any
  document.querySelector(".social-submenu")?.remove();

  const rect = anchorEl.getBoundingClientRect();
  const submenu = document.createElement("div");
  submenu.className = "social-submenu";
  submenu.style.left = `${rect.left + rect.width / 2}px`;
  submenu.style.top = `${rect.top + rect.height / 2}px`;

  SOCIAL_ITEMS.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.className = "radial-btn social-sub-btn";
    btn.style.backgroundColor = item.color;
    btn.style.animationDelay = `${i * 40}ms`;
    // Position sub-items to the left and right of the anchor
    const offsetX = i === 0 ? -36 : 36;
    btn.style.left = `${offsetX}px`;
    btn.style.top = "0px";
    btn.innerHTML = `<img class="radial-icon" src="${item.icon}" alt="${item.label}" />`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleMenuAction(item.id);
    });
    submenu.appendChild(btn);
  });

  const menu = document.getElementById("radial-menu")!;
  menu.appendChild(submenu);
}

async function handleMenuAction(id: string) {
  if (!state.game) return;
  if (id === "settings") {
    openSettings();
    return;
  }
  if (id === "feed") {
    closeMenu();
    state.game.forceAction("eat");
    state.game.showChat("nom nom~! 🐟");
    return;
  }
  if (id === "price") {
    state.game.togglePriceBoard();
    closeMenu();
    return;
  }
  if (id === "pomodoro") {
    state.game.togglePomodoro(getPomodoroSettings());
    state.pomodoroActive = state.game.pomodoroTimer?.isActive ?? false;
    savePomodoroSettings({ enabled: state.pomodoroActive });
    closeMenu();
    return;
  }
  const url = URL_MAP[id];
  if (url) {
    await openUrl(url);
    closeMenu();
  }
}
