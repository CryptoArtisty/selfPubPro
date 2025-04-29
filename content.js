// content.js

const pageLimiter = new RateLimiter(1, 1000);

async function doScrape() {
  await pageLimiter.removeToken();

  const path = window.location.pathname;
  if (!/\/dp\//.test(path) && !/\/gp\/product\//.test(path)) {
    console.warn('Not a book detail page; skipping scrape.');
    return;
  }

  const titleEl = document.querySelector('#productTitle');
  const title = titleEl ? titleEl.textContent.trim() : '';

  let author = '';
  const byline = document.querySelector('.author a') || document.querySelector('.contributorNameID');
  if (byline) author = byline.textContent.trim();

  const reviewsEl = document.querySelector('#acrCustomerReviewText');
  const ratingEl = document.querySelector('span.a-icon-alt');
  const reviews = reviewsEl ? reviewsEl.textContent.trim() : '';
  const rating = ratingEl ? ratingEl.textContent.trim() : '';

  let bsr = '';
  const bsrNode = Array.from(
    document.querySelectorAll('#detailBulletsWrapper li, #productDetails_detailBullets_sections1 tr')
  ).find(el => el.textContent.includes('Best Sellers Rank'));
  if (bsrNode) {
    bsr = (bsrNode.querySelector('span.a-text-bold')?.nextSibling?.textContent || bsrNode.textContent).trim();
  }

  const priceEl = document.querySelector('.a-price .a-offscreen');
  const price = priceEl ? priceEl.textContent.trim() : '';

  const metaKW = document.querySelector('meta[name="keywords"]');
  const backendKeywords = metaKW ? metaKW.content.split(',').map(s => s.trim()) : [];

  chrome.runtime.sendMessage({
    type: 'BOOK_INFO',
    payload: { title, author, price, rating, reviews, bsr, backendKeywords }
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SCRAPE_PAGE') {
    doScrape();
    sendResponse({ status: 'scraping_started' });
  }
});
