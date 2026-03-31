// Renders sleep Zzz, meow, chat, and vocab bubbles

import { SPRITE_WIDTH } from "../cat";

export function renderSleepZzz(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zzzPhase: number,
) {
  const zOff = Math.sin(zzzPhase) * 3;
  ctx.fillStyle = `rgba(100,150,255,${0.5 + Math.sin(zzzPhase * 0.5) * 0.3})`;
  ctx.font = "bold 14px monospace";
  ctx.fillText("z", x + SPRITE_WIDTH + 2, y + 20 + zOff);
  ctx.font = "bold 18px monospace";
  ctx.fillText("z", x + SPRITE_WIDTH + 10, y + 10 + zOff * 0.7);
  ctx.font = "bold 22px monospace";
  ctx.fillText("Z", x + SPRITE_WIDTH + 20, y + zOff * 0.5);
}

export function renderMeowBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
) {
  const bounce = Math.sin(now * 0.01) * 2;
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#ff6b9d";
  ctx.fillText("meow~!", x + SPRITE_WIDTH / 2 - 20, y - 8 + bounce);
}

export function renderChatBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
  message: string,
  expireTime: number,
) {
  const bounce = Math.sin(now * 0.003) * 1.5;
  ctx.font = "12px sans-serif";

  // Word wrap
  const maxWidth = 160;
  const words = message.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].slice(0, -3) + "...";
  }

  const lineHeight = 16;
  const padX = 10;
  const padY = 8;
  const textWidths = lines.map((l) => ctx.measureText(l).width);
  const bubbleW = Math.max(...textWidths) + padX * 2;
  const bubbleH = lines.length * lineHeight + padY * 2;
  const bx = x + SPRITE_WIDTH / 2 + 15;
  const bubbleX = bx - bubbleW / 2;
  const bubbleY = y - bubbleH - 10 + bounce;

  // Fade out in last 500ms
  const remaining = expireTime - now;
  const alpha = remaining < 500 ? remaining / 500 : 1;
  ctx.globalAlpha = alpha;

  // Bubble background
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(244,168,61,0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tail triangle
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.moveTo(bx - 5, bubbleY + bubbleH);
  ctx.lineTo(bx, bubbleY + bubbleH + 6);
  ctx.lineTo(bx + 5, bubbleY + bubbleH);
  ctx.fill();

  // Text
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#5a3825";
  lines.forEach((line, i) => {
    ctx.fillText(line, bubbleX + padX, bubbleY + padY + 12 + i * lineHeight);
  });

  ctx.globalAlpha = 1;
}
