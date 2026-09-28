// ==========================================================================
// AgriExpert AI — Government Agricultural Schemes Module
// ==========================================================================

import { Api } from './api.js';

export function initSchemes() {
  const container = document.getElementById('schemesGrid');
  const searchInput = document.getElementById('schemesSearchInput');
  const categoryFilter = document.getElementById('schemesCategoryFilter');

  if (!container) return;

  async function loadSchemes() {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px;">Fetching government farmer schemes...</div>`;

    const category = categoryFilter ? categoryFilter.value : 'All';
    const search = searchInput ? searchInput.value.trim() : '';

    const res = await Api.getSchemes(category, search);

    if (!res.data || res.data.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No schemes found matching your search.</div>`;
      return;
    }

    container.innerHTML = res.data.map(scheme => `
      <div class="scheme-card">
        <div>
          <span class="scheme-badge">${scheme.category}</span>
          <h3 class="scheme-title">${scheme.name}</h3>
          <p class="scheme-benefit"><strong>Direct Benefit:</strong> ${scheme.benefit}</p>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; background: var(--bg-surface-elevated); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <strong>Eligibility:</strong> ${scheme.eligibility}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
            📄 <strong>Required Docs:</strong> ${scheme.documents}
          </div>
        </div>
        <div class="scheme-footer">
          <span style="font-size: 0.78rem; font-weight: 600; color: var(--primary-700);">● ${scheme.status}</span>
          <a href="${scheme.portal}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;">
            Official Portal ↗
          </a>
        </div>
      </div>
    `).join('');
  }

  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(loadSchemes, 300);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', loadSchemes);
  }

  loadSchemes();
}
