// ==========================================================================
// AgriExpert AI — Main Web Application Controller
// ==========================================================================

import { Api } from './api.js';
import { initCropDoctor } from './cropDoctor.js';
import { initMandi } from './mandi.js';
import { initSoilHealth } from './soilHealth.js';
import { initAssistant } from './assistant.js';
import { initSchemes } from './schemes.js';
import { initWeather } from './weather.js';

document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  setupNavigation();
  loadFarmDashboard();
  setupModals();
  setupCreatorBadgeEffect();

  // Initialize all specific sub-modules
  initCropDoctor();
  initMandi();
  initSoilHealth();
  initAssistant();
  initSchemes();
  initWeather();
});

// 1. Theme Management (Dark / Light)
function setupTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('agri_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('agri_theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// 2. Tab Navigation & Routing
function setupNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const navLinks = document.querySelectorAll('.nav-link');

  function switchTab(tabId) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${tabId}`);
    });

    window.location.hash = tabId;
    window.scrollTo({ top: document.querySelector('.app-nav-tabs')?.offsetTop - 80 || 0, behavior: 'smooth' });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const tabId = href.substring(1);
        switchTab(tabId);
      }
    });
  });

  // Handle URL hash on load
  const currentHash = window.location.hash.substring(1);
  if (currentHash && document.getElementById(currentHash)) {
    switchTab(currentHash);
  }
}

// 3. Load Farm Dashboard & Dynamic Data
async function loadFarmDashboard() {
  const farmData = await Api.getFarm();
  if (!farmData) return;

  // Render crops in Dashboard & My Crops Tab
  renderCropsGrid(farmData.crops || []);

  // Render Tasks in Dashboard
  renderTasks(farmData.tasks || []);

  // Render Irrigation cards
  renderIrrigation(farmData.irrigationSchedule || []);

  // Render Community posts
  renderCommunity(farmData.communityPosts || []);
}

function renderCropsGrid(crops) {
  const dashboardCrops = document.getElementById('dashboardCropsList');
  const fullCropsGrid = document.getElementById('myCropsGrid');

  const html = crops.map(c => `
    <div class="card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px;">
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary-600); text-transform: uppercase;">
              ${c.cropType} • ${c.areaAcres} Acres
            </span>
            <h3 style="font-size: 1.15rem; margin-top: 2px;">${c.name}</h3>
          </div>
          <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary-600); background: var(--primary-100); padding: 4px 10px; border-radius: var(--radius-full);">
            ${c.healthScore}%
          </div>
        </div>

        <div style="margin: 12px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
            <span>Stage: <strong>${c.stage}</strong></span>
            <span>${c.stagePercent}%</span>
          </div>
          <div class="meter-bar">
            <div class="meter-fill" style="width: ${c.stagePercent}%;"></div>
          </div>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px;">
          💧 ${c.waterStatus}
        </p>
      </div>

      <div style="padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
        <span>🌾 Harvest: ${c.estimatedHarvest}</span>
        <span style="font-weight: 600;">Est: ${c.expectedYieldQuintal} Qtl</span>
      </div>
    </div>
  `).join('');

  if (dashboardCrops) dashboardCrops.innerHTML = html;
  if (fullCropsGrid) fullCropsGrid.innerHTML = html;
}

function renderTasks(tasks) {
  const tasksContainer = document.getElementById('dashboardTasksList');
  if (!tasksContainer) return;

  tasksContainer.innerHTML = tasks.map(t => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); margin-bottom: 8px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <input type="checkbox" class="task-checkbox" data-task-id="${t.id}" ${t.completed ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary-600);">
        <div>
          <span style="font-size: 0.9rem; font-weight: 500; ${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${t.title}</span>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${t.crop} • Due ${t.due}</div>
        </div>
      </div>
      <span class="severity-pill severity-${t.priority === 'High' ? 'Critical' : 'Moderate'}" style="font-size: 0.7rem; padding: 2px 8px;">
        ${t.priority}
      </span>
    </div>
  `).join('');

  // Bind checkbox events
  tasksContainer.querySelectorAll('.task-checkbox').forEach(box => {
    box.addEventListener('change', async () => {
      const taskId = box.getAttribute('data-task-id');
      await Api.toggleTask(taskId);
      loadFarmDashboard();
    });
  });
}

function renderIrrigation(schedules) {
  const irriContainer = document.getElementById('irrigationScheduleList');
  if (!irriContainer) return;

  irriContainer.innerHTML = schedules.map(s => `
    <div class="card" style="padding: 18px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="font-size: 2rem; background: var(--bg-accent); width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;">
          💧
        </div>
        <div>
          <h4 style="font-size: 1.05rem;">${s.crop}</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${s.plot} • ${s.method}</p>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 20px;">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Next Valve Run</span>
          <strong>${s.nextRun}</strong>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Water Volume</span>
          <strong style="color: var(--sky-600);">${s.waterVolumeLitres.toLocaleString()} L (${s.durationMinutes}m)</strong>
        </div>
        <span class="live-badge" style="background: var(--primary-100); color: var(--primary-800);">
          ${s.status}
        </span>
      </div>
    </div>
  `).join('');
}

