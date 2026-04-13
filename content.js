// ClearPath - Content Filter
// Word list is organized by category so users can toggle categories independently

const DEFAULT_WORD_LISTS = {
  alcohol: {
    label: "Alcohol",
    enabled: true,
    words: [
      "alcohol", "alcoholic", "alcoholism",
      "beer", "lager", "ale", "craft beer", "brew", "brewery", "brewpub",
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
      "cocaine", "coke", "crack",
      "heroin", "opioid", "opiate", "fentanyl", "oxycodone", "hydrocodone", "percocet", "vicodin",
      "meth", "methamphetamine", "crystal meth",
      "marijuana", "cannabis", "weed", "pot", "edibles", "thc", "dispensary", "high on",
      "ecstasy", "mdma", "molly",
      "lsd", "acid", "mushrooms", "shrooms", "psilocybin",
      "ketamine", "xanax", "adderall", "benzodiazepine",
      "drug use", "drug abuse", "drug addiction",
      "getting high", "stoned", "tripping",
      "overdose", "od'd"
    ]
  },
  gambling: {
    label: "Gambling",
    enabled: false,
    words: [
      "casino", "gambling", "sports betting", "bet on", "place a bet",
      "poker", "blackjack", "slot machine", "slots",
      "lottery", "scratch ticket",
      "sportsbook", "odds on", "wager"
    ]
  }
};

const REPLACEMENT_TEXT = "[ content filtered ]";

let settings = {
  enabled: true,
  mode: "blur", // "blur", "hide", "replace"
  revealOnClick: true,
  wordLists: DEFAULT_WORD_LISTS
};

// Build flat array of active words for matching
function getActiveWords() {
  const words = [];
  for (const [, category] of Object.entries(settings.wordLists)) {
    if (category.enabled) {
      words.push(...category.words);
    }
  }
  // Sort longest first so multi-word phrases match before single words
  return words.sort((a, b) => b.length - a.length);
}

function buildRegex(words) {
  if (!words.length) return null;
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
}

// Process a single text node
function processTextNode(node, regex) {
  if (!node.nodeValue || !node.nodeValue.trim()) return;
  if (!regex.test(node.nodeValue)) return;

  regex.lastIndex = 0;

  if (settings.mode === "replace") {
    node.nodeValue = node.nodeValue.replace(regex, REPLACEMENT_TEXT);
    return;
  }

  // For blur/hide we wrap matches in spans
  const parent = node.parentNode;
  if (!parent || parent.classList?.contains("clearpath-processed")) return;

  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;
  regex.lastIndex = 0;
  let matched = false;

  while ((match = regex.exec(node.nodeValue)) !== null) {
    matched = true;
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex, match.index)));
    }
    const span = document.createElement("span");
    span.className = `clearpath-filtered clearpath-${settings.mode}`;
    span.textContent = match[0];
    span.title = "Filtered by ClearPath";
    fragment.appendChild(span);
    lastIndex = match.index + match[0].length;
  }

  if (matched) {
    fragment.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex)));
    parent.replaceChild(fragment, node);
  }
}

// Walk the DOM and process text nodes
// TreeWalker collection is synchronous (read-only, fast).
// DOM mutations (replaceChild) are deferred to idle batches to avoid
// blocking the main thread on content-heavy pages.
function processNode(root, regex) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName?.toLowerCase();
        // Skip scripts, styles, inputs
        if (["script", "style", "noscript", "input", "textarea"].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip already-processed nodes
        if (parent.classList?.contains("clearpath-processed")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);

  function processBatch(deadline) {
    while (nodes.length > 0 && deadline.timeRemaining() > 5) {
      processTextNode(nodes.shift(), regex);
    }
    if (nodes.length > 0) {
      requestIdleCallback(processBatch, { timeout: 2000 });
    }
  }

  if (nodes.length > 0) {
    requestIdleCallback(processBatch, { timeout: 2000 });
  }
}

// Universal card scanner — finds content units top-down and hides any that match
// A "card" is any element that looks like a self-contained content unit:
// - Contains a heading or link
// - Has a reasonable size (not the whole page, not a tiny inline element)
// - Is a peer among siblings (sits in a list/grid of similar elements)
// This approach is site-agnostic — no class names needed

const SKIP_CONTAINERS = new WeakSet(); // elements we've already processed

function isLayoutShell(el) {
  // Reject elements that are clearly page-level layout, not content cards
  const tag = el.tagName.toLowerCase();
  if (["html", "body", "main", "header", "footer", "nav", "script", "style", "noscript"].includes(tag)) return true;
  if (el.getAttribute("role") === "navigation") return true;
  return false;
}

function looksLikeCard(el) {
  // Must be a block-level container
  const tag = el.tagName.toLowerCase();
  if (!["div", "section", "article", "aside", "li"].includes(tag)) return false;
  if (isLayoutShell(el)) return false;

  // Must have at least one link or heading inside
  const hasLink = el.querySelector("a[href]");
  const hasHeading = el.querySelector("h1,h2,h3,h4,h5,h6");
  if (!hasLink && !hasHeading) return false;

  // Must be a peer — parent has multiple similar children
  const parent = el.parentElement;
  if (!parent) return false;
  const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
  if (siblings.length < 2) return false;

  // Sanity check on size — cards shouldn't contain the entire page body
  // If this element contains more than 20 links it's probably a nav or feed wrapper
  const linkCount = el.querySelectorAll("a").length;
  if (linkCount > 20) return false;

  return true;
}

