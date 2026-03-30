// Pixel art cat-v5 sprite renderer and animation config (orange pixel cat, side view, 28x20)

import { ANIMATIONS } from "./sprite-data";

export { ANIMATIONS };

const PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#000000",   // black outline
  2: "#ef6c00",   // dark orange
  3: "#fb8c00",   // medium orange
  4: "#ffa000",   // orange
  5: "#ffdeb1",   // cream (belly/face)
  6: "#482a00",   // dark brown
  7: "#4e342e",   // brown
  8: "#e84e40",   // red (mouth/tongue)
  9: "#f69988",   // pink (inner ear/nose)
  10: "#fbc02d",  // golden yellow
  11: "#ffd700",  // gold
  12: "#ffee58",  // light yellow
};

export type CatAction = "idle" | "walk" | "run" | "sleep" | "eat" | "meow" | "vocab";

// Animation speed per action (ms per frame)
export const FRAME_DURATION: Record<CatAction, number> = {
  idle:  500,
  walk:  180,
  run:   100,
  sleep: 800,
  eat:  250,
  meow:  200,
  vocab: 500,
};

// How long each action lasts (ms) before picking a new random one
export const ACTION_DURATION: Record<CatAction, [number, number]> = {
  idle:  [2000, 5000],
  walk:  [3000, 7000],
  run:   [2000, 4000],
  sleep: [5000, 10000],
  eat:  [3000, 6000],
  meow:  [1500, 3000],
  vocab: [4000, 7000],
};

// Movement speed per action (pixels per frame at 60fps)
export const MOVE_SPEED: Record<CatAction, number> = {
  idle:  0,
  walk:  1.5,
  run:   4,
  sleep: 0,
  eat:  0,
  meow:  0,
  vocab: 0,
};

const PIXEL_SIZE = 3;

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  frame: number[][],
  x: number,
  y: number,
  flipX: boolean = false
) {
  const size = PIXEL_SIZE;
  const width = frame[0].length;

  for (let row = 0; row < frame.length; row++) {
    for (let col = 0; col < width; col++) {
      const colorIndex = frame[row][col];
      if (colorIndex === 0) continue;

      const color = PALETTE[colorIndex];
      if (!color || color === "transparent") continue;

      ctx.fillStyle = color;
      const drawCol = flipX ? (width - 1 - col) : col;
      ctx.fillRect(
        x + drawCol * size,
        y + row * size,
        size,
        size
      );
    }
  }
}

export const SPRITE_WIDTH = 28 * PIXEL_SIZE;   // 84px
export const SPRITE_HEIGHT = 20 * PIXEL_SIZE;  // 60px
