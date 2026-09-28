// ==========================================================================
// AgriExpert AI — Soil Health & Fertilizer Prescription Module
// ==========================================================================

import { Api } from './api.js';

export function initSoilHealth() {
  const form = document.getElementById('soilCalcForm');
  const resultCard = document.getElementById('soilPrescriptionCard');

  if (!form || !resultCard) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Calculating Prescription...`;

    const payload = {
      crop: form.cropType.value,
      areaAcres: form.areaAcres.value,
      ph: form.soilPh.value,
      nitrogen: form.soilN.value,
      phosphorus: form.soilP.value,
      potassium: form.soilK.value,
      organicCarbon: form.soilOc.value
    };

    const res = await Api.calculateSoil(payload);
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    if (res && res.success) {
      renderSoilPrescription(res.report);
    }
  });

  function renderSoilPrescription(r) {
    const f = r.fertilizerPrescription;
    resultCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary-600); text-transform: uppercase;">
            ${r.crop} • ${r.areaAcres} Acre(s)
          </span>
          <h3 style="font-size: 1.3rem; margin-top: 2px;">Tailored Fertilizer Prescription</h3>
        </div>
        <span class="live-badge" style="background: var(--primary-100); color: var(--primary-800);">
          ✓ Scientifically Balanced
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
        <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Soil pH Evaluation</span>
          <strong style="color: var(--primary-700); font-size: 0.95rem;">${r.phStatus}</strong>
          <p style="font-size: 0.8rem; margin-top: 4px; color: var(--text-secondary);">${r.phRecommendation}</p>
        </div>
        <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Organic Carbon Level</span>
          <strong style="color: var(--amber-600); font-size: 0.95rem;">${r.organicCarbonStatus}</strong>
          <p style="font-size: 0.8rem; margin-top: 4px; color: var(--text-secondary);">Apply ${f.farmYardManure.perAcreTons * r.areaAcres} tons Farm Yard Manure (FYM).</p>
        </div>
      </div>

      <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--text-secondary);">Commercial Fertilizer Bag Requirement:</h4>

      <div class="fertilizer-cards-grid">
        <div class="fert-card">
          <h4>Neem-Coated Urea</h4>
          <div class="fert-bags">${f.urea.totalBags} <span style="font-size: 0.9rem; font-weight: 500;">Bags</span></div>
          <p>${f.urea.perAcreKg} kg/acre (45 kg bags)</p>
          <span style="font-size: 0.7rem; color: var(--primary-700); display: block; margin-top: 4px;">Split into 3 doses</span>
        </div>

        <div class="fert-card dap">
          <h4>DAP (18:46:0)</h4>
          <div class="fert-bags" style="color: var(--amber-600);">${f.dap.totalBags} <span style="font-size: 0.9rem; font-weight: 500;">Bags</span></div>
          <p>${f.dap.perAcreKg} kg/acre (50 kg bags)</p>
          <span style="font-size: 0.7rem; color: var(--amber-700); display: block; margin-top: 4px;">100% Basal at sowing</span>
        </div>

        <div class="fert-card mop">
          <h4>MOP (Potash 60%)</h4>
          <div class="fert-bags" style="color: var(--sky-600);">${f.mop.totalBags} <span style="font-size: 0.9rem; font-weight: 500;">Bags</span></div>
          <p>${f.mop.perAcreKg} kg/acre (50 kg bags)</p>
          <span style="font-size: 0.7rem; color: var(--sky-700); display: block; margin-top: 4px;">Basal + Flowering split</span>
        </div>
      </div>

      <div style="background-color: var(--bg-accent); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-highlight); margin-top: 14px;">
        <h5 style="color: var(--primary-800); margin-bottom: 4px;">🌾 Agronomist Recommendation for Best Results:</h5>
        <ul style="padding-left: 18px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
          <li>Mix DAP and MOP directly with soil at last ploughing or via seed-cum-fertilizer drill.</li>
          <li>Apply Zinc Sulphate 21% @ 10 kg/acre separately (never mix Zinc directly with Phosphatic DAP).</li>
          <li>Incorporate bio-fertilizers (Azotobacter & PSB) with 50kg compost for enhanced nutrient absorption.</li>
        </ul>
      </div>
    `;
  }
}
