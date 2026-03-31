// Pomodoro timer state machine — simple 25/5 cycle

export type PomodoroPhase = "idle" | "work" | "break";

export interface PomodoroSettings {
  enabled: boolean;
  workMin: number;
  breakMin: number;
  soundEnabled: boolean;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  enabled: false,
  workMin: 25,
  breakMin: 5,
  soundEnabled: true,
};

export class PomodoroTimer {
  phase: PomodoroPhase = "idle";
  private timeRemainingMs: number = 0;
  settings: PomodoroSettings;
  private paused: boolean = false;

  onPhaseChange: ((phase: PomodoroPhase) => void) | null = null;

  constructor(settings?: Partial<PomodoroSettings>) {
    this.settings = { ...DEFAULT_POMODORO_SETTINGS, ...settings };
  }

  start() {
    this.beginWork();
  }

  stop() {
    this.phase = "idle";
    this.timeRemainingMs = 0;
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  get isPaused() {
    return this.paused;
  }

  get isActive() {
    return this.phase !== "idle";
  }

  tick(deltaMs: number) {
    if (this.phase === "idle" || this.paused) return;

    this.timeRemainingMs -= deltaMs;
    if (this.timeRemainingMs <= 0) {
      this.advancePhase();
    }
  }

  getProgress(): number {
    if (this.phase === "idle") return 0;
    const total = this.getPhaseDurationMs();
    if (total === 0) return 0;
    return Math.max(0, Math.min(1, this.timeRemainingMs / total));
  }

  getTimeString(): string {
    const totalSec = Math.max(0, Math.ceil(this.timeRemainingMs / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  private getPhaseDurationMs(): number {
    switch (this.phase) {
      case "work":
        return this.settings.workMin * 60 * 1000;
      case "break":
        return this.settings.breakMin * 60 * 1000;
      default:
        return 0;
    }
  }

  private beginWork() {
    this.phase = "work";
    this.timeRemainingMs = this.settings.workMin * 60 * 1000;
    this.paused = false;
    this.onPhaseChange?.("work");
  }

  private beginBreak() {
    this.phase = "break";
    this.timeRemainingMs = this.settings.breakMin * 60 * 1000;
    this.paused = false;
    this.onPhaseChange?.("break");
  }

  private advancePhase() {
    if (this.phase === "work") {
      this.beginBreak();
    } else {
      this.beginWork();
    }
  }
}
