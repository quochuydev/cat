import { getCurrentWindow } from "@tauri-apps/api/window";
import { availableMonitors } from "@tauri-apps/api/window";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";
import { CatGame } from "./game";
import "./styles.css";

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
          <input
            type="text"
            id="cat-name"
            placeholder="Enter cat name..."
            maxlength="16"
            autofocus
            required
          />
          <button type="submit" id="start-btn">Start</button>
        </form>
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

// -- Game Mode: fullscreen transparent overlay --
async function startGame(catName: string) {
  const win = getCurrentWindow();

  const monitors = await availableMonitors();
  const monitor = monitors[0];
  const scaleFactor = monitor?.scaleFactor || 1;
  const screenWidth = monitor ? monitor.size.width / scaleFactor : 1440;
  const screenHeight = monitor ? monitor.size.height / scaleFactor : 900;

  // Transform to fullscreen transparent overlay
  await win.setDecorations(false);
  await win.setAlwaysOnTop(true);
  await win.setResizable(false);
  await win.setSize(new LogicalSize(screenWidth, screenHeight));
  await win.setPosition(new LogicalPosition(0, 0));
  // Click-through: let clicks pass to apps below
  await win.setIgnoreCursorEvents(true);

  // Set up fullscreen game canvas
  const app = document.getElementById("app")!;
  app.innerHTML = `<canvas id="game-canvas"></canvas>`;
  app.className = "game-mode";

  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  canvas.width = screenWidth;
  canvas.height = screenHeight;

  const game = new CatGame(canvas, catName, screenWidth, screenHeight);
  game.start();
}

// -- Init --
document.addEventListener("DOMContentLoaded", () => {
  showWelcomeScreen();
});
