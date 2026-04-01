// Renders a price board (square panel) showing BTC and XAU hourly prices

import { SPRITE_WIDTH } from "../cat";
import type { HourlyPrice } from "../price";

function formatPrice(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function formatHour(h: number): string {
  return `${h.toString().padStart(2, "0")}:00`;
}

export function renderPriceBoard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
  prices: HourlyPrice[],
) {
  if (prices.length === 0) return;

  const bounce = Math.sin(now * 0.002) * 1;
  const rowH = 16;
  const headerH = 20;
  const padX = 8;
  const padY = 6;
  const colW = [40, 62, 52]; // hour, BTC, XAU columns
  const boardW = colW[0] + colW[1] + colW[2] + padX * 2;
  const boardH = headerH + prices.length * rowH + padY * 2;

  const bx = x + SPRITE_WIDTH / 2 - boardW / 2 + 15;
  const by = y - boardH - 14 + bounce;

  // Board background
  ctx.fillStyle = "rgba(30, 30, 42, 0.92)";
  ctx.beginPath();
  ctx.roundRect(bx, by, boardW, boardH, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 190, 60, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tail
  const tailX = bx + boardW / 2;
  ctx.fillStyle = "rgba(30, 30, 42, 0.92)";
  ctx.beginPath();
  ctx.moveTo(tailX - 5, by + boardH);
  ctx.lineTo(tailX, by + boardH + 5);
  ctx.lineTo(tailX + 5, by + boardH);
  ctx.fill();

  // Header
  ctx.font = "bold 10px monospace";
  const headerY = by + padY + 12;
  const col0 = bx + padX;
  const col1 = col0 + colW[0];
  const col2 = col1 + colW[1];

  ctx.fillStyle = "rgba(255, 190, 60, 0.7)";
  ctx.fillText("Hour", col0, headerY);
  ctx.fillStyle = "#f7931a"; // BTC orange
  ctx.fillText("BTC", col1, headerY);
  ctx.fillStyle = "#ffd700"; // Gold
  ctx.fillText("XAU", col2, headerY);

  // Separator line
  const sepY = by + padY + headerH - 3;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bx + padX, sepY);
  ctx.lineTo(bx + boardW - padX, sepY);
  ctx.stroke();

  // Rows
  ctx.font = "10px monospace";
  for (let i = 0; i < prices.length; i++) {
    const rowY = by + padY + headerH + i * rowH + 10;
    const p = prices[i];
    const isLast = i === prices.length - 1;

    // Current hour row highlight
    if (isLast) {
      ctx.fillStyle = "rgba(255, 190, 60, 0.08)";
      ctx.fillRect(bx + 2, rowY - 11, boardW - 4, rowH);
    }

    ctx.fillStyle = isLast ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)";
    ctx.fillText(formatHour(p.hour), col0, rowY);

    ctx.fillStyle = isLast ? "#f7931a" : "rgba(247,147,26,0.6)";
    ctx.fillText(formatPrice(p.btc), col1, rowY);

    ctx.fillStyle = isLast ? "#ffd700" : "rgba(255,215,0,0.6)";
    ctx.fillText(formatPrice(p.xau), col2, rowY);
  }
}
