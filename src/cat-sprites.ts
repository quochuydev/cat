// Pixel art cat sprite renderer and animation config

import { ANIMATIONS } from "./sprite-data";

export { ANIMATIONS };

const PALETTE: Record<number, string> = {
  0: "transparent",
  1: "#2b2b2b",   // outline / dark
  2: "#f4a83d",   // orange body
  3: "#fcd89d",   // cream belly / face
  4: "#f28b9e",   // pink (nose, inner ears, paws)
  5: "#ffffff",   // white (eyes)
  6: "#2b2b2b",   // pupils
  7: "#d4822a",   // dark orange stripes
  8: "#f4a83d",   // tail (same as body)
};

export type CatAction = "idle" | "walk" | "run" | "sleep" | "lick" | "meow";

// Animation speed per action (ms per frame)
export const FRAME_DURATION: Record<CatAction, number> = {
  idle:  500,
  walk:  200,
  run:   120,
  sleep: 800,
  lick:  300,
  meow:  250,
};

// How long each action lasts (ms) before picking a new random one
export const ACTION_DURATION: Record<CatAction, [number, number]> = {
  idle:  [2000, 5000],
  walk:  [3000, 7000],
  run:   [2000, 4000],
  sleep: [5000, 10000],
  lick:  [3000, 6000],
  meow:  [1500, 3000],
};

// Movement speed per action (pixels per frame at 60fps)
export const MOVE_SPEED: Record<CatAction, number> = {
  idle:  0,
  walk:  1.5,
  run:   4,
  sleep: 0,
  lick:  0,
  meow:  0,
};

const PIXEL_SIZE = 4;

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

export const SPRITE_WIDTH = 16 * PIXEL_SIZE;  // 64px
export const SPRITE_HEIGHT = 16 * PIXEL_SIZE; // 64px
