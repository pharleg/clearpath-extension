# ClearPath Chrome Extension

## What this is
A Chrome extension (Manifest V3) that filters alcohol, drug, and substance references from web pages. Built pro bono for the AA/recovery community. No backend, no data leaves the browser.

## Architecture

### Files
- `manifest.json` — MV3 config, storage + activeTab permissions, host_permissions `<all_urls>`
- `content.js` — the filter engine, injected into every page at `document_end`
- `background.js` — minimal service worker, sets install defaults
- `popup.html` / `popup.js` — extension popup UI, dark-themed, settings via `chrome.storage.sync`
- `icons/` — icon16.png, icon48.png, icon128.png

### How the filter works
1. Loads settings from `chrome.storage.sync`
2. Builds a regex from the active word lists
3. `processNode()` — TreeWalker over all text nodes, wraps matched words in `<span class="clearpath-filtered clearpath-[mode]">`
4. `scanCards()` — queries all `div/section/article/aside/li`, scores each as a "card" (has link/heading, has siblings, <20 links), checks `textContent` for matches, hides or blurs the whole card
5. MutationObserver watches for dynamically added content
6. Delayed retries at 1s and 3s for SPA/lazy-loaded content

### Display modes
- `blur` — blurs matched text/cards, hover to reveal
- `hide` — sets `display: none !important`
- `replace` — replaces matched text with `[ content filtered ]`

### Word lists
Three categories in `DEFAULT_WORD_LISTS` (same structure in both `content.js` and `popup.js` — keep them in sync):
- `alcohol` — enabled by default
- `drugs` — enabled by default  
- `gambling` — disabled by default

## Known issues / active work

### CRITICAL: scanCards() hangs the page
`scanCards()` queries every div/section/article/aside/li and calls `textContent` on each. On content-heavy pages this locks the main thread and kills the tab. 

**Fix needed:** Rewrite `scanCards()` to use `requestIdleCallback` to process cards in batches during browser idle time. Also ensure we're using `textContent` not `innerText` (innerText triggers layout reflow on every call).

### Blur mode only blurs matched text nodes, not full cards
`processNode()` wraps individual words in blur spans. `scanCards()` blurs the whole card container. These two approaches produce inconsistent results — whole-card blur is the right UX.

### Settings apply requires page reload
When user changes settings in popup, the content script reloads the tab via `window.location.reload()`. Should instead cleanly undo previous filtering and re-run.

## Next session priorities
1. Fix `scanCards()` performance with `requestIdleCallback` batching — this is the blocker
2. Consistent blur behavior (whole card, not individual words)
3. Test on reddit.com/r/wine and foodandwine.com after performance fix

## Testing
Load unpacked in Chrome via `chrome://extensions` → Developer mode → Load unpacked.
After any `content.js` change: reload the extension, then hard refresh (`Ctrl+Shift+R`) the test page.

Test sites used:
- `cleveland.com` — confirmed working after fixes, triggered anti-adblocker (expected)
- `foodandwine.com` — SPA, content renders late, needs MutationObserver + delayed retries
- `wine.com` — full SPA, challenging

## Design decisions
- No class-name targeting — sites use hashed CSS modules, so container detection is behavior-based (sibling count, presence of heading/link)
- `WeakSet` used to track already-processed card elements and avoid double-processing
- Word lists sorted longest-first so multi-word phrases match before single words
- Nav/header/footer explicitly skipped to avoid hiding site chrome
