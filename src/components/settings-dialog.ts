// Settings dialog for cat name, gender, and activity toggles

import { check } from "@tauri-apps/plugin-updater";
import { state } from "../state";
import { ALL_ACTIONS, type CatGender } from "../game";
import { ANIMATIONS, renderFrame, type CatAction, type CatColor } from "../cat";
import { saveSettings, getPomodoroSettings, savePomodoroSettings } from "../main";

export function openSettings() {
  if (!state.game) return;
  state.settingsOpen = true;

  const dialog = document.getElementById("settings-dialog")!;
  dialog.className = "settings-overlay";

  const actionLabels: Record<CatAction, string> = {
    idle: "Idle",
    walk: "Walk",
    run: "Run",
    sleep: "Sleep",
    eat: "Eat",
    meow: "Meow",
    vocab: "Vocab",
  };

  const currentGender = state.game.catGender;
  const currentColor = state.game.catColor;
  const pomoSettings = getPomodoroSettings();

  dialog.innerHTML = `
    <div class="settings-backdrop"></div>
    <div class="settings-card">
      <h3>Cat Settings</h3>

      <div class="settings-grid">
        <div class="settings-col">
          <div class="settings-section">
            <label class="settings-field">
              <span>Name</span>
              <input type="text" id="settings-name" value="${state.game.name}" maxlength="16" />
            </label>
          </div>

          <div class="settings-section">
            <span class="settings-label">Gender</span>
            <div class="gender-select">
              <label class="gender-option">
                <input type="radio" name="settings-gender" value="male" ${currentGender === "male" ? "checked" : ""} />
                <span class="gender-chip male">\u2642 Male</span>
              </label>
              <label class="gender-option">
                <input type="radio" name="settings-gender" value="female" ${currentGender === "female" ? "checked" : ""} />
                <span class="gender-chip female">\u2640 Female</span>
              </label>
              <label class="gender-option">
                <input type="radio" name="settings-gender" value="neutered" ${currentGender === "neutered" ? "checked" : ""} />
                <span class="gender-chip neutered">\u26B2 Neutered</span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <span class="settings-label">Color</span>
            <div class="color-select">
              ${(["orange", "white", "black"] as CatColor[]).map((color) => `
                <label class="color-option">
                  <input type="radio" name="settings-color" value="${color}" ${currentColor === color ? "checked" : ""} />
                  <span class="color-chip">
                    <canvas class="color-preview" data-color="${color}" width="84" height="84"></canvas>
                    <span class="color-name">${color.charAt(0).toUpperCase() + color.slice(1)}</span>
                  </span>
                </label>
              `).join("")}
            </div>
          </div>
        </div>

        <div class="settings-col">
          <div class="settings-section">
            <span class="settings-label">Activities</span>
            <div class="settings-list">
              ${ALL_ACTIONS.map(
                (action) => `
                <label class="settings-toggle">
                  <span>${actionLabels[action]}</span>
                  <input type="checkbox" data-action="${action}"
                    ${state.game!.enabledActions.has(action) ? "checked" : ""} />
                  <span class="toggle-slider"></span>
                </label>
              `,
              ).join("")}
            </div>
            <p class="settings-hint">If all off, cat will sleep</p>
          </div>

          <div class="settings-section">
            <span class="settings-label">Focus Timer</span>
            <label class="settings-toggle">
              <span>Pomodoro (25/5)</span>
              <input type="checkbox" id="pomo-enabled" ${pomoSettings.enabled ? "checked" : ""} />
              <span class="toggle-slider"></span>
            </label>
            <label class="settings-toggle">
              <span>Sound</span>
              <input type="checkbox" id="pomo-sound" ${pomoSettings.soundEnabled ? "checked" : ""} />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <button class="settings-done">Done</button>
      <button class="settings-update" id="check-update">Check for Updates</button>
    </div>
  `;

  // Name change
  const nameInput = dialog.querySelector<HTMLInputElement>("#settings-name")!;
  nameInput.addEventListener("input", () => {
    const name = nameInput.value.trim();
    if (name && state.game) {
      state.game.setName(name);
      saveSettings();
    }
  });

  // Gender change
  dialog
    .querySelectorAll<HTMLInputElement>('input[name="settings-gender"]')
    .forEach((radio) => {
      radio.addEventListener("change", () => {
        if (state.game) {
          state.game.setGender(radio.value as CatGender);
          saveSettings();
        }
      });
    });

  // Color previews
  dialog.querySelectorAll<HTMLCanvasElement>(".color-preview").forEach((canvas) => {
    const color = canvas.dataset.color as CatColor;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 84, 84);
    renderFrame(ctx, ANIMATIONS.idle[0], 0, 12, false, color);
  });

  // Color change
  dialog
    .querySelectorAll<HTMLInputElement>('input[name="settings-color"]')
    .forEach((radio) => {
      radio.addEventListener("change", () => {
        if (state.game) {
          state.game.setColor(radio.value as CatColor);
          saveSettings();
        }
      });
    });

  // Activity toggles
  dialog
    .querySelectorAll<HTMLInputElement>("input[data-action]")
    .forEach((input) => {
      input.addEventListener("change", () => {
        const action = input.dataset.action as CatAction;
        if (input.checked) {
          state.game!.enabledActions.add(action);
        } else {
          state.game!.enabledActions.delete(action);
        }
        saveSettings();
      });
    });

  // Pomodoro toggle
  const pomoToggle = dialog.querySelector<HTMLInputElement>("#pomo-enabled");
  if (pomoToggle) {
    pomoToggle.addEventListener("change", () => {
      if (!state.game) return;
      savePomodoroSettings({ enabled: pomoToggle.checked });
      if (pomoToggle.checked) {
        if (!state.game.pomodoroTimer?.isActive) {
          state.game.togglePomodoro(getPomodoroSettings());
          state.pomodoroActive = true;
        }
      } else {
        if (state.game.pomodoroTimer?.isActive) {
          state.game.togglePomodoro();
          state.pomodoroActive = false;
        }
      }
    });
  }

  // Sound toggle
  const soundToggle = dialog.querySelector<HTMLInputElement>("#pomo-sound");
  if (soundToggle) {
    soundToggle.addEventListener("change", () => {
      savePomodoroSettings({ soundEnabled: soundToggle.checked });
    });
  }

  // Click backdrop to close
  dialog.querySelector(".settings-backdrop")!.addEventListener("click", () => {
    closeSettings();
  });

  dialog.querySelector(".settings-done")!.addEventListener("click", () => {
    closeSettings();
  });

  // Check for updates
  const updateBtn = dialog.querySelector<HTMLButtonElement>("#check-update")!;
  updateBtn.addEventListener("click", async () => {
    updateBtn.disabled = true;
    updateBtn.textContent = "Checking...";
    try {
      const update = await check();
      if (update) {
        updateBtn.textContent = `Updating to v${update.version}...`;
        await update.downloadAndInstall((e) => {
          if (e.event === "Started" && e.data.contentLength) {
            updateBtn.textContent = `Downloading...`;
          }
        });
        updateBtn.textContent = "Restart to apply";
      } else {
        updateBtn.textContent = "Up to date!";
        setTimeout(() => { updateBtn.textContent = "Check for Updates"; updateBtn.disabled = false; }, 2000);
      }
    } catch {
      updateBtn.textContent = "Update failed";
      setTimeout(() => { updateBtn.textContent = "Check for Updates"; updateBtn.disabled = false; }, 2000);
    }
  });
}

export function closeSettings() {
  state.settingsOpen = false;
  const dialog = document.getElementById("settings-dialog")!;
  dialog.className = "settings-dialog hidden";
  dialog.innerHTML = "";
}
