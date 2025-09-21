// Chrome Extension Background Script
chrome.runtime.onInstalled.addListener(() => {
  console.log('Mind Notes extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});