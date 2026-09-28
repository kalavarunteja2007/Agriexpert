// ==========================================================================
// AgriExpert AI — Crop Doctor (AI Leaf Disease Diagnosis Module)
// ==========================================================================

import { Api } from './api.js';

export function initCropDoctor() {
  const dropZone = document.getElementById('dropZone');
  const leafFileInput = document.getElementById('leafFileInput');
  const scanPreviewImg = document.getElementById('scanPreviewImg');
  const scanPlaceholder = document.getElementById('scanPlaceholder');
  const diagnosisResultBox = document.getElementById('diagnosisResultBox');
  const sampleChips = document.querySelectorAll('.sample-chip');

  if (!dropZone) return;

  // Click to open file picker
  dropZone.addEventListener('click', () => {
    leafFileInput.click();
  });

  // Drag & drop handlers
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageScan(e.dataTransfer.files[0]);
    }
  });

  leafFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageScan(e.target.files[0]);
    }
  });

  // Sample quick chips
  sampleChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const diseaseId = chip.getAttribute('data-disease-id');
      const crop = chip.getAttribute('data-crop');
      handleSampleScan(diseaseId, crop, chip.innerText);
    });
  });

  async function handleImageScan(file) {
    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      scanPreviewImg.src = e.target.result;
      scanPreviewImg.style.display = 'block';
      scanPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);

    showDiagnosingState();

    const formData = new FormData();
    formData.append('leafImage', file);

    const res = await Api.diagnoseLeaf(formData);
    if (res && res.success) {
      renderDiagnosis(res.diagnosis);
    } else {
      renderError();
    }
  }

  async function handleSampleScan(diseaseId, crop, label) {
    // Generate a visual canvas image placeholder based on crop
    generateSampleCanvas(crop, label);

    showDiagnosingState();

    const formData = new FormData();
    formData.append('diseaseId', diseaseId);
    formData.append('crop', crop);

    const res = await Api.diagnoseLeaf(formData);
    if (res && res.success) {
      renderDiagnosis(res.diagnosis);
    } else {
      renderError();
    }
  }

  function generateSampleCanvas(crop, label) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');

    // Rich gradient background for plant leaf
    const grad = ctx.createLinearGradient(0, 0, 400, 250);
    if (label.includes('Healthy')) {
      grad.addColorStop(0, '#15803d');
      grad.addColorStop(1, '#22c55e');
    } else {
      grad.addColorStop(0, '#3f2e18');
      grad.addColorStop(0.5, '#4d7c0f');
      grad.addColorStop(1, '#854d0e');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 250);

    // Draw stylized leaf veins
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 200);
    ctx.quadraticCurveTo(200, 120, 360, 40);
    ctx.stroke();

    // Leaf label overlay
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.fillText(`${crop} Sample Scan`, 24, 40);
    ctx.font = '14px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(label, 24, 65);

    scanPreviewImg.src = canvas.toDataURL('image/jpeg');
    scanPreviewImg.style.display = 'block';
    scanPlaceholder.style.display = 'none';
  }

  function showDiagnosingState() {
    diagnosisResultBox.innerHTML = `
      <div style="text-align: center; padding: 48px 24px;">
        <div class="scan-icon-large" style="animation: spin 1.5s linear infinite;">🔬</div>
        <h3 style="margin-bottom: 8px;">Analyzing Leaf Bio-Spectral Data...</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Examining necrosis patterns, chlorosis rings, and fungal spore signatures against 15+ agricultural models.</p>
      </div>
    `;
  }

  function renderDiagnosis(d) {
    diagnosisResultBox.innerHTML = `
      <div class="diagnosis-header">
        <div>
          <span style="font-size: 0.85rem; color: var(--primary-600); font-weight: 700; text-transform: uppercase;">
            ${d.crop} Diagnostic
          </span>
          <h2 style="font-size: 1.45rem; margin-top: 4px;">${d.disease}</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Scan ID: ${d.scanId} • Analyzed ${d.analyzedAt}</p>
        </div>
        <span class="severity-pill severity-${d.severity}">${d.severity}</span>
      </div>

      <div class="confidence-meter">
        <span style="font-size: 0.85rem; font-weight: 600;">Diagnostic Confidence:</span>
        <div class="meter-bar">
          <div class="meter-fill" style="width: ${d.confidence};"></div>
        </div>
        <span style="font-weight: 700; color: var(--primary-600); font-size: 0.95rem;">${d.confidence}</span>
      </div>

      <div style="background-color: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 18px;">
        <p style="font-size: 0.88rem; line-height: 1.5;"><strong>Symptoms Identified:</strong> ${d.symptoms}</p>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 6px;"><strong>Environmental Cause:</strong> ${d.cause}</p>
      </div>

      <div class="remedy-tabs">
        <button class="remedy-tab-btn active" data-tab="organic">🌿 Organic Remedy</button>
        <button class="remedy-tab-btn" data-tab="chemical">🧪 Chemical Treatment</button>
        <button class="remedy-tab-btn" data-tab="timeline">📅 14-Day Action Plan</button>
      </div>

      <div id="remedyTabContent">
        <div class="remedy-box" style="border-left: 4px solid var(--primary-500);">
          <h4 style="color: var(--primary-700); margin-bottom: 6px;">Recommended Organic Solution:</h4>
          <p style="line-height: 1.55;">${d.organicRemedy}</p>
        </div>
      </div>

      <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.8rem; color: var(--text-muted);">Preventive: ${d.preventiveMeasures.slice(0, 70)}...</span>
        <button class="btn btn-secondary" id="saveScanTaskBtn" style="padding: 6px 12px; font-size: 0.8rem;">
          ➕ Add to Farm Tasks
        </button>
      </div>
    `;

    // Remedy tab switching
    const remedyBtns = diagnosisResultBox.querySelectorAll('.remedy-tab-btn');
    const tabContainer = diagnosisResultBox.querySelector('#remedyTabContent');

    remedyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        remedyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');

        if (tab === 'organic') {
          tabContainer.innerHTML = `
            <div class="remedy-box" style="border-left: 4px solid var(--primary-500);">
              <h4 style="color: var(--primary-700); margin-bottom: 6px;">Recommended Organic Solution:</h4>
              <p style="line-height: 1.55;">${d.organicRemedy}</p>
            </div>
          `;
        } else if (tab === 'chemical') {
          tabContainer.innerHTML = `
            <div class="remedy-box" style="border-left: 4px solid var(--amber-500);">
              <h4 style="color: var(--amber-700); margin-bottom: 6px;">Prescribed Chemical Spray (Follow Safety Interval):</h4>
              <p style="line-height: 1.55;">${d.chemicalTreatment}</p>
            </div>
          `;
        } else if (tab === 'timeline') {
          tabContainer.innerHTML = `
            <div class="remedy-box">
              <h4 style="margin-bottom: 10px;">14-Day Recovery Protocol:</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                ${d.recoveryTimeline.map(step => `
                  <li style="display: flex; gap: 10px; font-size: 0.85rem;">
                    <span style="font-weight: 700; color: var(--primary-600); min-width: 65px;">${step.day}:</span>
                    <span>${step.action}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          `;
        }
      });
    });

    // Add to Farm Tasks button
    const saveTaskBtn = diagnosisResultBox.querySelector('#saveScanTaskBtn');
    if (saveTaskBtn) {
      saveTaskBtn.addEventListener('click', async () => {
        saveTaskBtn.disabled = true;
        saveTaskBtn.innerText = 'Adding...';
        await Api.addTask({
          title: `Apply ${d.disease.split('(')[0].trim()} treatment on ${d.crop}`,
          due: 'Tomorrow, 5:00 PM',
          priority: 'High',
          crop: d.crop
        });
        saveTaskBtn.innerText = '✓ Task Scheduled';
        saveTaskBtn.style.color = 'var(--success-500)';
      });
    }
  }

  function renderError() {
    diagnosisResultBox.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--danger-500);">
        <p style="font-size: 1.1rem; font-weight: 600;">Diagnosis could not be completed.</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">Please upload a clear, well-lit photo of the crop leaf or try one of the sample test crops.</p>
      </div>
    `;
  }
}
