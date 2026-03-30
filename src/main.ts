import { getCurrentWindow } from "@tauri-apps/api/window";
import { availableMonitors } from "@tauri-apps/api/window";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import { CatGame, ALL_ACTIONS } from "./game";
import { SPRITE_WIDTH, SPRITE_HEIGHT, type CatAction } from "./cat-sprites";
import "./styles.css";

// -- State --
let game: CatGame | null = null;
let menuOpen = false;
let settingsOpen = false;
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let win: ReturnType<typeof getCurrentWindow> | null = null;

// Menu button definitions
const MENU_BUTTONS = [
  { id: "settings", icon: "\u2699", label: "Activities", color: "#f4a83d" },
  { id: "walk",     icon: "\ud83d\udeb6", label: "Walk",       color: "#7ec8e3" },
  { id: "run",      icon: "\ud83c\udfc3", label: "Run",        color: "#ff8a65" },
  { id: "sleep",    icon: "\ud83d\udca4", label: "Sleep",      color: "#b39ddb" },
  { id: "lick",     icon: "\ud83d\udc45", label: "Lick",       color: "#f48fb1" },
  { id: "meow",     icon: "\ud83d\udd0a", label: "Meow",       color: "#81c784" },
];

// -- Welcome Screen --
function showWelcomeScreen() {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <div class="welcome">
      <div class="welcome-card">
        <div class="welcome-cat-preview">
          <canvas id="preview-canvas" width="64" height="64"></canvas>
        </div>
        <h1>Name Your Cat</h1>
        <form id="name-form">
          <input type="text" id="cat-name" placeholder="Enter cat name..." maxlength="16" autofocus required />
          <button type="submit" id="start-btn">Start</button>
        </form>
        <p class="hint">Press <kbd>Cmd+Shift+S</kbd> to open cat menu</p>
      </div>
    </div>
  `;
  animatePreview();

  const form = document.getElementById("name-form") as HTMLFormElement;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("cat-name") as HTMLInputElement;
    const name = input.value.trim();
    if (!name) return;
    await startGame(name);
  });
}

function animatePreview() {
  const canvas = document.getElementById("preview-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  import("./cat-sprites").then(({ ANIMATIONS, renderFrame }) => {
    const frames = ANIMATIONS.idle;
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, 64, 64);
      renderFrame(ctx, frames[frame], 0, 0, false);
      frame = (frame + 1) % frames.length;
    };
    draw();
    setInterval(draw, 500);
  });
}

// -- Game Mode --
async function startGame(catName: string) {
  win = getCurrentWindow();

  const monitors = await availableMonitors();
  const monitor = monitors[0];
  const scaleFactor = monitor?.scaleFactor || 1;
  const screenWidth = monitor ? monitor.size.width / scaleFactor : 1440;
  const screenHeight = monitor ? monitor.size.height / scaleFactor : 900;

  await win.setDecorations(false);
  await win.setAlwaysOnTop(true);
  await win.setResizable(false);
  await win.setSize(new LogicalSize(screenWidth, screenHeight));
  await win.setPosition(new LogicalPosition(0, 0));
  await win.setIgnoreCursorEvents(true);

  const app = document.getElementById("app")!;
  app.innerHTML = `
    <canvas id="game-canvas"></canvas>
    <div id="drag-handle" class="drag-handle hidden"></div>
    <div id="radial-menu" class="radial-menu hidden"></div>
    <div id="settings-dialog" class="settings-dialog hidden"></div>
  `;
  app.className = "game-mode";

  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  canvas.width = screenWidth;
  canvas.height = screenHeight;

  game = new CatGame(canvas, catName, screenWidth, screenHeight);
  game.start();

  // Listen for toggle-menu from global shortcut
  await listen("toggle-menu", () => toggleMenu());

  // Set up drag handlers
  setupDrag();
}

// -- Drag --
function setupDrag() {
  const handle = document.getElementById("drag-handle")!;

  handle.addEventListener("mousedown", (e) => {
    if (!game || !menuOpen) return;
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    dragOffsetX = e.clientX - game.catX;
    dragOffsetY = e.clientY - game.catY;
    handle.classList.add("dragging");
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging || !game) return;
    const newX = e.clientX - dragOffsetX;
    const newY = e.clientY - dragOffsetY;
    game.setPosition(newX, newY);
    updateMenuPositions();
    updateDragHandle();
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    const handle = document.getElementById("drag-handle");
    if (handle) handle.classList.remove("dragging");
  });
}

function updateDragHandle() {
  if (!game) return;
  const handle = document.getElementById("drag-handle");
  if (!handle || handle.classList.contains("hidden")) return;
  handle.style.left = `${game.catX - 8}px`;
  handle.style.top = `${game.catY - 8}px`;
}

function showDragHandle() {
  if (!game) return;
  const handle = document.getElementById("drag-handle")!;
  handle.classList.remove("hidden");
  handle.style.left = `${game.catX - 8}px`;
  handle.style.top = `${game.catY - 8}px`;
}

function hideDragHandle() {
  const handle = document.getElementById("drag-handle");
  if (handle) handle.classList.add("hidden");
}

// -- Radial Menu --
async function toggleMenu() {
  if (settingsOpen) {
    closeSettings();
    return;
  }
  if (menuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

async function openMenu() {
  if (!game || !win) return;
  menuOpen = true;
  game.pause();
  await win.setIgnoreCursorEvents(false);

  showDragHandle();
  renderMenuButtons();

  // Click outside to close
  setTimeout(() => {
    document.addEventListener("click", onClickOutside);
  }, 50);
}

function renderMenuButtons() {
  if (!game) return;
  const centerX = game.catX + SPRITE_WIDTH / 2;
  const centerY = game.catY + SPRITE_HEIGHT / 2;
  const radius = 70;

  const menu = document.getElementById("radial-menu")!;
  menu.className = "radial-menu";
  menu.innerHTML = "";

  MENU_BUTTONS.forEach((btn, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
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

function updateMenuPositions() {
  if (!game || !menuOpen) return;
  const centerX = game.catX + SPRITE_WIDTH / 2;
  const centerY = game.catY + SPRITE_HEIGHT / 2;
  const radius = 70;

  const menu = document.getElementById("radial-menu")!;
  const buttons = menu.querySelectorAll<HTMLButtonElement>(".radial-btn");
  buttons.forEach((el, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    el.style.left = `${centerX + radius * Math.cos(angle)}px`;
    el.style.top = `${centerY + radius * Math.sin(angle)}px`;
  });

  // Update settings dialog position if open
  if (settingsOpen) {
    const dialog = document.getElementById("settings-dialog")!;
    dialog.style.left = `${centerX}px`;
    dialog.style.top = `${centerY}px`;
  }
}

function onClickOutside(e: MouseEvent) {
  if (dragging) return;
  const menu = document.getElementById("radial-menu");
  const settings = document.getElementById("settings-dialog");
  const handle = document.getElementById("drag-handle");
  if (menu && !menu.contains(e.target as Node) &&
      settings && !settings.contains(e.target as Node) &&
      handle && !handle.contains(e.target as Node)) {
    closeMenu();
  }
}

async function closeMenu() {
  if (!game || !win) return;
  menuOpen = false;
  settingsOpen = false;
  dragging = false;

  document.removeEventListener("click", onClickOutside);

  const menu = document.getElementById("radial-menu")!;
  menu.className = "radial-menu hidden";
  menu.innerHTML = "";

  const settings = document.getElementById("settings-dialog")!;
  settings.className = "settings-dialog hidden";
  settings.innerHTML = "";

  hideDragHandle();

  game.resume();
  await win.setIgnoreCursorEvents(true);
}

function handleMenuAction(id: string) {
  if (!game) return;
  if (id === "settings") {
    openSettings();
    return;
  }
  const action = id as CatAction;
  game.forceAction(action);
  closeMenu();
}

// -- Settings Dialog --
function openSettings() {
  if (!game) return;
  settingsOpen = true;

  const centerX = game.catX + SPRITE_WIDTH / 2;
  const centerY = game.catY + SPRITE_HEIGHT / 2;

  const dialog = document.getElementById("settings-dialog")!;
  dialog.className = "settings-dialog";
  dialog.style.left = `${centerX}px`;
  dialog.style.top = `${centerY}px`;

  const actionLabels: Record<CatAction, string> = {
    idle: "Idle",
    walk: "Walk",
    run: "Run",
    sleep: "Sleep",
    lick: "Lick fur",
    meow: "Meow",
  };

  dialog.innerHTML = `
    <div class="settings-card">
      <h3>Cat Activities</h3>
      <div class="settings-list">
        ${ALL_ACTIONS.map(action => `
          <label class="settings-toggle">
            <span>${actionLabels[action]}</span>
            <input type="checkbox" data-action="${action}"
              ${game!.enabledActions.has(action) ? "checked" : ""} />
            <span class="toggle-slider"></span>
          </label>
        `).join("")}
      </div>
      <p class="settings-hint">If all off, cat will sleep</p>
      <button class="settings-done">Done</button>
    </div>
  `;

  dialog.querySelectorAll<HTMLInputElement>("input[data-action]").forEach(input => {
    input.addEventListener("change", () => {
      const action = input.dataset.action as CatAction;
      if (input.checked) {
        game!.enabledActions.add(action);
      } else {
        game!.enabledActions.delete(action);
      }
    });
  });

  dialog.querySelector(".settings-done")!.addEventListener("click", () => {
    closeSettings();
  });
}

function closeSettings() {
  settingsOpen = false;
  const dialog = document.getElementById("settings-dialog")!;
  dialog.className = "settings-dialog hidden";
  dialog.innerHTML = "";
}

// -- Init --
document.addEventListener("DOMContentLoaded", () => {
  showWelcomeScreen();
});
