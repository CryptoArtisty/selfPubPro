// background.js
importScripts('rateLimiter.js');

const autosuggestLimiter = new RateLimiter(5, 1000);
const fetchLimiter = new RateLimiter(2, 500);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'FETCH_AUTOSUGGEST') {
    autosuggestLimiter.removeToken().then(() => {
      fetch(msg.url)
        .then(r => r.json())
        .then(data => sendResponse({ success: true, data }))
        .catch(err => sendResponse({ success: false, error: err }));
    });
    return true;
  }
  if (msg.type === 'EXPORT_CSV') {
    // …your export logic…
  }
});
