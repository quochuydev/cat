import { getCurrentWindow } from "@tauri-apps/api/window";
import { availableMonitors } from "@tauri-apps/api/window";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import { CatGame, type CatGender } from "./game";
import { state } from "./state";
import { showWelcomeScreen } from "./components/welcome-screen";
import { toggleMenu, closeMenu } from "./menu";
import { setupDrag } from "./drag";
import { setupCatClickDetection } from "./cat-v1/cat-interaction";
import "./styles.css";

async function startGame(catName: string, gender: CatGender) {
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

  state.game = new CatGame(canvas, catName, gender, screenWidth, screenHeight);
  state.game.start();

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
  showWelcomeScreen((name, gender) => startGame(name, gender));
});
