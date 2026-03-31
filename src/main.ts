import { getCurrentWindow } from "@tauri-apps/api/window";
import { availableMonitors } from "@tauri-apps/api/window";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import { CatGame, type CatGender } from "./game";
import { type CatAction, type CatColor } from "./cat";
import { DEFAULT_POMODORO_SETTINGS, type PomodoroSettings } from "./pomodoro";
import { state } from "./state";
import { showWelcomeScreen } from "./components/welcome-screen";
import { toggleMenu, closeMenu } from "./menu";
import { setupDrag } from "./drag";
import { setupCatClickDetection } from "./cat";
import "./styles.css";

interface SavedSettings {
  name: string;
  gender: CatGender;
  color: CatColor;
  enabledActions: string[];
  pomodoro?: PomodoroSettings;
}

export function saveSettings() {
  if (!state.game) return;
  const settings: SavedSettings = {
    name: state.game.name,
    gender: state.game.catGender,
    color: state.game.catColor,
    enabledActions: [...state.game.enabledActions],
  };
  localStorage.setItem("cat-settings", JSON.stringify(settings));
}

export function getPomodoroSettings(): PomodoroSettings {
  const saved = loadSettings();
  return { ...DEFAULT_POMODORO_SETTINGS, ...saved?.pomodoro };
}

export function savePomodoroSettings(partial: Partial<PomodoroSettings>) {
  const current = getPomodoroSettings();
  const updated = { ...current, ...partial };
  const raw = localStorage.getItem("cat-settings");
  const settings = raw ? JSON.parse(raw) : {};
  settings.pomodoro = updated;
  localStorage.setItem("cat-settings", JSON.stringify(settings));
  // Apply to active timer
  if (state.game?.pomodoroTimer) {
    Object.assign(state.game.pomodoroTimer.settings, updated);
  }
}

function loadSettings(): SavedSettings | null {
  try {
    const raw = localStorage.getItem("cat-settings");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function startGame(catName: string, gender: CatGender, color: CatColor = "orange") {
  state.win = getCurrentWindow();

  const monitors = await availableMonitors();
  const monitor = monitors[0];
  state.scaleFactor = monitor?.scaleFactor || 1;
  const screenWidth = monitor ? monitor.size.width / state.scaleFactor : 1440;
  const screenHeight = monitor ? monitor.size.height / state.scaleFactor : 900;

  await state.win.setDecorations(false);
  await state.win.setAlwaysOnTop(true);
  await state.win.setResizable(false);
  await state.win.setSize(new LogicalSize(screenWidth, screenHeight));
  await state.win.setPosition(new LogicalPosition(0, 0));
  await state.win.setIgnoreCursorEvents(true);

  const app = document.getElementById("app")!;
  app.innerHTML = `
    <canvas id="game-canvas"></canvas>
    <div id="cat-hitbox" class="cat-hitbox"></div>
    <div id="drag-handle" class="drag-handle hidden"></div>
    <div id="radial-menu" class="radial-menu hidden"></div>
    <div id="settings-dialog" class="settings-dialog hidden"></div>
  `;
  app.className = "game-mode";

  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  canvas.width = screenWidth;
  canvas.height = screenHeight;

  state.game = new CatGame(canvas, catName, gender, screenWidth, screenHeight, color);

  // Restore saved activity toggles
  const saved = loadSettings();
  if (saved?.enabledActions) {
    state.game.enabledActions = new Set(saved.enabledActions as CatAction[]);
  }

  state.game.start();

  // Restore pomodoro if it was enabled
  const pomoSettings = getPomodoroSettings();
  if (pomoSettings.enabled) {
    state.game.togglePomodoro(pomoSettings);
    state.pomodoroActive = true;
  }

  await listen("toggle-menu", () => toggleMenu());

  setupDrag();
  setupCatClickDetection();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.menuOpen) {
      closeMenu();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const saved = loadSettings();
  if (saved?.name) {
    // Skip welcome screen, use saved settings
    startGame(saved.name, saved.gender || "male", saved.color || "orange");
  } else {
    showWelcomeScreen((name, gender, color) => startGame(name, gender, color));
  }
});
