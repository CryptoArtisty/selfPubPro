// content.js
// (RateLimiter still loaded first via manifest)

const pageLimiter = new RateLimiter(1, 1000);

(async () => {
  await pageLimiter.removeToken();

  console.warn('TOS reminder: Only publicly visible data is scraped.');

  // 1. Title (fallback if JSON-LD missing)
  const titleEl = document.querySelector('#productTitle');
  const title = titleEl
    ? titleEl.textContent.trim()
    : '';

  // 2. Author (handles various Amazon layouts)
  let author = '';
  const authorLink = document.querySelector('.author a') 
                  || document.querySelector('.contributorNameID');
  if (authorLink) {
    author = authorLink.textContent.trim();
  }

  // 3. JSON-LD (optional extra metadata)
  const ld = document.querySelector('script[type="application/ld+json"]');
  let ldData = {};
  if (ld) {
    try {
      const parsed = JSON.parse(ld.textContent);
      if (parsed['@type'] === 'Book' || parsed['@type'] === 'Product') {
        ldData = parsed;
      }
    } catch (e) {
      console.warn('Could not parse JSON-LD', e);
    }
  }

  // 4. Meta Keywords
  const metaKW = document.querySelector('meta[name="keywords"]');
  const backendKeywords = metaKW
    ? metaKW.content.split(',').map(s => s.trim())
    : [];

  // 5. BSR (Best Sellers Rank)
  let bsr = '';
  const bsrLi = Array.from(
    document.querySelectorAll('#detailBulletsWrapper li, #productDetails_detailBullets_sections1 tr')
  ).find(el =>
    el.textContent.includes('Best Sellers Rank')
  );
  if (bsrLi) {
    // text might be inside a <span class="a-list-item">
    bsr = (bsrLi.querySelector('span.a-text-bold')?.nextSibling?.textContent
      || bsrLi.textContent
    ).trim();
  }

  // 6. Price & Reviews
  const price = document.querySelector('.a-price .a-offscreen')?.textContent.trim() || '';
  const rating = document.querySelector('span.a-icon-alt')?.textContent.trim() || '';
  const reviews = document.querySelector('#acrCustomerReviewText')?.textContent.trim() || '';

  chrome.runtime.sendMessage({
    type: 'BOOK_INFO',
    payload: {
      title,
      author,
      price,
      rating,
      reviews,
      bsr,
      backendKeywords,
      // optional JSON-LD data if you need more later
      ldData
    }
  });
})();
