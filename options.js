// options.js

document.getElementById('save').addEventListener('click', () => {
  const maxPages = parseInt(document.getElementById('maxPages').value, 10);
  const autosuggestRate = parseInt(document.getElementById('autosuggestRate').value, 10);
  chrome.storage.sync.set({ maxPages, autosuggestRate }, () => {
    alert('Settings saved.');
  });
});

window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['maxPages', 'autosuggestRate'], (res) => {
    if (res.maxPages) document.getElementById('maxPages').value = res.maxPages;
    if (res.autosuggestRate) document.getElementById('autosuggestRate').value = res.autosuggestRate;
  });
});
