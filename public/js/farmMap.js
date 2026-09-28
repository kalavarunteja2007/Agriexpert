// ==========================================================================
// AgriExpert AI — Google Maps & Live Farm Satellite Telemetry Module
// ==========================================================================

import { Api } from './api.js';

// State management for both Map instances (Dashboard Map + Dedicated Tab Map)
let dashMap = null;
let dashMarker = null;
let dashCircle = null;
let dashTileLayer = null;

let tabMap = null;
let tabMarker = null;
let tabCircle = null;
let tabTileLayer = null;

let currentLayerType = 'hybrid';
let currentPosition = {
  lat: 29.6857,
  lng: 76.9905,
  name: 'Karnal Agricultural Research Zone, Haryana'
};

// Google Tile Server Endpoints
const GOOGLE_TILE_URLS = {
  hybrid: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  satellite: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  terrain: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
  roadmap: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
};

// Key Agricultural Hubs across India
const AGRI_HUBS = {
  karnal: { lat: 29.6857, lng: 76.9905, name: 'Karnal (Wheat & Basmati Rice Belt, Haryana)' },
  nashik: { lat: 19.9975, lng: 73.7898, name: 'Nashik (Onion & Grape Belt, Maharashtra)' },
  kolar: { lat: 13.1367, lng: 78.1292, name: 'Kolar (Tomato & Vegetable APMC Hub, Karnataka)' },
  rajkot: { lat: 22.3039, lng: 70.8022, name: 'Rajkot (Cotton & Groundnut Belt, Gujarat)' },
  agra: { lat: 27.1767, lng: 78.0081, name: 'Agra (Potato & Mustard Belt, UP)' },
  guntur: { lat: 16.3067, lng: 80.4365, name: 'Guntur (Chilli & Rice Belt, Andhra Pradesh)' },
  ludhiana: { lat: 30.9010, lng: 75.8573, name: 'Ludhiana (PAU Research & Wheat Belt, Punjab)' },
  indore: { lat: 22.7196, lng: 75.8577, name: 'Indore (Soybean & Wheat Mandi Hub, MP)' }
};

