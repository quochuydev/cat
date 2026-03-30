import {
  ANIMATIONS,
  FRAME_DURATION,
  ACTION_DURATION,
  MOVE_SPEED,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  renderFrame,
  type CatAction,
} from "./cat-sprites";

export class CatGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private catName: string;

  // Cat position (free roam)
  private x: number = 0;
  private y: number = 0;
  private dirX: number = 1;  // horizontal direction: 1 or -1
  private dirY: number = 0;  // vertical component for diagonal movement

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

  private animationId: number = 0;

  constructor(canvas: HTMLCanvasElement, catName: string, screenWidth: number, screenHeight: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.catName = catName;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // Start at random position
    this.x = Math.random() * (screenWidth - SPRITE_WIDTH);
    this.y = Math.random() * (screenHeight - SPRITE_HEIGHT - 20);

    this.ctx.imageSmoothingEnabled = false;
  }

  start() {
    this.pickRandomAction();
    this.lastFrameTime = performance.now();
    this.loop(performance.now());
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private pickRandomAction() {
    const actions: CatAction[] = ["idle", "walk", "run", "sleep", "lick", "meow"];
    const weights = [20, 30, 15, 15, 10, 10];
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    let chosen: CatAction = "idle";
    for (let i = 0; i < actions.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { chosen = actions[i]; break; }
    }

    this.action = chosen;
    this.currentFrame = 0;

    // Pick random direction for movement actions
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

    if (now >= this.actionEndTime) {
      this.pickRandomAction();
    }

    // Animate frames
    const frameDur = FRAME_DURATION[this.action];
    if (now - this.lastFrameTime >= frameDur) {
      const frames = ANIMATIONS[this.action];
      this.currentFrame = (this.currentFrame + 1) % frames.length;
      this.lastFrameTime = now;
      this.zzzPhase += 0.3;
    }

    // Move cat freely in 2D
    const speed = MOVE_SPEED[this.action];
    if (speed > 0) {
      this.x += this.dirX * speed;
      this.y += this.dirY * speed;

      // Bounce off screen edges
      if (this.x <= 0) { this.x = 0; this.dirX = Math.abs(this.dirX); this.facingLeft = false; }
      if (this.x >= this.screenWidth - SPRITE_WIDTH) { this.x = this.screenWidth - SPRITE_WIDTH; this.dirX = -Math.abs(this.dirX); this.facingLeft = true; }
      if (this.y <= 0) { this.y = 0; this.dirY = Math.abs(this.dirY); }
      if (this.y >= this.screenHeight - SPRITE_HEIGHT - 20) { this.y = this.screenHeight - SPRITE_HEIGHT - 20; this.dirY = -Math.abs(this.dirY); }
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
      0, 0, Math.PI * 2
    );
    this.ctx.fill();

    // Cat sprite
    renderFrame(this.ctx, frame, this.x, this.y, this.facingLeft);

    // Zzz for sleep
    if (this.action === "sleep") {
      const zOff = Math.sin(this.zzzPhase) * 3;
      this.ctx.fillStyle = `rgba(100,150,255,${0.5 + Math.sin(this.zzzPhase * 0.5) * 0.3})`;
      this.ctx.font = "bold 14px monospace";
      this.ctx.fillText("z", this.x + SPRITE_WIDTH + 2, this.y + 20 + zOff);
      this.ctx.font = "bold 18px monospace";
      this.ctx.fillText("z", this.x + SPRITE_WIDTH + 10, this.y + 10 + zOff * 0.7);
      this.ctx.font = "bold 22px monospace";
      this.ctx.fillText("Z", this.x + SPRITE_WIDTH + 20, this.y + zOff * 0.5);
    }

    // Meow bubble
    if (this.action === "meow") {
      const bounce = Math.sin(now * 0.01) * 2;
      this.ctx.font = "bold 13px monospace";
      this.ctx.fillStyle = "#ff6b9d";
      this.ctx.fillText("meow~!", this.x + SPRITE_WIDTH / 2 - 20, this.y - 8 + bounce);
    }

    // Name tag
    this.ctx.font = "bold 11px monospace";
    const nameWidth = this.ctx.measureText(this.catName).width;
    const nameX = this.x + SPRITE_WIDTH / 2 - nameWidth / 2;
    const pillPad = 4;
    const px = nameX - pillPad - 2;
    const py = this.y + SPRITE_HEIGHT + 2;
    const pw = nameWidth + pillPad * 2 + 4;
    const ph = 16;
    this.ctx.fillStyle = "rgba(255,255,255,0.85)";
    this.ctx.beginPath();
    this.ctx.roundRect(px, py, pw, ph, 6);
    this.ctx.fill();
    this.ctx.fillStyle = "#444";
    this.ctx.fillText(this.catName, nameX, this.y + SPRITE_HEIGHT + 14);
  }

  updateScreenSize(w: number, h: number) {
    this.screenWidth = w;
    this.screenHeight = h;
  }
}
