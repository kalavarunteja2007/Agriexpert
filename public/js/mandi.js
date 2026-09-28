// ==========================================================================
// AgriExpert AI — Mandi APMC Live Market Prices Module
// ==========================================================================

import { Api } from './api.js';

export function initMandi() {
  const searchInput = document.getElementById('mandiSearchInput');
  const commodityFilter = document.getElementById('mandiCommodityFilter');
  const stateFilter = document.getElementById('mandiStateFilter');
  const tableBody = document.getElementById('mandiTableBody');
  const lastUpdatePill = document.getElementById('mandiLastUpdate');

  if (!tableBody) return;

  async function loadPrices() {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px;">Loading live APMC market data...</td></tr>`;

    const filters = {
      commodity: commodityFilter ? commodityFilter.value : 'All',
      state: stateFilter ? stateFilter.value : 'All',
      search: searchInput ? searchInput.value.trim() : ''
    };

    const res = await Api.getMandiPrices(filters);

    if (lastUpdatePill && res.lastMarketUpdate) {
      lastUpdatePill.innerText = `Updated: ${res.lastMarketUpdate}`;
    }

    if (!res.data || res.data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--text-muted);">No mandi records matching your filter criteria.</td></tr>`;
      return;
    }

    tableBody.innerHTML = res.data.map(item => {
      let trendHtml = '<span class="trend-stable">— 0.0%</span>';
      if (item.trend === 'up') {
        trendHtml = `<span class="trend-up">▲ ${item.trendPercent}</span>`;
      } else if (item.trend === 'down') {
        trendHtml = `<span class="trend-down">▼ ${item.trendPercent}</span>`;
      }

      const mspDiff = item.msp > 0 ? (item.modalPrice - item.msp) : 0;
      let mspBadge = item.msp > 0 ? 
        `<span class="msp-badge" style="color: ${mspDiff >= 0 ? 'var(--primary-600)' : 'var(--danger-500)'}">
          MSP: ₹${item.msp} (${mspDiff >= 0 ? '+' : ''}${mspDiff})
        </span>` : '<span class="msp-badge">Non-MSP</span>';

      return `
        <tr>
          <td>
            <strong>${item.commodity}</strong>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${item.variety}</div>
          </td>
          <td>
            ${item.mandi}
            <div style="font-size: 0.78rem; color: var(--text-muted);">${item.state}</div>
          </td>
          <td style="font-size: 0.85rem; color: var(--text-secondary);">₹${item.minPrice.toLocaleString()} - ₹${item.maxPrice.toLocaleString()}</td>
          <td>
            <span style="font-size: 1.05rem; font-weight: 700; color: var(--primary-700);">₹${item.modalPrice.toLocaleString()}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${item.unit}</span>
          </td>
          <td>${trendHtml}</td>
          <td>${mspBadge}</td>
          <td style="font-size: 0.85rem;">${item.arrivalTonnes} MT</td>
        </tr>
      `;
    }).join('');
  }

  // Bind filter events
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadPrices, 300);
    });
  }

  if (commodityFilter) {
    commodityFilter.addEventListener('change', loadPrices);
  }

  if (stateFilter) {
    stateFilter.addEventListener('change', loadPrices);
  }

  // Initial load
  loadPrices();
}