function applyCardFilter(el) {
  SKIP_CONTAINERS.add(el);
  if (settings.mode === "hide") {
    el.style.setProperty("display", "none", "important");
  } else {
    el.classList.add("clearpath-filtered", `clearpath-${settings.mode}`);
  }
}

function scanCards(regex) {
  const candidates = Array.from(
    document.querySelectorAll("div, section, article, aside, li")
  ).filter(el => {
    if (SKIP_CONTAINERS.has(el)) return false;
    if (!looksLikeCard(el)) return false;
    if (el.closest("nav, header, footer, [role='navigation']")) return false;
    return true;
  });

  function processBatch(deadline) {
    while (candidates.length > 0 && deadline.timeRemaining() > 5) {
      const el = candidates.shift();
      const text = el.textContent || "";
      if (!text.trim()) continue;
      regex.lastIndex = 0;
      if (regex.test(text)) {
        applyCardFilter(el);
      }
    }
    if (candidates.length > 0) {
      requestIdleCallback(processBatch, { timeout: 2000 });
    }
  }

  if (candidates.length > 0) {
    requestIdleCallback(processBatch, { timeout: 2000 });
  }
}


function injectStyles() {
  if (document.getElementById("clearpath-styles")) return;
  const style = document.createElement("style");
  style.id = "clearpath-styles";
  style.textContent = `
    .clearpath-blur {
      filter: blur(5px);
      transition: filter 0.2s;
    }
    .clearpath-blur.clearpath-revealed {
      filter: blur(0);
    }
    .clearpath-hide {
      display: none !important;
    }
    .clearpath-replace {
      color: transparent;
      background: #e0e0e0;
      border-radius: 3px;
      padding: 0 2px;
    }
  `;
  document.head.appendChild(style);
}

function runFilter() {
  if (!settings.enabled) return;
  const words = getActiveWords();
  if (!words.length) return;
  const regex = buildRegex(words);
  injectStyles();
  processNode(document.body, regex);
  scanCards(regex);
}

// Retry pass for late-rendering content (React, lazy loads, etc.)
// processNode is intentionally omitted here — it already ran in runFilter() and
// the TreeWalker has no guard against re-processing existing clearpath spans,
// so calling it again would create double-nested blur spans on matched words.
// scanCards() is safe to retry because SKIP_CONTAINERS prevents re-processing.
function runFilterDelayed() {
  if (!settings.enabled) return;
  const words = getActiveWords();
  if (!words.length) return;
  const regex = buildRegex(words);
  scanCards(regex);
}

// Watch for dynamically added content
let observer;
let observerDebounceTimer = null;

function startObserver() {
  if (observer) observer.disconnect();
  const words = getActiveWords();
  if (!words.length) return;
  const regex = buildRegex(words);

  observer = new MutationObserver((mutations) => {
    // Collect only nodes added by the site, not by our own filtering
    const siteNodes = [];
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Skip spans/elements we injected
          if (node.classList?.contains("clearpath-filtered")) return;
          if (node.closest?.(".clearpath-filtered")) return;
          siteNodes.push(node);
        } else if (node.nodeType === Node.TEXT_NODE) {
          // Skip text nodes inside our spans
          if (node.parentElement?.closest(".clearpath-filtered")) return;
          siteNodes.push(node);
        }
      });
    });

    if (!siteNodes.length) return;

    // Debounce: batch rapid mutations into a single processing pass
    clearTimeout(observerDebounceTimer);
    observerDebounceTimer = setTimeout(() => {
      siteNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processNode(node, regex);
        } else {
          processTextNode(node, regex);
        }
      });
      scanCards(regex);
    }, 300);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Click-to-reveal: delegate from body so dynamically added blur elements are covered
// Capture phase (true) so we intercept before the link inside the card fires.
// Only intercept when the element is still blurred — once revealed, let clicks
// pass through naturally so the user can navigate to the article.
document.body.addEventListener("click", (e) => {
  if (!settings.revealOnClick) return;
  const el = e.target.closest(".clearpath-blur");
  if (!el) return;
  if (el.classList.contains("clearpath-revealed")) return;
  e.preventDefault();
  e.stopPropagation();
  el.classList.add("clearpath-revealed");
}, true);

// Load settings from storage then run
chrome.storage.sync.get(["clearpathSettings"], (result) => {
  if (result.clearpathSettings) {
    // Destructure wordLists out before spreading so a stored null value
    // cannot overwrite DEFAULT_WORD_LISTS (Object.entries(null) throws)
    const { wordLists, ...rest } = result.clearpathSettings;
    settings = { ...settings, ...rest };
    if (wordLists) {
      settings.wordLists = wordLists;
    }
  }
  if (settings.enabled) {
    runFilter();
    startObserver();
    // Retry at 1s and 3s to catch late-rendering content
    setTimeout(runFilterDelayed, 1000);
    setTimeout(runFilterDelayed, 3000);
  }
});

// Listen for settings changes from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SETTINGS_UPDATED") {
    settings = msg.settings;
    // Re-run — simplest approach for now is reload
    window.location.reload();
  }
});
