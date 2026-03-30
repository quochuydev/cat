// Settings dialog for cat name, gender, and activity toggles

import { state } from "../state";
import { ALL_ACTIONS, type CatGender } from "../game";
import { type CatAction } from "../cat-sprites";

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
    lick: "Lick fur",
    meow: "Meow",
    vocab: "Vocab",
  };

  const currentGender = state.game.catGender;

  dialog.innerHTML = `
    <div class="settings-backdrop"></div>
    <div class="settings-card">
      <h3>Cat Settings</h3>

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
        <span class="settings-label">Activities</span>
        <div class="settings-list">
          ${ALL_ACTIONS.map(action => `
            <label class="settings-toggle">
              <span>${actionLabels[action]}</span>
              <input type="checkbox" data-action="${action}"
                ${state.game!.enabledActions.has(action) ? "checked" : ""} />
              <span class="toggle-slider"></span>
            </label>
          `).join("")}
        </div>
        <p class="settings-hint">If all off, cat will sleep</p>
      </div>

      <button class="settings-done">Done</button>
    </div>
  `;

  // Name change
  const nameInput = dialog.querySelector<HTMLInputElement>("#settings-name")!;
  nameInput.addEventListener("input", () => {
    const name = nameInput.value.trim();
    if (name && state.game) {
      state.game.setName(name);
    }
  });

  // Gender change
  dialog.querySelectorAll<HTMLInputElement>('input[name="settings-gender"]').forEach(radio => {
    radio.addEventListener("change", () => {
      if (state.game) {
        state.game.setGender(radio.value as CatGender);
      }
    });
  });

  // Activity toggles
  dialog.querySelectorAll<HTMLInputElement>("input[data-action]").forEach(input => {
    input.addEventListener("change", () => {
      const action = input.dataset.action as CatAction;
      if (input.checked) {
        state.game!.enabledActions.add(action);
      } else {
        state.game!.enabledActions.delete(action);
      }
    });
  });

  // Click backdrop to close
  dialog.querySelector(".settings-backdrop")!.addEventListener("click", () => {
    closeSettings();
  });

  dialog.querySelector(".settings-done")!.addEventListener("click", () => {
    closeSettings();
  });
}

export function closeSettings() {
  state.settingsOpen = false;
  const dialog = document.getElementById("settings-dialog")!;
  dialog.className = "settings-dialog hidden";
  dialog.innerHTML = "";
}
