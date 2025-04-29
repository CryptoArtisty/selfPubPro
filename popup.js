// popup.js
document.getElementById('toggle').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'SCRAPE_PAGE'});
  });
});

document.getElementById('export').addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'EXPORT_CSV'});
});
