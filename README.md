# ClearPath Chrome Extension

Content filter built for the recovery community. Removes alcohol, drug, and substance references from web pages — not just ads, but inline text, article copy, and links.

## What it does

- Scans all text on a page and filters matched terms
- Handles dynamically loaded content (SPAs, infinite scroll, etc.) via MutationObserver
- Also filters links whose href or anchor text matches
- Three display modes: blur (hover to reveal), hide, or replace with placeholder
- Category toggles: Alcohol, Drugs & Substances, Gambling (off by default)
- All processing is local — no data leaves the browser

## Install (development)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle, top right)
3. Click **Load unpacked**
4. Select this folder

The extension loads immediately on all pages.

## Icons

You'll need to add PNG icons at:
- `icons/icon16.png`
- `icons/icon48.png`
- `icons/icon128.png`

A simple solid-color icon works fine for dev. For production, design something meaningful for the community.

## File structure

```
clearpath-extension/
  manifest.json     Chrome extension config (MV3)
  content.js        The filter engine — runs on every page
  background.js     Service worker — sets install defaults
  popup.html        Extension popup UI
  popup.js          Popup logic and settings persistence
  icons/            16, 48, 128px PNGs required
```

## Customizing the word list

Edit the `DEFAULT_WORD_LISTS` object in `content.js`. Each category has a `words` array. Changes take effect on next page load.

Future: expose a custom words UI in the popup.

## Known limitations

- Images without descriptive alt text won't be filtered (no OCR/ML)
- Video thumbnails not filtered
- Some heavily JS-rendered sites may have inconsistent coverage
- The "apply" button reloads the current tab to re-run the filter

## Roadmap ideas

- Custom word list input in popup
- Per-site whitelist/exemptions
- Export/import settings
- Firefox port (MV3 compatible with minor changes)
- Onboarding screen for first install