function renderCommunity(posts) {
  const feed = document.getElementById('communityPostsFeed');
  if (!feed) return;

  feed.innerHTML = posts.map(p => `
    <div class="card" style="padding: 22px; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; border-radius: var(--radius-full); background: linear-gradient(135deg, var(--primary-600), var(--primary-800)); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem;">
            ${p.author[0]}
          </div>
          <div>
            <strong>${p.author}</strong>
            <span style="font-size: 0.75rem; background: var(--primary-100); color: var(--primary-800); padding: 2px 7px; border-radius: var(--radius-full); margin-left: 6px; font-weight: 600;">
              ${p.badge}
            </span>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.location} • ${p.timeAgo}</div>
          </div>
        </div>
      </div>

      <h3 style="font-size: 1.15rem; margin-bottom: 8px;">${p.title}</h3>
      <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">${p.content}</p>

      ${p.verifiedAnswer ? `
        <div style="background-color: var(--bg-accent); border-left: 4px solid var(--primary-600); padding: 12px 16px; border-radius: var(--radius-sm); margin-bottom: 14px;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-800); margin-bottom: 4px;">
            ✓ Agronomist Verified Solution:
          </div>
          <p style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.5;">${p.verifiedAnswer}</p>
        </div>
      ` : ''}

      <div style="display: flex; align-items: center; gap: 18px; font-size: 0.85rem; color: var(--text-muted); padding-top: 10px; border-top: 1px solid var(--border-subtle);">
        <button style="display: flex; align-items: center; gap: 6px; color: inherit; cursor: pointer;">
          👍 <span>${p.likes} Helpful</span>
        </button>
        <button style="display: flex; align-items: center; gap: 6px; color: inherit; cursor: pointer;">
          💬 <span>${p.answersCount} Farmer Replies</span>
        </button>
      </div>
    </div>
  `).join('');
}

// 4. Modals (Add Crop & Ask Question)
function setupModals() {
  const addCropModal = document.getElementById('addCropModal');
  const openAddCropBtns = document.querySelectorAll('.open-add-crop-btn');
  const closeAddCropBtn = document.getElementById('closeAddCropBtn');
  const addCropForm = document.getElementById('addCropForm');

  openAddCropBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (addCropModal) addCropModal.classList.add('open');
    });
  });

  if (closeAddCropBtn) {
    closeAddCropBtn.addEventListener('click', () => {
      addCropModal.classList.remove('open');
    });
  }

  if (addCropForm) {
    addCropForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: addCropForm.cropName.value,
        cropType: addCropForm.cropType.value,
        areaAcres: addCropForm.cropArea.value,
        stage: addCropForm.cropStage.value,
        expectedYieldQuintal: addCropForm.cropYield.value
      };

      await Api.addCrop(payload);
      addCropModal.classList.remove('open');
      addCropForm.reset();
      loadFarmDashboard();
    });
  }

  // Ask Community Modal
  const askModal = document.getElementById('askCommunityModal');
  const openAskBtn = document.getElementById('openAskCommunityBtn');
  const closeAskBtn = document.getElementById('closeAskCommunityBtn');
  const askForm = document.getElementById('askCommunityForm');

  if (openAskBtn && askModal) {
    openAskBtn.addEventListener('click', () => askModal.classList.add('open'));
  }
  if (closeAskBtn && askModal) {
    closeAskBtn.addEventListener('click', () => askModal.classList.remove('open'));
  }
  if (askForm) {
    askForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await Api.createPost({
        title: askForm.postTitle.value,
        content: askForm.postContent.value
      });
      askModal.classList.remove('open');
      askForm.reset();
      loadFarmDashboard();
    });
  }
}

// 5. Creator Badge Interactive Sparkle Effect
function setupCreatorBadgeEffect() {
  const badge = document.getElementById('creatorSignatureBadge');
  if (!badge) return;

  const particles = ['🌾', '✨', '🌱', '🌟', '💚', '🌽', '🍅'];

  badge.addEventListener('click', (e) => {
    const rect = badge.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top;

    for (let i = 0; i < 16; i++) {
      const p = document.createElement('span');
      p.innerText = particles[Math.floor(Math.random() * particles.length)];
      p.style.position = 'fixed';
      p.style.left = `${centerX}px`;
      p.style.top = `${centerY}px`;
      p.style.fontSize = `${16 + Math.random() * 16}px`;
      p.style.pointerEvents = 'none';
      p.style.zIndex = '9999';
      p.style.transition = 'all 1s cubic-bezier(0.1, 1, 0.1, 1)';
      p.style.transform = 'translate(-50%, -50%)';

      document.body.appendChild(p);

      const angle = (i / 16) * 360 + (Math.random() * 20 - 10);
      const dist = 60 + Math.random() * 90;
      const rad = (angle * Math.PI) / 180;
      const destX = Math.cos(rad) * dist;
      const destY = Math.sin(rad) * dist - 30;

      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.4) rotate(${Math.random() * 360}deg)`;
        p.style.opacity = '0';
      });

      setTimeout(() => p.remove(), 1100);
    }
  });
}