// Custom Farm Marker Icon with glowing pulse ring
function createFarmMarkerIcon() {
  if (!window.L) return null;
  return window.L.divIcon({
    className: 'custom-pin-wrap',
    html: `
      <div class="farm-map-pin" title="Active Farm Plot">
        <span class="pin-content">🌱</span>
        <span class="pin-pulse-ring"></span>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42]
  });
}

// Entry Point
export async function initFarmMap() {
  const config = await Api.getConfig();
  const apiKey = config.googleMapsApiKey || '';

  // 1. Initialize Dashboard Map & Tab Map immediately
  initDashboardMap();
  initTabMap();

  // 2. Setup toolbar controls (Search, GPS, Hubs, Layers)
  setupMapControls();

  // 3. Load initial telemetry
  updateCoordinatesDisplay(currentPosition.lat, currentPosition.lng);
  fetchLocationWeather(currentPosition.lat, currentPosition.lng, currentPosition.name);

  // 4. Background load Google Maps JS script for Google Geocoding / Places service
  loadGoogleMapsScript(apiKey);

  // 5. Invalidate sizes on tab switch or window resize
  window.addEventListener('resize', handleMapResize);
  document.querySelectorAll('.tab-btn, .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(handleMapResize, 200);
    });
  });
}

function handleMapResize() {
  if (dashMap) dashMap.invalidateSize();
  if (tabMap) tabMap.invalidateSize();
}

// Initialize Map on Main Dashboard
function initDashboardMap() {
  const canvas = document.getElementById('dashboardGoogleMapCanvas');
  if (!canvas || !window.L || dashMap) return;

  try {
    dashMap = window.L.map(canvas, {
      center: [currentPosition.lat, currentPosition.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    dashTileLayer = window.L.tileLayer(GOOGLE_TILE_URLS[currentLayerType], {
      subdomains: ['0', '1', '2', '3'],
      attribution: 'Google Maps &copy; Satellite Imagery',
      maxZoom: 20
    }).addTo(dashMap);

    const pinIcon = createFarmMarkerIcon();
    dashMarker = window.L.marker([currentPosition.lat, currentPosition.lng], {
      icon: pinIcon,
      draggable: true,
      title: 'Active Farm Plot'
    }).addTo(dashMap);

    dashCircle = window.L.circle([currentPosition.lat, currentPosition.lng], {
      radius: 400,
      color: '#059669',
      fillColor: '#10b981',
      fillOpacity: 0.22,
      weight: 2
    }).addTo(dashMap);

    // Click on Dashboard Map to relocate farm
    dashMap.on('click', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      moveFarmLocation(lat, lng, `Field Coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
    });

    // Drag marker on Dashboard Map
    dashMarker.on('dragend', (e) => {
      const lat = e.target.getLatLng().lat;
      const lng = e.target.getLatLng().lng;
      moveFarmLocation(lat, lng, `Field Coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
    });

    setTimeout(() => {
      if (dashMap) dashMap.invalidateSize();
    }, 250);

  } catch (err) {
    console.error('Error initializing Dashboard Map:', err);
  }
}

// Initialize Map on Dedicated Tab
function initTabMap() {
  const canvas = document.getElementById('googleMapCanvas');
  if (!canvas || !window.L || tabMap) return;

  try {
    tabMap = window.L.map(canvas, {
      center: [currentPosition.lat, currentPosition.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    tabTileLayer = window.L.tileLayer(GOOGLE_TILE_URLS[currentLayerType], {
      subdomains: ['0', '1', '2', '3'],
      attribution: 'Google Maps &copy; Satellite Imagery',
      maxZoom: 20
    }).addTo(tabMap);

    const pinIcon = createFarmMarkerIcon();
    tabMarker = window.L.marker([currentPosition.lat, currentPosition.lng], {
      icon: pinIcon,
      draggable: true,
      title: 'Active Farm Plot'
    }).addTo(tabMap);

    tabCircle = window.L.circle([currentPosition.lat, currentPosition.lng], {
      radius: 400,
      color: '#059669',
      fillColor: '#10b981',
      fillOpacity: 0.22,
      weight: 2
    }).addTo(tabMap);

    tabMap.on('click', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      moveFarmLocation(lat, lng, `Field Coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
    });

    tabMarker.on('dragend', (e) => {
      const lat = e.target.getLatLng().lat;
      const lng = e.target.getLatLng().lng;
      moveFarmLocation(lat, lng, `Field Coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
    });

  } catch (err) {
    console.error('Error initializing Tab Map:', err);
  }
}

// Move farm location and synchronize both maps & telemetry
export async function moveFarmLocation(lat, lng, locationName = '') {
  currentPosition.lat = lat;
  currentPosition.lng = lng;
  currentPosition.name = locationName || `Field Coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;

  updateCoordinatesDisplay(lat, lng);

  // Sync Dashboard Map
  if (dashMap && dashMarker) {
    dashMarker.setLatLng([lat, lng]);
    if (dashCircle) dashCircle.setLatLng([lat, lng]);
    dashMap.setView([lat, lng], dashMap.getZoom() || 14, { animate: true });
  }

  // Sync Tab Map
  if (tabMap && tabMarker) {
    tabMarker.setLatLng([lat, lng]);
    if (tabCircle) tabCircle.setLatLng([lat, lng]);
    tabMap.setView([lat, lng], tabMap.getZoom() || 14, { animate: true });
  }

  // Open Popup on active markers
  openMarkerPopup();

  // Fetch coordinates-based agricultural micro-climate telemetry
  await fetchLocationWeather(lat, lng, currentPosition.name);
}

function openMarkerPopup() {
  const popupHtml = `
    <div style="font-family: inherit; padding: 4px 6px;">
      <h4 style="margin: 0 0 4px; color: #047857; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
        <span>📍</span> Active Farm Plot
      </h4>
      <div style="font-size: 0.78rem; color: #059669; font-weight: 600; margin-bottom: 4px;">
        ${currentPosition.name}
      </div>
      <div style="font-size: 0.72rem; color: #6b7280;">
        Lat: ${currentPosition.lat.toFixed(4)}°N • Lng: ${currentPosition.lng.toFixed(4)}°E
      </div>
    </div>
  `;

  if (dashMarker) {
    dashMarker.bindPopup(popupHtml).openPopup();
  }
  if (tabMarker) {
    tabMarker.bindPopup(popupHtml);
  }
}

// Fetch coordinates-based telemetry and update both panels
async function fetchLocationWeather(lat, lng, city = '') {
  const dashPanel = document.getElementById('dashMapWeatherPanel');
  const tabPanel = document.getElementById('mapWeatherPanel');

  if (dashPanel) dashPanel.classList.add('loading-pulse');
  if (tabPanel) tabPanel.classList.add('loading-pulse');

  const data = await Api.getWeather({ lat, lng, city });

  if (dashPanel) dashPanel.classList.remove('loading-pulse');
  if (tabPanel) tabPanel.classList.remove('loading-pulse');

  if (!data) return;

  renderWeatherPanel(data, 'dashMapWeatherPanel');
  renderWeatherPanel(data, 'mapWeatherPanel');
}

// Render Telemetry Content
function renderWeatherPanel(data, panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const curr = data.current;
  const isSpraySafe = curr.sprayAdvisory.toLowerCase().includes('favorable');

  panel.innerHTML = `
    <div>
      <div class="map-weather-header">
        <div>
          <div class="map-location-tag">📍 Pinpoint Field Telemetry</div>
          <h3 class="map-weather-location" style="font-size: 1.1rem; margin: 4px 0 2px;">${data.location}</h3>
          <span class="map-coords-subtext" style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">
            Coordinates: ${currentPosition.lat.toFixed(4)}°N, ${currentPosition.lng.toFixed(4)}°E
          </span>
        </div>
        <div class="map-weather-badge ${isSpraySafe ? 'safe' : 'warning'}" style="margin-top: 4px;">
          ${isSpraySafe ? '✅ Safe to Spray' : '⚠️ Avoid Spraying'}
        </div>
      </div>

      <!-- Main Temp & Spray Radar -->
      <div class="map-weather-hero-row" style="margin: 12px 0;">
        <div class="map-temp-wrap" style="display: flex; align-items: center; gap: 12px;">
          <span class="map-temp-number" style="font-size: 2.2rem; font-weight: 800; color: var(--primary-700);">${curr.temperature}°C</span>
          <div class="map-temp-meta">
            <div class="map-condition-title" style="font-weight: 700; font-size: 0.95rem;">${curr.condition}</div>
            <div class="map-feels-like" style="font-size: 0.78rem; color: var(--text-muted);">
              Feels like ${curr.feelsLike}°C • Dew Point: ${curr.dewPoint}
            </div>
          </div>
        </div>
      </div>

      <!-- Spray Window & Agronomic Advisory -->
      <div class="map-advisory-box ${isSpraySafe ? 'advisory-green' : 'advisory-amber'}" style="padding: 10px 12px; border-radius: var(--radius-md); margin-bottom: 14px;">
        <div class="advisory-title">🌾 Spray Window & Micro-Climate Verdict:</div>
        <div class="advisory-body">${curr.sprayAdvisory}</div>
      </div>

      <!-- 4-Metric Sensor Grid -->
      <div class="map-metrics-grid">
        <div class="metric-card">
          <span class="metric-icon">💨</span>
          <div>
            <div class="metric-label">Wind Velocity</div>
            <div class="metric-val">${curr.windSpeed}</div>
            <span class="metric-sub">${curr.windDirection}</span>
          </div>
        </div>
        <div class="metric-card">
          <span class="metric-icon">💧</span>
          <div>
            <div class="metric-label">Relative Humidity</div>
            <div class="metric-val">${curr.humidity}</div>
            <span class="metric-sub">Optimal: 60-70%</span>
          </div>
        </div>
        <div class="metric-card">
          <span class="metric-icon">🌱</span>
          <div>
            <div class="metric-label">Soil Moisture Index</div>
            <div class="metric-val">${curr.soilMoisture.split(' ')[0]}</div>
            <span class="metric-sub">Root zone absorption</span>
          </div>
        </div>
        <div class="metric-card">
          <span class="metric-icon">☀️</span>
          <div>
            <div class="metric-label">Thermal Index</div>
            <div class="metric-val">${curr.uvIndex}</div>
            <span class="metric-sub">${curr.heatStress}</span>
          </div>
        </div>
      </div>

      <!-- 5-Day Precision Outlook -->
      <div style="margin-top: 14px;">
        <h4 style="font-size: 0.88rem; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <span>📅 5-Day Coordinates Outlook</span>
          <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 400;">Updated: ${curr.lastUpdated}</span>
        </h4>
        <div class="map-forecast-scroller">
          ${data.forecast.map(f => `
            <div class="map-forecast-item">
              <span class="forecast-day">${f.day}</span>
              <span class="forecast-icon">${f.icon || '⛅'}</span>
              <span class="forecast-temps">${f.tempMax}° / ${f.tempMin}°</span>
              <span class="forecast-rain">💧 ${f.rainChance}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Farm Action Buttons -->
    <div class="map-actions-row" style="margin-top: 16px;">
      <button class="btn btn-primary set-active-field-btn" style="flex: 1; font-size: 0.82rem; padding: 8px 10px;">
        🌾 Set as Active Field
      </button>
      <button class="btn btn-secondary ask-ai-field-btn" style="flex: 1; font-size: 0.82rem; padding: 8px 10px;">
        🤖 Ask AI About Plot
      </button>
    </div>
  `;

  // Bind Actions for this rendered panel
  const saveBtn = panel.querySelector('.set-active-field-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      alert(`✅ Location saved! "${data.location}" (${currentPosition.lat.toFixed(4)}°N, ${currentPosition.lng.toFixed(4)}°E) has been designated as your primary active farm plot.`);
    });
  }

  const askAiBtn = panel.querySelector('.ask-ai-field-btn');
  if (askAiBtn) {
    askAiBtn.addEventListener('click', () => {
      const drawer = document.getElementById('floatingChatDrawer');
      const drawerInput = document.getElementById('drawerChatInput');
      const drawerSendBtn = document.getElementById('drawerSendBtn');
      if (drawer) drawer.classList.add('open');
      if (drawerInput && drawerSendBtn) {
        drawerInput.value = `What are the best crop management and spray recommendations for my field at ${data.location} (${currentPosition.lat.toFixed(4)}°N, ${currentPosition.lng.toFixed(4)}°E)? Current temperature is ${curr.temperature}°C with ${curr.windSpeed} wind.`;
        drawerSendBtn.click();
      }
    });
  }
}

function updateCoordinatesDisplay(lat, lng) {
  const dashBadge = document.getElementById('dashMapCoordsBadge');
  if (dashBadge) {
    dashBadge.textContent = `📍 ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  }
  const tabBadge = document.getElementById('mapCoordsBadge');
  if (tabBadge) {
    tabBadge.textContent = `📍 Lat: ${lat.toFixed(4)}°N | Lng: ${lng.toFixed(4)}°E`;
  }
}

// Map Controls Setup
function setupMapControls() {
  // Search inputs (Dashboard & Tab)
  setupSearchControl('dashMapSearchInput', 'dashMapSearchBtn');
  setupSearchControl('mapSearchInput', 'mapSearchBtn');

  // GPS buttons (Dashboard & Tab)
  setupGpsControl('dashMapGpsBtn');
  setupGpsControl('mapGpsBtn');

  // Quick Hub buttons (Dashboard & Tab)
  document.querySelectorAll('.dash-hub, .map-hub-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const hubKey = btn.getAttribute('data-hub');
      if (AGRI_HUBS[hubKey]) {
        const hub = AGRI_HUBS[hubKey];
        // Sync active class across both hub bars
        document.querySelectorAll('.dash-hub, .map-hub-chip').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-hub') === hubKey);
        });
        moveFarmLocation(hub.lat, hub.lng, hub.name);
      }
    });
  });

  // Layer Type Switchers (Hybrid, Satellite, Terrain, Roadmap)
  document.querySelectorAll('.dash-type-btn, .map-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      if (!GOOGLE_TILE_URLS[type]) return;
      currentLayerType = type;

      // Sync active class across both type button sets
      document.querySelectorAll('.dash-type-btn, .map-type-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-type') === type);
      });

      // Update Dashboard Map layer
      if (dashMap && dashTileLayer) {
        dashMap.removeLayer(dashTileLayer);
        dashTileLayer = window.L.tileLayer(GOOGLE_TILE_URLS[type], {
          subdomains: ['0', '1', '2', '3'],
          attribution: 'Google Maps &copy; Satellite Imagery',
          maxZoom: 20
        }).addTo(dashMap);
      }

      // Update Tab Map layer
      if (tabMap && tabTileLayer) {
        tabMap.removeLayer(tabTileLayer);
        tabTileLayer = window.L.tileLayer(GOOGLE_TILE_URLS[type], {
          subdomains: ['0', '1', '2', '3'],
          attribution: 'Google Maps &copy; Satellite Imagery',
          maxZoom: 20
        }).addTo(tabMap);
      }
    });
  });
}

