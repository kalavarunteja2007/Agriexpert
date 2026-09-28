// ==========================================================================
// AgriExpert AI — Conversational Agronomist & Needs Understanding Chatbot
// ==========================================================================

import { Api } from './api.js';

export function initAssistant() {
  // Elements for Tab Chat
  const tabMessages = document.getElementById('chatMessages');
  const tabInput = document.getElementById('chatInput');
  const tabSendBtn = document.getElementById('chatSendBtn');
  const tabVoiceBtn = document.getElementById('chatVoiceBtn');
  const tabChipsContainer = document.getElementById('chatChipsContainer');
  const tabLangSelect = document.getElementById('assistantLangSelect');

  // Elements for Floating Drawer Chat
  const floatingLauncher = document.getElementById('floatingAiLauncher');
  const floatingDrawer = document.getElementById('floatingChatDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const drawerMessages = document.getElementById('drawerMessages');
  const drawerInput = document.getElementById('drawerChatInput');
  const drawerSendBtn = document.getElementById('drawerSendBtn');
  const drawerVoiceBtn = document.getElementById('drawerVoiceBtn');
  const drawerChipsContainer = document.getElementById('drawerChipsContainer');
  const drawerLangSelect = document.getElementById('drawerLangSelect');

  // Floating Drawer Open/Close controls
  if (floatingLauncher && floatingDrawer) {
    floatingLauncher.addEventListener('click', () => {
      floatingDrawer.classList.toggle('open');
      if (floatingDrawer.classList.contains('open') && drawerInput) {
        setTimeout(() => drawerInput.focus(), 200);
      }
    });
  }

  if (closeDrawerBtn && floatingDrawer) {
    closeDrawerBtn.addEventListener('click', () => {
      floatingDrawer.classList.remove('open');
    });
  }

  // Language sync
  if (tabLangSelect && drawerLangSelect) {
    tabLangSelect.addEventListener('change', () => {
      drawerLangSelect.value = tabLangSelect.value;
    });
    drawerLangSelect.addEventListener('change', () => {
      tabLangSelect.value = drawerLangSelect.value;
    });
  }

  // Speech Synthesis setup
  let synth = window.speechSynthesis;

  function speakText(text) {
    if (!synth) return;
    synth.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').slice(0, 350);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    synth.speak(utterance);
  }

  // Speech Recognition (Voice Input) setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let activeVoiceTarget = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      if (activeVoiceTarget === 'tab' && tabInput) {
        tabInput.value = speechToText;
        processUserMessage(speechToText);
      } else if (activeVoiceTarget === 'drawer' && drawerInput) {
        drawerInput.value = speechToText;
        processUserMessage(speechToText);
      }
      resetVoiceButtons();
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      resetVoiceButtons();
    };

    recognition.onend = () => {
      resetVoiceButtons();
    };
  }

  function startVoiceInput(target, btn) {
    if (!recognition) {
      alert('Voice input is supported in Google Chrome and Microsoft Edge browsers.');
      return;
    }
    activeVoiceTarget = target;
    const currentLang = (drawerLangSelect ? drawerLangSelect.value : 'en') === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.lang = currentLang;
    if (btn) btn.classList.add('btn-amber');
    recognition.start();
  }

  function resetVoiceButtons() {
    if (tabVoiceBtn) tabVoiceBtn.classList.remove('btn-amber');
    if (drawerVoiceBtn) drawerVoiceBtn.classList.remove('btn-amber');
  }

  if (tabVoiceBtn) {
    tabVoiceBtn.addEventListener('click', () => startVoiceInput('tab', tabVoiceBtn));
  }
  if (drawerVoiceBtn) {
    drawerVoiceBtn.addEventListener('click', () => startVoiceInput('drawer', drawerVoiceBtn));
  }

  // Multi-turn Conversational Memory & Context
  let chatHistory = [];
  let chatContext = {};

  // Main Message Processor
  async function processUserMessage(rawText) {
    const text = (rawText || (tabInput && tabInput.value) || (drawerInput && drawerInput.value) || '').trim();
    if (!text) return;

    if (tabInput) tabInput.value = '';
    if (drawerInput) drawerInput.value = '';

    // Record user turn in memory
    chatHistory.push({ role: 'user', content: text });

    // Render user message on both containers
    renderMessage('user', text);

    // Render typing indicator on both containers
    showTypingIndicators();

    const currentLang = drawerLangSelect ? drawerLangSelect.value : (tabLangSelect ? tabLangSelect.value : 'en');
    const res = await Api.sendChat(text, currentLang, chatHistory, chatContext);

    removeTypingIndicators();

    // Update session context from server
    if (res.context) {
      chatContext = { ...chatContext, ...res.context };
    }

    // Record assistant turn in memory
    if (res.reply) {
      chatHistory.push({ role: 'assistant', content: res.reply });
    }

    // Render AI reply with chips, action, and intent badge
    renderMessage('bot', res.reply || 'No response available.', res.chips || [], res.action, res.intentBadge);
  }

  function showTypingIndicators() {
    const typingHtml = `
      <div class="message-row bot bot-typing-row">
        <div class="chat-avatar">🌱</div>
        <div class="msg-bubble" style="opacity: 0.85; font-style: italic; display: flex; align-items: center; gap: 8px;">
          <span>🌾 Understanding your field query...</span>
        </div>
      </div>
    `;
    if (tabMessages) {
      const el = document.createElement('div');
      el.innerHTML = typingHtml;
      tabMessages.appendChild(el.firstElementChild);
      tabMessages.scrollTop = tabMessages.scrollHeight;
    }
    if (drawerMessages) {
      const el = document.createElement('div');
      el.innerHTML = typingHtml;
      drawerMessages.appendChild(el.firstElementChild);
      drawerMessages.scrollTop = drawerMessages.scrollHeight;
    }
  }

  function removeTypingIndicators() {
    document.querySelectorAll('.bot-typing-row').forEach(el => el.remove());
  }

  function renderMessage(sender, text, chips = [], action = null, intentBadge = null) {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n-/g, '<br>•');

    let actionBtnHtml = '';
    if (action && action.type === 'NAVIGATE' && action.tab) {
      const tabLabels = {
        'farm-map': '🗺️ Open Google Maps Radar',
        'crop-doctor': '🩺 Open AI Crop Doctor',
        'mandi': '💰 Open Mandi Live Rates',
        'soil': '🧪 Open Soil Health Doctor',
        'schemes': '🏛️ View Government Schemes',
        'irrigation': '💧 Open Irrigation Planner',
        'dashboard': '📊 View Farm Dashboard'
      };
      const label = tabLabels[action.tab] || `Open ${action.tab}`;
      actionBtnHtml = `
        <div style="margin-top: 10px;">
          <button class="chat-action-btn" data-target-tab="${action.tab}">
            ${label} ↗
          </button>
        </div>
      `;
    }

    let intentBadgeHtml = '';
    if (intentBadge && sender === 'bot') {
      intentBadgeHtml = `
        <div class="msg-intent-tag">
          <span>${intentBadge}</span>
        </div>
      `;
    }

    const messageHtml = sender === 'bot' ? `
      <div class="chat-avatar">🌱</div>
      <div style="max-width: 88%;">
        <div class="msg-bubble">
          ${intentBadgeHtml}
          ${formattedText}
          ${actionBtnHtml}
          <div style="margin-top: 8px; display: flex; align-items: center; justify-content: flex-end;">
            <button class="speak-btn" title="Listen to response" style="font-size: 0.8rem; color: var(--primary-600); cursor: pointer; padding: 2px 6px;">
              🔊 Listen
            </button>
          </div>
        </div>
        <div class="msg-time">${time}</div>
      </div>
    ` : `
      <div>
        <div class="msg-bubble">${formattedText}</div>
        <div class="msg-time" style="text-align: right;">${time}</div>
      </div>
    `;

    function appendTo(container) {
      if (!container) return;
      const row = document.createElement('div');
      row.className = `message-row ${sender}`;
      row.innerHTML = messageHtml;

      // Bind listen button
      const speakBtn = row.querySelector('.speak-btn');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => speakText(text));
      }

      // Bind action navigation button
      const actionBtn = row.querySelector('.chat-action-btn');
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          const tab = actionBtn.getAttribute('data-target-tab');
          if (floatingDrawer) floatingDrawer.classList.remove('open');
          const targetTabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
          if (targetTabBtn) targetTabBtn.click();
        });
      }

      container.appendChild(row);
      container.scrollTop = container.scrollHeight;
    }

    appendTo(tabMessages);
    appendTo(drawerMessages);

    // Update chips on both containers
    if (chips && chips.length > 0) {
      renderChips(tabChipsContainer, chips);
      renderChips(drawerChipsContainer, chips);
    }
  }

  function renderChips(container, chips) {
    if (!container) return;
    container.innerHTML = chips.map(c => `
      <div class="chat-chip">${c}</div>
    `).join('');

    container.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        processUserMessage(chip.innerText);
      });
    });
  }

  // Bind send clicks and Enter key on Tab Chat
  if (tabSendBtn) tabSendBtn.addEventListener('click', () => processUserMessage());
  if (tabInput) {
    tabInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') processUserMessage();
    });
  }

  // Bind send clicks and Enter key on Floating Drawer Chat
  if (drawerSendBtn) drawerSendBtn.addEventListener('click', () => processUserMessage());
  if (drawerInput) {
    drawerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') processUserMessage();
    });
  }

  // Initial chips binding
  if (tabChipsContainer) {
    tabChipsContainer.querySelectorAll('.chat-chip').forEach(c => {
      c.addEventListener('click', () => processUserMessage(c.innerText));
    });
  }
  if (drawerChipsContainer) {
    drawerChipsContainer.querySelectorAll('.chat-chip').forEach(c => {
      c.addEventListener('click', () => processUserMessage(c.innerText));
    });
  }
}
