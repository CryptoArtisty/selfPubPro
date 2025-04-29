// background.js
importScripts('utils/rateLimiter.js');

const bookDataArray = [];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'BOOK_INFO') {
    bookDataArray.push(msg.payload);
    console.log('BOOK_INFO stored:', msg.payload);
    return;
  }

  if (msg.type === 'EXPORT_CSV') {
    // Build CSV
    const headers = ['Title','Author','Price','Rating','Reviews','BSR','Backend Keywords'];
    const rows = bookDataArray.map(d => [
      d.title, d.author, d.price, d.rating, d.reviews, d.bsr,
      (d.backendKeywords||[]).join(' | ')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

    // Download via data URI
    const blobUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    chrome.downloads.download({
      filename: 'book_data.csv',
      url: blobUrl
    });
  }
});
