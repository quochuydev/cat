// Drag handling for the cat

import { state } from "./state";
import { SPRITE_WIDTH, SPRITE_HEIGHT } from "./cat";
import { updateMenuPositions } from "./menu";

const HANDLE_WIDTH = 80;
const HANDLE_HEIGHT = 80;

export function setupDrag() {
  const handle = document.getElementById("drag-handle")!;

  handle.addEventListener("mousedown", (e) => {
    if (!state.game || !state.menuOpen) return;
    e.preventDefault();
    e.stopPropagation();
    state.dragging = true;
    state.dragOffsetX = e.clientX - state.game.catX;
    state.dragOffsetY = e.clientY - state.game.catY;
    handle.classList.add("dragging");
  });

  document.addEventListener("mousemove", (e) => {
    if (!state.dragging || !state.game) return;
    const newX = e.clientX - state.dragOffsetX;
    const newY = e.clientY - state.dragOffsetY;
    state.game.setPosition(newX, newY);
    updateMenuPositions();
    updateDragHandle();
  });

  document.addEventListener("mouseup", () => {
    if (!state.dragging) return;
    state.dragging = false;
    const handle = document.getElementById("drag-handle");
    if (handle) handle.classList.remove("dragging");
  });
}

export function updateDragHandle() {
  if (!state.game) return;
  const handle = document.getElementById("drag-handle");
  if (!handle || handle.classList.contains("hidden")) return;
  handle.style.left = `${state.game.catX + SPRITE_WIDTH / 2 - HANDLE_WIDTH / 2}px`;
  handle.style.top = `${state.game.catY + SPRITE_HEIGHT / 2 - HANDLE_HEIGHT / 2}px`;
}

export function showDragHandle() {
  if (!state.game) return;
  const handle = document.getElementById("drag-handle")!;
  handle.classList.remove("hidden");
  handle.style.left = `${state.game.catX + SPRITE_WIDTH / 2 - HANDLE_WIDTH / 2}px`;
  handle.style.top = `${state.game.catY + SPRITE_HEIGHT / 2 - HANDLE_HEIGHT / 2}px`;
}

export function hideDragHandle() {
  const handle = document.getElementById("drag-handle");
  if (handle) handle.classList.add("hidden");
}
