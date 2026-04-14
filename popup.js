// ClearPath popup controller

const DEFAULT_WORD_LISTS = {
  alcohol: {
    label: "Alcohol",
    enabled: true,
    words: [
      "alcohol","alcoholic","alcoholism","beer","lager","ale","craft beer","brew","brewery","brewpub",
      "wine", "wines", "winery", "wineries", "vineyard", "vineyards",
      "champagne", "prosecco", "rosé", "rose wine", "pinot", "merlot", "cabernet", "chardonnay",
      "sauvignon", "riesling", "zinfandel", "syrah", "shiraz", "grenache",
      "spirits", "liquor", "liqueur", "liqueurs",
      "whiskey", "whisky", "bourbon", "scotch", "rye whiskey",
      "vodka", "gin", "rum", "tequila", "mezcal", "brandy", "cognac",
      "cocktail", "cocktails", "mocktail", "martini", "margarita", "mimosa", "bloody mary", "daiquiri",
      "bartender", "mixologist", "happy hour", "last call",
      "drunk", "buzzed", "tipsy", "wasted", "hammered", "sober curious",
      "drinking", "booze", "boozy", "intoxicated",
      "shot glass", "nightcap", "chaser",
      "keg", "six-pack", "six pack",
      "wine tasting", "wine review", "wine pairing", "beer garden", "taproom", "distillery",
      "beer", "beers", "lager", "ale", "ales", "craft beer", "brew", "brews", "brewery", "breweries", "brewpub"
    ]
  },
  drugs: {
    label: "Drugs & Substances",
    enabled: true,
    words: [
      "cocaine","coke","crack","heroin","opioid","opiate","fentanyl","oxycodone","hydrocodone",
      "percocet","vicodin","meth","methamphetamine","crystal meth","marijuana","cannabis","weed",
      "pot","edibles","thc","dispensary","high on","ecstasy","mdma","molly","lsd","acid",
      "mushrooms","shrooms","psilocybin","ketamine","xanax","adderall","benzodiazepine","drug use",
      "drug abuse","drug addiction","getting high","stoned","tripping","overdose","od'd"
    ]
  },
  gambling: {
    label: "Gambling",
    enabled: false,
    words: [
      "casino","gambling","sports betting","bet on","place a bet","poker","blackjack",
      "slot machine","slots","lottery","scratch ticket","sportsbook","odds on","wager"
    ]
  }
};

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
