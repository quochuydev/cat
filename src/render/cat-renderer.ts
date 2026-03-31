// Renders cat sprite, shadow, and name tag

import {
  ANIMATIONS,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  renderFrame,
  type CatAction,
  type CatColor,
} from "../cat";
import type { CatGender } from "../game";
import type { PomodoroTimer } from "../pomodoro";

export function renderCatSprite(
  ctx: CanvasRenderingContext2D,
  action: CatAction,
  frame: number,
  x: number,
  y: number,
  facingLeft: boolean,
  color: CatColor,
) {
  const frames = ANIMATIONS[action];
  const frameData = frames[frame];

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(
    x + SPRITE_WIDTH / 2,
    y + SPRITE_HEIGHT - 2,
    SPRITE_WIDTH / 2.5,
    4,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Cat sprite
  renderFrame(ctx, frameData, x, y, facingLeft, color);
}

export function renderNameTag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  catName: string,
  gender: CatGender,
  pomodoroTimer?: PomodoroTimer | null,
) {
  const genderIcon =
    gender === "male" ? "\u2642" : gender === "female" ? "\u2640" : "\u26B2";
  const timerText = pomodoroTimer?.isActive ? ` ${pomodoroTimer.getTimeString()}` : "";
  const label = `${catName} ${genderIcon}${timerText}`;
  ctx.font = "bold 11px monospace";
  const labelWidth = ctx.measureText(label).width;
  const nameX = x + SPRITE_WIDTH / 2 - labelWidth / 2;
  const pillPad = 4;
  const px = nameX - pillPad - 2;
  const py = y + SPRITE_HEIGHT + 2;
  const pw = labelWidth + pillPad * 2 + 4;
  const ph = 16;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 6);
  ctx.fill();
  ctx.fillStyle = "#444";
  ctx.fillText(catName, nameX, y + SPRITE_HEIGHT + 14);
  const genderColor =
    gender === "male" ? "#4a90d9" : gender === "female" ? "#e75480" : "#888";
  ctx.fillStyle = genderColor;
  const genderText = ` ${genderIcon}`;
  ctx.fillText(
    genderText,
    nameX + ctx.measureText(catName).width,
    y + SPRITE_HEIGHT + 14,
  );
  if (pomodoroTimer?.isActive) {
    const isBreak = pomodoroTimer.phase === "break";
    ctx.fillStyle = isBreak ? "#e53e3e" : "#444";
    ctx.fillText(
      timerText,
      nameX + ctx.measureText(`${catName}${genderText}`).width,
      y + SPRITE_HEIGHT + 14,
    );
  }
}
