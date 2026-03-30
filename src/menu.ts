// Radial menu system

import { openUrl } from "@tauri-apps/plugin-opener";
import { state } from "./state";
import { SPRITE_WIDTH, SPRITE_HEIGHT } from "./cat-sprites";
import { showDragHandle, hideDragHandle } from "./drag";
import { openSettings, closeSettings } from "./components/settings-dialog";

const MENU_BUTTONS = [
  { id: "settings",  icon: "\u2699",          label: "Settings",   color: "#f4a83d" },
  { id: "chatgpt",   icon: "\ud83e\udd16",    label: "ChatGPT",   color: "#10a37f" },
  { id: "youtube",   icon: "\u25b6\ufe0f",    label: "YouTube",    color: "#ff0000" },
  { id: "ytmusic",   icon: "\ud83c\udfb5",    label: "YT Music",  color: "#ff4e45" },
  { id: "facebook",  icon: "\ud83d\udc64",    label: "Facebook",  color: "#1877f2" },
  { id: "translate", icon: "\ud83c\udf10",    label: "Translate",  color: "#4285f4" },
  { id: "vnexpress", icon: "\ud83d\udcf0",    label: "VnExpress",  color: "#b71c1c" },
];

const URL_MAP: Record<string, string> = {
  chatgpt:   "https://chatgpt.com",
  youtube:   "https://www.youtube.com",
  ytmusic:   "https://music.youtube.com",
  facebook:  "https://www.facebook.com",
  translate: "https://translate.google.com",
  vnexpress: "https://vnexpress.net",
};

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
    el.innerHTML = `<span class="radial-icon">${btn.icon}</span><span class="radial-label">${btn.label}</span>`;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      handleMenuAction(btn.id);
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
  if (menu && !menu.contains(e.target as Node) &&
      settings && !settings.contains(e.target as Node) &&
      handle && !handle.contains(e.target as Node)) {
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

async function handleMenuAction(id: string) {
  if (!state.game) return;
  if (id === "settings") {
    openSettings();
    return;
  }
  const url = URL_MAP[id];
  if (url) {
    await openUrl(url);
    closeMenu();
  }
}
