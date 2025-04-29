// background.js
importScripts('rateLimiter.js');

const autosuggestLimiter = new RateLimiter(5, 1000);
const fetchLimiter      = new RateLimiter(2, 500);
let bookDataArray       = [];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'BOOK_INFO') {
    bookDataArray.push(msg.payload);
    console.log('Book info received:', msg.payload);
    return;
  }

  if (msg.type === 'EXPORT_CSV') {
    const csvContent = generateCSV(bookDataArray);
    const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    chrome.downloads.download({
      filename: 'book_data.csv',
      url: dataUrl
    });
  }
});

// Build CSV from the collected payloads
function generateCSV(dataArray) {
  const headers = ['Title','Author','Price','Rating','Reviews','BSR','Backend Keywords'];
  const rows = dataArray.map(data => {
    return [
      data.title || '',
      data.author || '',
      data.price,
      data.rating,
      data.reviews,
      data.bsr,
      (data.backendKeywords || []).join(' | ')
    ];
  });
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
