import {
  ANIMATIONS,
  FRAME_DURATION,
  ACTION_DURATION,
  MOVE_SPEED,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  renderFrame,
  type CatAction,
  type CatColor,
} from "./cat";
import meowSound from "./assets/sounds/meow.wav";
import enWords from "./assets/words/en.json";
import viWords from "./assets/words/vi.json";

export const ALL_ACTIONS: CatAction[] = [
  "idle",
  "walk",
  "run",
  "sleep",
  "eat",
  "meow",
  "vocab",
];
export type CatGender = "male" | "female" | "neutered";

const meowAudio = new Audio(meowSound);

export class CatGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private catName: string;
  private gender: CatGender;
  private color: CatColor;

  // Cat position (free roam)
  private x: number = 0;
  private y: number = 0;
  private dirX: number = 1;
  private dirY: number = 0;

  // Animation state
  private action: CatAction = "idle";
  private facingLeft: boolean = false;
  private currentFrame: number = 0;
  private lastFrameTime: number = 0;
  private actionEndTime: number = 0;

  // Zzz animation
  private zzzPhase: number = 0;

  // Vocab bubble
  private vocabEn: string = "";
  private vocabVi: string = "";

  // Screen bounds
  private screenWidth: number;
  private screenHeight: number;

  // Pause state
  private paused: boolean = false;

  // Activity toggles (all enabled by default)
  enabledActions: Set<CatAction> = new Set(ALL_ACTIONS);

  private animationId: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    catName: string,
    gender: CatGender,
    screenWidth: number,
    screenHeight: number,
    color: CatColor = "orange",
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.catName = catName;
    this.gender = gender;
    this.color = color;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.x = Math.random() * (screenWidth - SPRITE_WIDTH);
    this.y = Math.random() * (screenHeight - SPRITE_HEIGHT - 20);

    this.ctx.imageSmoothingEnabled = false;
  }

  get catX() {
    return this.x;
  }
  get catY() {
    return this.y;
  }
  get isPaused() {
    return this.paused;
  }
  get name() {
    return this.catName;
  }
  get catGender() {
    return this.gender;
  }
  get catColor() {
    return this.color;
  }

  setName(name: string) {
    this.catName = name;
  }
  setGender(gender: CatGender) {
    this.gender = gender;
  }
  setColor(color: CatColor) {
    this.color = color;
  }

  start() {
    this.pickRandomAction();
    this.lastFrameTime = performance.now();
    this.loop(performance.now());
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  pause() {
    this.paused = true;
    this.action = "idle";
    this.currentFrame = 0;
  }

  resume() {
    this.paused = false;
    this.pickRandomAction();
  }

  forceAction(action: CatAction) {
    this.paused = false;
    this.action = action;
    this.currentFrame = 0;
    if (action === "meow") {
      meowAudio.currentTime = 0;
      meowAudio.play().catch(() => {});
    }
    if (action === "vocab") {
      this.pickRandomWord();
    }
    if (action === "walk" || action === "run") {
      const angle = Math.random() * Math.PI * 2;
      this.dirX = Math.cos(angle);
      this.dirY = Math.sin(angle);
      this.facingLeft = this.dirX < 0;
    }
    const [min, max] = ACTION_DURATION[action];
    this.actionEndTime = performance.now() + min + Math.random() * (max - min);
  }

  private pickRandomAction() {
    const available = ALL_ACTIONS.filter((a) => this.enabledActions.has(a));
    if (available.length === 0) {
      this.action = "sleep";
      return;
    }

    const baseWeights: Record<CatAction, number> = {
      idle: 20,
      walk: 30,
      run: 15,
      sleep: 15,
      eat: 10,
      meow: 10,
      vocab: 15,
    };
    const weights = available.map((a) => baseWeights[a]);
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    let chosen = available[0];
    for (let i = 0; i < available.length; i++) {
      rand -= weights[i];
      if (rand <= 0) {
        chosen = available[i];
        break;
      }
    }

    this.action = chosen;
    this.currentFrame = 0;

    if (chosen === "meow") {
      meowAudio.currentTime = 0;
      meowAudio.play().catch(() => {});
    }

    if (chosen === "vocab") {
      this.pickRandomWord();
    }

    if (chosen === "walk" || chosen === "run") {
      const angle = Math.random() * Math.PI * 2;
      this.dirX = Math.cos(angle);
      this.dirY = Math.sin(angle);
      this.facingLeft = this.dirX < 0;
    }

    const [min, max] = ACTION_DURATION[chosen];
    this.actionEndTime = performance.now() + min + Math.random() * (max - min);
  }

  private loop = (now: number) => {
    this.animationId = requestAnimationFrame(this.loop);

    if (!this.paused) {
      if (now >= this.actionEndTime) {
        this.pickRandomAction();
      }

      // Move cat freely in 2D
      const speed = MOVE_SPEED[this.action];
      if (speed > 0) {
        this.x += this.dirX * speed;
        this.y += this.dirY * speed;

        if (this.x <= 0) {
          this.x = 0;
          this.dirX = Math.abs(this.dirX);
          this.facingLeft = false;
        }
        if (this.x >= this.screenWidth - SPRITE_WIDTH) {
          this.x = this.screenWidth - SPRITE_WIDTH;
          this.dirX = -Math.abs(this.dirX);
          this.facingLeft = true;
        }
        if (this.y <= 0) {
          this.y = 0;
          this.dirY = Math.abs(this.dirY);
        }
        if (this.y >= this.screenHeight - SPRITE_HEIGHT - 20) {
          this.y = this.screenHeight - SPRITE_HEIGHT - 20;
          this.dirY = -Math.abs(this.dirY);
        }
      }
    }

    // Animate frames (keep animating even when paused for idle anim)
    const frameDur = FRAME_DURATION[this.action];
    if (now - this.lastFrameTime >= frameDur) {
      const frames = ANIMATIONS[this.action];
      this.currentFrame = (this.currentFrame + 1) % frames.length;
      this.lastFrameTime = now;
      this.zzzPhase += 0.3;
    }

    this.render(now);
  };

  private render(now: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const frames = ANIMATIONS[this.action];
    const frame = frames[this.currentFrame];

    // Shadow
    this.ctx.fillStyle = "rgba(0,0,0,0.12)";
    this.ctx.beginPath();
    this.ctx.ellipse(
      this.x + SPRITE_WIDTH / 2,
      this.y + SPRITE_HEIGHT - 2,
      SPRITE_WIDTH / 2.5,
      4,
      0,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();

    // Cat sprite
    renderFrame(this.ctx, frame, this.x, this.y, this.facingLeft, this.color);

    // Zzz for sleep
    if (this.action === "sleep") {
      const zOff = Math.sin(this.zzzPhase) * 3;
      this.ctx.fillStyle = `rgba(100,150,255,${0.5 + Math.sin(this.zzzPhase * 0.5) * 0.3})`;
      this.ctx.font = "bold 14px monospace";
      this.ctx.fillText("z", this.x + SPRITE_WIDTH + 2, this.y + 20 + zOff);
      this.ctx.font = "bold 18px monospace";
      this.ctx.fillText(
        "z",
        this.x + SPRITE_WIDTH + 10,
        this.y + 10 + zOff * 0.7,
      );
      this.ctx.font = "bold 22px monospace";
      this.ctx.fillText("Z", this.x + SPRITE_WIDTH + 20, this.y + zOff * 0.5);
    }

    // Meow bubble
    if (this.action === "meow") {
      const bounce = Math.sin(now * 0.01) * 2;
      this.ctx.font = "bold 13px monospace";
      this.ctx.fillStyle = "#ff6b9d";
      this.ctx.fillText(
        "meow~!",
        this.x + SPRITE_WIDTH / 2 - 20,
        this.y - 8 + bounce,
      );
    }

    // Vocab bubble
    if (this.action === "vocab" && this.vocabEn) {
      const bounce = Math.sin(now * 0.003) * 1.5;
      const text = `${this.vocabEn}: ${this.vocabVi}`;
      this.ctx.font = "12px sans-serif";
      const textWidth = this.ctx.measureText(text).width;

      const padX = 8;
      const padY = 5;
      const bubbleW = textWidth + padX * 2;
      const bubbleH = 14 + padY * 2;
      const bx = this.x + SPRITE_WIDTH / 2;
      const bubbleX = bx - bubbleW / 2;
      const bubbleY = this.y - bubbleH - 8 + bounce;

      // Bubble background
      this.ctx.fillStyle = "rgba(255,255,255,0.95)";
      this.ctx.beginPath();
      this.ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 8);
      this.ctx.fill();
      this.ctx.strokeStyle = "rgba(0,0,0,0.15)";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Tail triangle
      this.ctx.fillStyle = "rgba(255,255,255,0.95)";
      this.ctx.beginPath();
      this.ctx.moveTo(bx - 5, bubbleY + bubbleH);
      this.ctx.lineTo(bx, bubbleY + bubbleH + 5);
      this.ctx.lineTo(bx + 5, bubbleY + bubbleH);
      this.ctx.fill();

      // Text
      this.ctx.font = "12px sans-serif";
      this.ctx.fillStyle = "#000";
      this.ctx.fillText(text, bubbleX + padX, bubbleY + padY + 11);
    }

    // Name tag with gender icon
    const genderIcon =
      this.gender === "male"
        ? "\u2642"
        : this.gender === "female"
          ? "\u2640"
          : "\u26B2";
    const label = `${this.catName} ${genderIcon}`;
    this.ctx.font = "bold 11px monospace";
    const labelWidth = this.ctx.measureText(label).width;
    const nameX = this.x + SPRITE_WIDTH / 2 - labelWidth / 2;
    const pillPad = 4;
    const px = nameX - pillPad - 2;
    const py = this.y + SPRITE_HEIGHT + 2;
    const pw = labelWidth + pillPad * 2 + 4;
    const ph = 16;
    this.ctx.fillStyle = "rgba(255,255,255,0.85)";
    this.ctx.beginPath();
    this.ctx.roundRect(px, py, pw, ph, 6);
    this.ctx.fill();
    this.ctx.fillStyle = "#444";
    this.ctx.fillText(this.catName, nameX, this.y + SPRITE_HEIGHT + 14);
    const genderColor =
      this.gender === "male"
        ? "#4a90d9"
        : this.gender === "female"
          ? "#e75480"
          : "#888";
    this.ctx.fillStyle = genderColor;
    this.ctx.fillText(
      ` ${genderIcon}`,
      nameX + this.ctx.measureText(this.catName).width,
      this.y + SPRITE_HEIGHT + 14,
    );
  }

  setPosition(x: number, y: number) {
    this.x = Math.max(0, Math.min(x, this.screenWidth - SPRITE_WIDTH));
    this.y = Math.max(0, Math.min(y, this.screenHeight - SPRITE_HEIGHT - 20));
  }

  updateScreenSize(w: number, h: number) {
    this.screenWidth = w;
    this.screenHeight = h;
  }

  private pickRandomWord() {
    const idx = Math.floor(Math.random() * enWords.length);
    this.vocabEn = enWords[idx];
    this.vocabVi = viWords[idx];
  }
}
