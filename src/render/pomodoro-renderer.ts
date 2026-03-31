// Renders pomodoro pill badge below the name tag

import { SPRITE_WIDTH, SPRITE_HEIGHT } from "../cat";
import type { PomodoroTimer } from "../pomodoro";

export function renderPomodoroBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timer: PomodoroTimer,
) {
  const isWork = timer.phase === "work";
  const pillText = timer.getTimeString();
  const pillColor = isWork ? "#f4a83d" : "#10a37f";

  ctx.font = "bold 10px monospace";
  const pillTextW = ctx.measureText(pillText).width;
  const pillPadX = 8;
  const pillH = 18;
  const pillW = pillTextW + pillPadX * 2;
  const pillX = x + SPRITE_WIDTH / 2 - pillW / 2;
  const pillY = y + SPRITE_HEIGHT + 20;

  // Progress bar background
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 9);
  ctx.fill();
  ctx.strokeStyle = pillColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Progress fill
  const progress = timer.getProgress();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 9);
  ctx.clip();
  ctx.fillStyle = isWork
    ? "rgba(244,168,61,0.15)"
    : "rgba(16,163,127,0.15)";
  ctx.fillRect(pillX, pillY, pillW * progress, pillH);
  ctx.restore();

  // Text
  ctx.fillStyle = pillColor;
  ctx.fillText(pillText, pillX + pillPadX, pillY + 13);
}
