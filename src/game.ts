import {
  ANIMATIONS,
  FRAME_DURATION,
  ACTION_DURATION,
  MOVE_SPEED,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  type CatAction,
  type CatColor,
} from "./cat";
import { PomodoroTimer, type PomodoroSettings } from "./pomodoro";
import { renderCatSprite, renderNameTag } from "./render/cat-renderer";
import {
  renderSleepZzz,
  renderMeowBubble,
  renderChatBubble,
} from "./render/bubble-renderer";
import { renderPriceBoard } from "./render/price-renderer";
import { fetchPrices, shouldRefresh, type HourlyPrice } from "./price";
import { listen } from "@tauri-apps/api/event";
import meowSound from "./assets/sounds/meow.wav";
import breakSound from "../docs/break.wav";
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
const breakAudio = new Audio(breakSound);

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

  // Screen bounds
  private screenWidth: number;
  private screenHeight: number;

  // Pause state
  private paused: boolean = false;

  // Activity toggles (all enabled by default)
  enabledActions: Set<CatAction> = new Set(ALL_ACTIONS);

  // Chat bubble
  private chatMessage: string = "";
  private chatExpireTime: number = 0;

  // Pomodoro
  pomodoroTimer: PomodoroTimer | null = null;
  private lastTickTime: number = 0;

  // Price board
  private priceData: HourlyPrice[] = [];
  showPriceBoard: boolean = false;
  private priceCheckTimer: number = 0;

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

  showChat(message: string, durationMs: number = 5000) {
    this.chatMessage = message;
    this.chatExpireTime = performance.now() + durationMs;
  }

  start() {
    this.pickRandomAction();
    this.lastFrameTime = performance.now();
    this.loop(performance.now());

    listen<{ message: string }>("chat-message", (event) => {
      this.showChat(event.payload.message);
    });

    // Initial price fetch
    this.refreshPrices();
  }

  private async refreshPrices() {
    this.priceData = await fetchPrices();
  }

  togglePriceBoard() {
    this.showPriceBoard = !this.showPriceBoard;
    if (this.showPriceBoard) {
      this.refreshPrices();
    }
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
      this.showRandomWord();
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
    let available = ALL_ACTIONS.filter((a) => this.enabledActions.has(a));
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
      this.showRandomWord();
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

    // Tick Pomodoro timer
    if (this.pomodoroTimer?.isActive && this.lastTickTime > 0) {
      this.pomodoroTimer.tick(now - this.lastTickTime);
    }
    this.lastTickTime = now;

    // Refresh prices every hour
    this.priceCheckTimer += 1;
    if (this.priceCheckTimer >= 3600 && this.showPriceBoard) {
      this.priceCheckTimer = 0;
      if (shouldRefresh()) {
        this.refreshPrices();
      }
    }

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

    renderCatSprite(this.ctx, this.action, this.currentFrame, this.x, this.y, this.facingLeft, this.color);

    if (this.action === "sleep") {
      renderSleepZzz(this.ctx, this.x, this.y, this.zzzPhase);
    }

    if (this.action === "meow") {
      renderMeowBubble(this.ctx, this.x, this.y, now);
    }

    if (this.chatMessage && now < this.chatExpireTime) {
      renderChatBubble(this.ctx, this.x, this.y, now, this.chatMessage, this.chatExpireTime);
    }

    if (this.showPriceBoard && this.priceData.length > 0) {
      renderPriceBoard(this.ctx, this.x, this.y, now, this.priceData);
    }

    renderNameTag(this.ctx, this.x, this.y, this.catName, this.gender, this.pomodoroTimer);
  }

  togglePomodoro(settings?: PomodoroSettings) {
    if (this.pomodoroTimer?.isActive) {
      this.pomodoroTimer.stop();
      this.pomodoroTimer = null;
      this.pickRandomAction();
    } else {
      this.pomodoroTimer = new PomodoroTimer(settings);
      this.pomodoroTimer.onPhaseChange = (phase) => {
        if (phase === "break") {
          if (this.pomodoroTimer?.settings.soundEnabled !== false) {
            breakAudio.currentTime = 0;
            breakAudio.play().catch(() => {});
          }
        }
      };
      this.pomodoroTimer.start();
      this.pickRandomAction();
    }
  }

  setPosition(x: number, y: number) {
    this.x = Math.max(0, Math.min(x, this.screenWidth - SPRITE_WIDTH));
    this.y = Math.max(0, Math.min(y, this.screenHeight - SPRITE_HEIGHT - 20));
  }

  updateScreenSize(w: number, h: number) {
    this.screenWidth = w;
    this.screenHeight = h;
  }

  private showRandomWord() {
    const idx = Math.floor(Math.random() * enWords.length);
    this.showChat(`${enWords[idx]}: ${viWords[idx]}`);
  }
}
