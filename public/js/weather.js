// ==========================================================================
// AgriExpert AI — Precision Agronomy Weather & Spray Advisory Engine
// ==========================================================================

import { Api } from './api.js';

export function initWeather() {
  const weatherCityInput = document.getElementById('weatherCityInput');
  const weatherSearchBtn = document.getElementById('weatherSearchBtn');
  const weatherHeroBox = document.getElementById('weatherHeroCard');
  const weatherForecastGrid = document.getElementById('weatherForecastGrid');

  let currentCity = 'Karnal, Haryana';

  const AGRI_REGIONS = [
    { name: 'Karnal', label: '🌾 Karnal (Wheat/Rice)', query: 'Karnal, Haryana' },
    { name: 'Nashik', label: '🧅 Nashik (Onion/Grape)', query: 'Nashik, Maharashtra' },
    { name: 'Kolar', label: '🍅 Kolar (Vegetables)', query: 'Kolar, Karnataka' },
    { name: 'Ludhiana', label: '🌾 Ludhiana (PAU Hub)', query: 'Ludhiana, Punjab' },
    { name: 'Agra', label: '🥔 Agra (Potato/Mustard)', query: 'Agra, UP' },
    { name: 'Guntur', label: '🍚 Guntur (Chilli/Paddy)', query: 'Guntur, Andhra Pradesh' },
    { name: 'Rajkot', label: '🌿 Rajkot (Cotton)', query: 'Rajkot, Gujarat' }
  ];

  async function loadWeather(city = currentCity) {
    currentCity = city;
    if (weatherHeroBox) {
      weatherHeroBox.classList.add('loading-pulse');
    }

    const data = await Api.getWeather(city);
    if (weatherHeroBox) {
      weatherHeroBox.classList.remove('loading-pulse');
    }

    if (!data) return;

    const curr = data.current;
    const isSpraySafe = curr.sprayAdvisory.toLowerCase().includes('favorable');

    if (weatherHeroBox) {
      weatherHeroBox.innerHTML = `
        <div class="weather-hero-top" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="live-badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);">
                <span class="pulse-dot"></span> Live Field Climate Radar
              </span>
              <span style="font-size: 0.78rem; opacity: 0.85;">Updated: ${curr.lastUpdated || 'Just now'}</span>
            </div>
            <div class="weather-location" style="font-size: 1.4rem; font-weight: 800; letter-spacing: -0.01em;">
              📍 ${data.location}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div class="advisory-badge-pill ${isSpraySafe ? 'safe' : 'warning'}" style="font-size: 0.82rem; font-weight: 700; padding: 6px 14px; border-radius: var(--radius-full); background: ${isSpraySafe ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}; border: 1px solid ${isSpraySafe ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.5)'}; color: #fff;">
              ${isSpraySafe ? '✅ Safe Spray Window Active' : '⚠️ Postpone Chemical Spray'}
            </div>
            <button id="refreshWeatherBtn" class="btn btn-secondary" style="font-size: 0.76rem; padding: 6px 12px; background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); color: #fff;" title="Refresh live telemetry">
              🔄 Sync
            </button>
          </div>
        </div>

        <!-- Hero Temp & Condition Row -->
        <div class="weather-hero-main" style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 18px;">
          <div class="weather-temp" style="font-size: 3.2rem; font-weight: 900; line-height: 1;">${curr.temperature}°C</div>
          <div>
            <div class="weather-condition-text" style="font-size: 1.25rem; font-weight: 700;">${curr.condition}</div>
            <div style="font-size: 0.88rem; opacity: 0.85; margin-top: 4px;">
              Feels like ${curr.feelsLike}°C • Dew Point: ${curr.dewPoint} • Barometer: ${curr.barometer}
            </div>
            <div style="font-size: 0.82rem; margin-top: 4px; color: ${isSpraySafe ? '#a7f3d0' : '#fde68a'}; font-weight: 600;">
              🌾 ${curr.sprayAdvisory}
            </div>
          </div>
        </div>

        <!-- 4-Sensor Micro-Climate Grid -->
        <div class="weather-details-row">
          <div class="weather-detail-item">
            <span class="label">Relative Humidity</span>
            <span class="value">${curr.humidity}</span>
            <span style="font-size: 0.68rem; opacity: 0.75;">Optimal: 60-70%</span>
          </div>
          <div class="weather-detail-item">
            <span class="label">Wind Velocity & Dir</span>
            <span class="value">${curr.windSpeed}</span>
            <span style="font-size: 0.68rem; opacity: 0.75;">${curr.windDirection}</span>
          </div>
          <div class="weather-detail-item">
            <span class="label">Soil Moisture Index</span>
            <span class="value">${curr.soilMoisture.split(' ')[0]}</span>
            <span style="font-size: 0.68rem; opacity: 0.75;">Root zone capacity</span>
          </div>
          <div class="weather-detail-item">
            <span class="label">UV & Heat Index</span>
            <span class="value">${curr.uvIndex}</span>
            <span style="font-size: 0.68rem; opacity: 0.75;">${curr.heatStress}</span>
          </div>
        </div>

        <!-- Quick Regional Crop Belt Switchers -->
        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.76rem; font-weight: 700; opacity: 0.9;">Switch Region:</span>
          ${AGRI_REGIONS.map(reg => `
            <button class="region-chip ${currentCity.toLowerCase().includes(reg.name.toLowerCase()) ? 'active' : ''}" data-query="${reg.query}" style="padding: 4px 10px; font-size: 0.75rem; border-radius: var(--radius-full); background: ${currentCity.toLowerCase().includes(reg.name.toLowerCase()) ? '#fff' : 'rgba(255,255,255,0.18)'}; color: ${currentCity.toLowerCase().includes(reg.name.toLowerCase()) ? 'var(--primary-900)' : '#fff'}; border: 1px solid rgba(255,255,255,0.3); font-weight: 600; cursor: pointer; transition: all var(--transition-fast);">
              ${reg.label}
            </button>
          `).join('')}
        </div>
      `;

      // Wire refresh button
      const refreshBtn = document.getElementById('refreshWeatherBtn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadWeather(currentCity));
      }

      // Wire region chips
      weatherHeroBox.querySelectorAll('.region-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const query = chip.getAttribute('data-query');
          if (query) loadWeather(query);
        });
      });
    }

    // 5-Day Forecast Grid
    if (weatherForecastGrid && data.forecast) {
      weatherForecastGrid.innerHTML = data.forecast.map(f => {
        const isRainy = f.condition.includes('Rain') || f.condition.includes('Shower');
        const isSunny = f.condition.includes('Sun') || f.condition.includes('Clear');
        return `
          <div class="card" style="padding: 14px 12px; text-align: center; border-radius: var(--radius-lg); transition: transform var(--transition-fast);">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">${f.day}</div>
            <div style="font-size: 2rem; margin-bottom: 6px;">
              ${isSunny ? '☀️' : (isRainy ? '🌧️' : '⛅')}
            </div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary-700);">
              ${f.tempMax}°C <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">${f.tempMin}°C</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--sky-600); margin: 6px 0; font-weight: 700;">
              💧 ${f.rainChance}% Rain
            </div>
            <div style="font-size: 0.72rem; color: var(--text-secondary); line-height: 1.3; background: var(--bg-surface-elevated); padding: 6px 4px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-top: 4px;">
              ${f.advisory}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (weatherSearchBtn && weatherCityInput) {
    weatherSearchBtn.addEventListener('click', () => {
      const city = weatherCityInput.value.trim();
      if (city) loadWeather(city);
    });

    weatherCityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const city = weatherCityInput.value.trim();
        if (city) loadWeather(city);
      }
    });
  }

  loadWeather();
}