function setupSearchControl(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);

  async function handleSearch() {
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    // Check if coordinates format: e.g. "29.68, 76.99"
    const coordMatch = query.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      moveFarmLocation(lat, lng, `Coordinates (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
      return;
    }

    // Check pre-configured hubs
    const qLower = query.toLowerCase();
    for (const key in AGRI_HUBS) {
      if (qLower.includes(key)) {
        const hub = AGRI_HUBS[key];
        moveFarmLocation(hub.lat, hub.lng, hub.name);
        return;
      }
    }

    // Geocode via Google Geocoder if loaded
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: query + ', India' }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          moveFarmLocation(loc.lat(), loc.lng(), results[0].formatted_address);
          return;
        }
        geocodingFallback(query);
      });
    } else {
      geocodingFallback(query);
    }
  }

  if (btn) btn.addEventListener('click', handleSearch);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }
}

async function geocodingFallback(query) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}`);
    const data = await res.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      moveFarmLocation(lat, lng, data[0].display_name.split(',').slice(0, 2).join(','));
      return;
    }
  } catch (err) {
    console.warn('Fallback geocoding error:', err);
  }
  // If geocoding failed, query weather directly for city name
  fetchLocationWeather(currentPosition.lat, currentPosition.lng, query);
}

function setupGpsControl(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    const origText = btn.innerHTML;
    btn.innerHTML = '⏳ Locating...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        btn.innerHTML = origText;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        moveFarmLocation(lat, lng, 'My Farm Device Location (GPS)');
      },
      (err) => {
        btn.innerHTML = origText;
        alert('GPS permission not granted or location unavailable. Retaining current agricultural coordinates.');
      },
      { timeout: 8000 }
    );
  });
}

function loadGoogleMapsScript(apiKey) {
  if (window.google && window.google.maps) return;

  const script = document.createElement('script');
  script.id = 'google-maps-api-script';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry&loading=async`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}
