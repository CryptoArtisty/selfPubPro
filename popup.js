// popup.js

document.getElementById('toggle').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) return;

    chrome.tabs.sendMessage(
      tab.id,
      { type: 'SCRAPE_PAGE' },
      response => {
        if (chrome.runtime.lastError) {
          console.warn('No content script on this page:', chrome.runtime.lastError.message);
        } else {
          console.log('Scrape initiated:', response);
        }
      }
    );
  });
});
