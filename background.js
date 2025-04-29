// background.js

// Load rateLimiter from root
importScripts('rateLimiter.js');

const bookDataArray = [];
const autosuggestLimiter = new RateLimiter(5, 1000);
const fetchLimiter = new RateLimiter(2, 500);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'BOOK_INFO') {
    bookDataArray.push(msg.payload);
    console.log('BOOK_INFO stored:', msg.payload);
    return;
  }

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
    const headers = ['Title','Author','Price','Rating','Reviews','BSR','Backend Keywords'];
    const rows = bookDataArray.map(d => [
      d.title, d.author, d.price, d.rating, d.reviews, d.bsr,
      (d.backendKeywords||[]).join(' | ')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    chrome.downloads.download({ filename: 'book_data.csv', url: dataUrl });
  }
});
