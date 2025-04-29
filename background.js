// background.js
importScripts('rateLimiter.js');

const autosuggestLimiter = new RateLimiter(5, 1000);
const fetchLimiter = new RateLimiter(2, 500);

let bookDataArray = [];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'BOOK_INFO') {
    bookDataArray.push(msg.payload);
    console.log('Book info received:', msg.payload);
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
    const csvContent = generateCSV(bookDataArray);
    chrome.downloads.download({
      filename: 'book_data.csv',
      url: URL.createObjectURL(new Blob([csvContent], {type: 'text/csv'}))
    });
  }
});

function generateCSV(dataArray) {
  const headers = ['Title', 'Author', 'Price', 'Rating', 'Reviews', 'BSR', 'Backend Keywords'];
  const rows = dataArray.map(data => {
    const book = data.bookData;
    const keywords = data.backendKeywords.join(', ');
    return [
      book.name || '',
      book.author || '',
      data.price || '',
      data.rating || '',
      data.reviews || '',
      data.bsr || '',
      keywords
    ];
  });
  const csvRows = [headers.join(',')].concat(rows.map(row => row.join(',')));
  return csvRows.join('\n');
}
