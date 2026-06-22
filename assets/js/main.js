/* ============================================================
   WellnessIsWorthIt — Shared JavaScript
   Covers: theme toggle, newsletter, product filter, category
           scroll behaviour
   ============================================================ */

// ── THEME ─────────────────────────────────────────────────────
// Always default to light. Only use dark if user has previously
// toggled it manually.
(function () {
  var saved = localStorage.getItem('wiwi-theme');
  var theme = (saved === 'dark') ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateIcon();
})();

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = (current === 'dark') ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('wiwi-theme', next);
  updateIcon();
}

function updateIcon() {
  var icon = document.getElementById('themeIcon');
  if (!icon) return;
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  } else {
    icon.innerHTML = [
      '<circle cx="12" cy="12" r="5"/>',
      '<line x1="12" y1="1" x2="12" y2="3"/>',
      '<line x1="12" y1="21" x2="12" y2="23"/>',
      '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>',
      '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>',
      '<line x1="1" y1="12" x2="3" y2="12"/>',
      '<line x1="21" y1="12" x2="23" y2="12"/>',
      '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>',
      '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    ].join('');
  }
}


// ── NEWSLETTER ────────────────────────────────────────────────
// Handles both sidebar newsletter and homepage newsletter forms
function handleSubscribe(e) {
  e.preventDefault();
  var btn = e.target.querySelector('button');
  var input = e.target.querySelector('input');
  if (!btn || !input) return;
  btn.textContent = "✓ You're on the list";
  btn.style.background = '#1c3d2f';
  input.disabled = true;
  btn.disabled = true;
}


// ── PRODUCT FILTER & CATEGORY (post pages only) ───────────────
// These functions only run on post pages where the relevant
// elements exist. Guards prevent errors on the homepage.

var currentCategory = 'all';

function setCategory(cat, btn) {
  // Guard: only run on post pages
  if (!document.getElementById('recommendations')) return;

  currentCategory = cat;

  // Update active pill state
  var buttons = document.querySelectorAll('.category-pills button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('active');
  }
  btn.classList.add('active');

  // Run the filter first so content is correct before scrolling
  filterProducts();

  // Scroll to top of product list, offset by sticky header height + buffer
  var target = document.getElementById('result-count');
  var header = document.querySelector('header');
  if (target && header) {
    var headerHeight = header.offsetHeight;
    var targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  }
}

function filterProducts() {
  // Guard: only run on post pages
  var searchBar = document.getElementById('search-bar');
  var recommendations = document.getElementById('recommendations');
  if (!searchBar || !recommendations) return;

  var query = searchBar.value.toLowerCase().trim();
  var products = document.querySelectorAll('.product-node');
  var visible = 0;

  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    var cat = p.getAttribute('data-category') || '';
    var title = p.getAttribute('data-title') || '';
    var descEl = p.querySelector('.product-desc');
    var brandEl = p.querySelector('.product-brand');
    var desc = descEl ? descEl.textContent.toLowerCase() : '';
    var brand = brandEl ? brandEl.textContent.toLowerCase() : '';

    var matchesCat = (currentCategory === 'all' || cat === currentCategory);
    var matchesQuery = (
      !query ||
      title.indexOf(query) > -1 ||
      desc.indexOf(query) > -1 ||
      brand.indexOf(query) > -1 ||
      cat.indexOf(query) > -1
    );

    if (matchesCat && matchesQuery) {
      p.classList.remove('hidden');
      visible++;
    } else {
      p.classList.add('hidden');
    }
  }

  // Show/hide no-results message
  var noResults = document.getElementById('no-results');
  if (noResults) {
    noResults.style.display = (visible === 0) ? 'block' : 'none';
  }

  // Update result count label
  var countEl = document.getElementById('result-count');
  if (countEl) {
    var catLabel = (currentCategory === 'all') ? 'all categories' : currentCategory;
    var queryLabel = query ? ('matching "' + query + '"') : ('in ' + catLabel);
    countEl.innerHTML = '<strong>' + visible + ' item' + (visible !== 1 ? 's' : '') + '</strong> ' + queryLabel;
  }
}
