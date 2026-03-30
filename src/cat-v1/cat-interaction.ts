// Cat click detection via cursor polling

import { cursorPosition } from "@tauri-apps/api/window";
import { state } from "../state";
import { SPRITE_WIDTH, SPRITE_HEIGHT } from "./cat-sprites";
import { toggleMenu } from "../menu";

export function setupCatClickDetection() {
  const hitbox = document.getElementById("cat-hitbox")!;

  hitbox.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!state.menuOpen) {
      toggleMenu();
    }
  });

  // Poll cursor position to toggle ignore-cursor-events
  setInterval(async () => {
    if (!state.game || !state.win || state.menuOpen) return;
    try {
      const pos = await cursorPosition();
      // cursorPosition returns physical pixels, convert to logical
      const cx = pos.x / state.scaleFactor;
      const cy = pos.y / state.scaleFactor;
      const padding = 10;
      const overCat =
        cx >= state.game.catX - padding &&
        cx <= state.game.catX + SPRITE_WIDTH + padding &&
        cy >= state.game.catY - padding &&
        cy <= state.game.catY + SPRITE_HEIGHT + padding;

      if (overCat && !state.cursorOverCat) {
        state.cursorOverCat = true;
        await state.win.setIgnoreCursorEvents(false);
        updateCatHitbox();
        hitbox.style.display = "block";
      } else if (!overCat && state.cursorOverCat) {
        state.cursorOverCat = false;
        hitbox.style.display = "none";
        await state.win.setIgnoreCursorEvents(true);
      }

      if (state.cursorOverCat) {
        updateCatHitbox();
      }
    } catch (_) {
      // ignore polling errors
    }
  }, 80);
}

function updateCatHitbox() {
  if (!state.game) return;
  const hitbox = document.getElementById("cat-hitbox");
  if (!hitbox) return;
  hitbox.style.left = `${state.game.catX - 5}px`;
  hitbox.style.top = `${state.game.catY - 5}px`;
  hitbox.style.width = `${SPRITE_WIDTH + 10}px`;
  hitbox.style.height = `${SPRITE_HEIGHT + 10}px`;
}
