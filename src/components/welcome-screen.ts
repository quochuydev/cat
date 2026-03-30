// Welcome screen UI and preview animation

import type { CatGender } from "../game";
import { ANIMATIONS, renderFrame } from "../cat-v1/cat-sprites";

const CAT_NAMES = [
  "Milo",
  "Luna",
  "Simba",
  "Nala",
  "Oliver",
  "Cleo",
  "Leo",
  "Bella",
  "Charlie",
  "Willow",
  "Max",
  "Coco",
  "Jasper",
  "Daisy",
  "Felix",
  "Loki",
  "Oscar",
  "Pepper",
  "Ginger",
  "Shadow",
  "Mochi",
  "Biscuit",
  "Pumpkin",
  "Whiskers",
  "Mittens",
  "Oreo",
  "Tofu",
  "Nacho",
  "Waffles",
  "Nugget",
];

function randomCatName(): string {
  return CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)];
}

export function showWelcomeScreen(
  onStart: (name: string, gender: CatGender) => void,
) {
  const name = randomCatName();
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <div class="welcome">
      <div class="welcome-card">
        <div class="welcome-cat-preview">
          <canvas id="preview-canvas" width="64" height="64"></canvas>
        </div>
        <h1>Name Your Cat</h1>
        <form id="name-form">
          <input type="text" id="cat-name" placeholder="Enter cat name..." maxlength="16" autofocus required value="${name}" />
          <div class="gender-select">
            <label class="gender-option">
              <input type="radio" name="gender" value="male" checked />
              <span class="gender-chip male">\u2642 Male</span>
            </label>
            <label class="gender-option">
              <input type="radio" name="gender" value="female" />
              <span class="gender-chip female">\u2640 Female</span>
            </label>
            <label class="gender-option">
              <input type="radio" name="gender" value="neutered" />
              <span class="gender-chip neutered">\u26B2 Neutered</span>
            </label>
          </div>
          <button type="submit" id="start-btn">Start</button>
        </form>
        <p class="hint">Click the cat or press <kbd>Cmd+Shift+S</kbd> to open menu</p>
      </div>
    </div>
  `;
  animatePreview();

  const form = document.getElementById("name-form") as HTMLFormElement;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("cat-name") as HTMLInputElement;
    const name = input.value.trim();
    if (!name) return;
    const gender = (document.querySelector<HTMLInputElement>(
      'input[name="gender"]:checked',
    )?.value || "male") as CatGender;
    onStart(name, gender);
  });
}

function animatePreview() {
  const canvas = document.getElementById(
    "preview-canvas",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const frames = ANIMATIONS.idle;
  let frame = 0;
  const draw = () => {
    ctx.clearRect(0, 0, 64, 64);
    renderFrame(ctx, frames[frame], 0, 0, false);
    frame = (frame + 1) % frames.length;
  };
  draw();
  setInterval(draw, 500);
}
