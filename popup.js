// ClearPath popup controller
// DEFAULT_WORD_LISTS is defined in wordlists.js, loaded before this script via popup.html

let currentSettings = {
  enabled: true,
  mode: "blur",
  wordLists: JSON.parse(JSON.stringify(DEFAULT_WORD_LISTS))
};

let dirty = false;

function markDirty() {
  dirty = true;
  document.getElementById("applyBtn").disabled = false;
}

// Load saved settings
chrome.storage.sync.get(["clearpathSettings"], (result) => {
  if (result.clearpathSettings) {
    currentSettings = {
      ...currentSettings,
      ...result.clearpathSettings
    };
    if (!result.clearpathSettings.wordLists) {
      currentSettings.wordLists = JSON.parse(JSON.stringify(DEFAULT_WORD_LISTS));
    }
  }
  renderUI();
});

function renderUI() {
  // Master toggle
  const masterToggle = document.getElementById("masterToggle");
  masterToggle.checked = currentSettings.enabled;
  updateStatusUI(currentSettings.enabled);

  masterToggle.addEventListener("change", () => {
    currentSettings.enabled = masterToggle.checked;
    updateStatusUI(currentSettings.enabled);
    markDirty();
  });

  // Mode buttons
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === currentSettings.mode);
    btn.addEventListener("click", () => {
      currentSettings.mode = btn.dataset.mode;
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      markDirty();
    });
  });

  // Categories
  renderCategories();

  // Apply button
  const applyBtn = document.getElementById("applyBtn");
  applyBtn.disabled = true;
  applyBtn.addEventListener("click", saveAndApply);
}

function updateStatusUI(enabled) {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  dot.classList.toggle("off", !enabled);
  text.textContent = enabled ? "Filtering active" : "Filtering paused";
}

function renderCategories() {
  const container = document.getElementById("categoryList");
  container.innerHTML = "";

  for (const [key, category] of Object.entries(currentSettings.wordLists)) {
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `
      <div>
        <div class="category-name">${category.label}</div>
        <div class="category-count">${category.words.length} terms</div>
      </div>
      <label class="toggle">
        <input type="checkbox" ${category.enabled ? "checked" : ""} data-category="${key}">
        <div class="toggle-track"></div>
        <div class="toggle-thumb"></div>
      </label>
    `;

    row.querySelector("input").addEventListener("change", (e) => {
      currentSettings.wordLists[key].enabled = e.target.checked;
      markDirty();
    });

    container.appendChild(row);
  }
}

function saveAndApply() {
  chrome.storage.sync.set({ clearpathSettings: currentSettings }, () => {
    dirty = false;
    document.getElementById("applyBtn").disabled = true;
    document.getElementById("reloadBanner").classList.add("visible");
  });
}

document.getElementById("reloadBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) chrome.tabs.reload(tabs[0].id);
  });
  window.close();
});
