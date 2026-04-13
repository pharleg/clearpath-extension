// ClearPath background service worker
// Handles install defaults and badge state

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["clearpathSettings"], (result) => {
    if (!result.clearpathSettings) {
      // First install — set defaults
      chrome.storage.sync.set({
        clearpathSettings: {
          enabled: true,
          mode: "blur",
          wordLists: null // null means content.js uses its own defaults
        }
      });
    }
  });
});
