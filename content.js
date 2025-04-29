// content.js
// RateLimiter is loaded via manifest.json content_scripts

const pageLimiter = new RateLimiter(1, 1000);

(async () => {
  await pageLimiter.removeToken();
  console.warn(
    'TOS reminder: Only publicly visible data is scraped.'
  );

  // JSON-LD
  const ld = document.querySelector('script[type="application/ld+json"]');
  const bookData = ld ? JSON.parse(ld.textContent) : {};

  // Meta keywords
  const metaKW = document.querySelector('meta[name="keywords"]');
  const backendKeywords = metaKW
    ? metaKW.content.split(',').map(s => s.trim())
    : [];

  // BSR
  const bsrEl = [...document.querySelectorAll('#detailBulletsWrapper li')]
    .find(li => li.textContent.includes('Best Sellers Rank'));
  const bsr = bsrEl
    ? bsrEl.querySelector('span.a-text-bold').nextSibling.textContent.trim()
    : null;

  // Price & Reviews
  const price = document.querySelector('.a-price .a-offscreen')?.textContent;
  const rating = document.querySelector('span.a-icon-alt')?.textContent;
  const reviews = document.querySelector('#acrCustomerReviewText')?.textContent;

  chrome.runtime.sendMessage({
    type: 'BOOK_INFO',
    payload: { bookData, backendKeywords, bsr, price, rating, reviews }
  });
})();
