// Shared application state

import type { CatGame } from "./game";

export const state = {
  game: null as CatGame | null,
  menuOpen: false,
  settingsOpen: false,
  dragging: false,
  dragOffsetX: 0,
  dragOffsetY: 0,
  win: null as ReturnType<typeof import("@tauri-apps/api/window").getCurrentWindow> | null,
  cursorOverCat: false,
  scaleFactor: 1,
  pomodoroActive: false,
};
