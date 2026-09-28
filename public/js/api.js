// ==========================================================================
// AgriExpert AI — Client API Service Module
// ==========================================================================

const API_BASE = window.location.origin;

export const Api = {
  // 0. App Config & Google Maps Keys
  async getConfig() {
    try {
      const res = await fetch(`${API_BASE}/api/config`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch config:', err);
      return { googleMapsApiKey: '' };
    }
  },

  // 1. Weather (City name or Coordinates)
  async getWeather(query = 'Karnal, Haryana') {
    try {
      let url = `${API_BASE}/api/weather`;
      if (typeof query === 'string') {
        url += `?city=${encodeURIComponent(query)}`;
      } else if (typeof query === 'object' && query !== null) {
        const params = new URLSearchParams();
        if (query.city) params.append('city', query.city);
        if (query.lat !== undefined && query.lat !== null) params.append('lat', query.lat);
        if (query.lng !== undefined && query.lng !== null) params.append('lng', query.lng);
        url += `?${params.toString()}`;
      }
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      return null;
    }
  },

  // 2. Mandi Market Prices
  async getMandiPrices({ commodity = 'All', state = 'All', search = '' } = {}) {
    try {
      const params = new URLSearchParams();
      if (commodity && commodity !== 'All') params.append('commodity', commodity);
      if (state && state !== 'All') params.append('state', state);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/api/mandi-prices?${params.toString()}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch mandi prices:', err);
      return { data: [] };
    }
  },

  // 3. AI Crop Doctor / Disease Diagnosis
  async diagnoseLeaf(formData) {
    try {
      const res = await fetch(`${API_BASE}/api/diagnose`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to diagnose leaf:', err);
      return { success: false, message: 'Diagnostic engine unavailable' };
    }
  },

  // 4. AI Chat Assistant
  async sendChat(message, language = 'en', history = [], context = {}) {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language, history, context })
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to send chat:', err);
      return { reply: 'Sorry, the agricultural intelligence server is momentarily unreachable. Please try again.', chips: [] };
    }
  },

  // 5. Farm Management
  async getFarm() {
    try {
      const res = await fetch(`${API_BASE}/api/farm`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch farm data:', err);
      return null;
    }
  },

  async addCrop(cropData) {
    try {
      const res = await fetch(`${API_BASE}/api/crops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cropData)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to add crop:', err);
      return { success: false };
    }
  },

  async toggleTask(taskId) {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      return { success: false };
    }
  },

  async addTask(taskData) {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to add task:', err);
      return { success: false };
    }
  },

  // 6. Soil Health & Dosage Engine
  async calculateSoil(soilData) {
    try {
      const res = await fetch(`${API_BASE}/api/soil-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(soilData)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to calculate soil report:', err);
      return { success: false };
    }
  },

  // 7. Government Schemes
  async getSchemes(category = 'All', search = '') {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/api/schemes?${params.toString()}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
      return { data: [] };
    }
  },

  // 8. Community Forum
  async getCommunityPosts() {
    try {
      const res = await fetch(`${API_BASE}/api/community/posts`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch community posts:', err);
      return [];
    }
  },

  async createPost(postData) {
    try {
      const res = await fetch(`${API_BASE}/api/community/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to create post:', err);
      return { success: false };
    }
  }
};
