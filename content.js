// content.js

// Global RateLimiter is loaded first via manifest.json
const pageLimiter = new RateLimiter(1, 1000);

// Helper: perform the actual scrape
async function doScrape() {
  await pageLimiter.removeToken();

  // Only run on Amazon detail pages
  const path = window.location.pathname;
  if (!/\/dp\/|\/gp\/product\//.test(path)) {
    console.warn('Not a book detail page; skipping scrape.');
    return;
  }

  // 1. Title
  const titleEl = document.querySelector('#productTitle');
  const title = titleEl ? titleEl.textContent.trim() : '';

  // 2. Author
  let author = '';
  const byline = document.querySelector('.author a') 
              || document.querySelector('.contributorNameID');
  if (byline) author = byline.textContent.trim();

  // 3. Reviews & Rating
  const reviewsEl = document.querySelector('#acrCustomerReviewText');
  const ratingEl  = document.querySelector('span.a-icon-alt');
  const reviews = reviewsEl ? reviewsEl.textContent.trim() : '';
  const rating  = ratingEl  ? ratingEl.textContent.trim()  : '';

  // 4. BSR
  let bsr = '';
  const bsrNode = Array.from(
    document.querySelectorAll('#detailBulletsWrapper li, #productDetails_detailBullets_sections1 tr')
  ).find(el => el.textContent.includes('Best Sellers Rank'));
  if (bsrNode) {
    bsr = (bsrNode.querySelector('span.a-text-bold')?.nextSibling?.textContent
         || bsrNode.textContent
    ).trim();
  }

  // 5. Price
  const priceEl = document.querySelector('.a-price .a-offscreen');
  const price = priceEl ? priceEl.textContent.trim() : '';

  // 6. Backend Keywords
  const metaKW = document.querySelector('meta[name="keywords"]');
  const backendKeywords = metaKW
    ? metaKW.content.split(',').map(s => s.trim())
    : [];

  // Send only once we have real data
  chrome.runtime.sendMessage({
    type: 'BOOK_INFO',
    payload: { title, author, price, rating, reviews, bsr, backendKeywords }
  });
}

// Listen for popup trigger
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SCRAPE_PAGE') {
    doScrape();
    sendResponse({ status: 'scraping_started' });
  }
});
