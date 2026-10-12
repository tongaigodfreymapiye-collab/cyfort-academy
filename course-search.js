/* CyFort Academy private keyword search; no OpenAI API calls.
   Include AFTER app.js in index.html. Uses existing api() and auth(). */
(function () {
  'use strict';
  function init() {
    const portal = document.getElementById('access');
    if (!portal) return;
    if (document.getElementById('cyfortCourseSearch')) return;
    const panel = document.createElement('section');
    panel.id = 'cyfortCourseSearch';
    panel.className = 'cyfort-course-search';
    panel.setAttribute('aria-label', 'Private course textbook search');
    panel.innerHTML = '<h3>Search your course textbooks</h3>' +
      '<p>Search all eight CCRA-GP textbooks by keyword. Only active learners can view excerpts. No AI credits required.</p>' +
      '<form id="cyfortSearchForm"><label for="cyfortSearchQuery">Search term</label>' +
      '<div class="cyfort-search-row"><input id="cyfortSearchQuery" type="search" minlength="3" maxlength="120" required placeholder="e.g. NIST risk assessment" autocomplete="off">' +
      '<button type="submit" id="cyfortSearchButton">Search textbooks</button></div></form>' +
      '<p id="cyfortSearchStatus" role="status" aria-live="polite">Sign in above with your active enrolment ID and token to search.</p>' +
      '<div id="cyfortSearchResults" aria-live="polite"></div>';
    portal.insertAdjacentElement('afterend', panel);
    const form = document.getElementById('cyfortSearchForm');
    const status = document.getElementById('cyfortSearchStatus');
    const results = document.getElementById('cyfortSearchResults');
    const button = document.getElementById('cyfortSearchButton');
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      results.replaceChildren();
      const query = document.getElementById('cyfortSearchQuery').value.trim();
      if (query.length < 3 || query.length > 120) { status.textContent = 'Enter between 3 and 120 characters.'; return; }
      // auth() is the website's existing session reader; backend rechecks every request.
      const session = typeof auth === 'function' ? auth() : null;
      if (!session || !session.enrolmentId || !session.token) {
        status.textContent = 'Please unlock your training in the Student Portal above first.';
        return;
      }
      if (typeof api !== 'function') { status.textContent = 'Search unavailable: website API not loaded.'; return; }
      button.disabled = true;
      status.textContent = 'Searching protected course index…';
      try {
        const response = await api('searchCourseMaterials', { ...session, query });
        const items = response && Array.isArray(response.results) ? response.results : [];
        status.textContent = items.length ? 'Showing ' + items.length + ' matching passages' + (Number.isFinite(response.total) ? ' (' + response.total + ' total matches).' : '.') : 'No matching passages found. Try another keyword.';
        items.forEach(function (item) {
          const article = document.createElement('article');
          article.className = 'cyfort-search-result';
          const heading = document.createElement('h4');
          heading.textContent = 'Module ' + String(item.module || '?') + ' · Page ' + String(item.page || '?');
          const excerpt = document.createElement('p');
          excerpt.textContent = String(item.excerpt || ''); // Never interpret PDF text as HTML.
          article.append(heading, excerpt);
          results.append(article);
        });
      } catch (error) {
        status.textContent = 'Search unavailable: ' + (error && error.message ? error.message : 'Please try again.');
      } finally { button.disabled = false; }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
