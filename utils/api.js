/**
 * API Utility Functions
 * Handles all external API calls
 */

import { getGeminiApiKey } from './index.js';
import { API_ENDPOINTS } from './constants.js';

// Chrome Identity API
export async function getAuthToken(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) =>
      chrome.runtime.lastError
        ? reject(chrome.runtime.lastError)
        : resolve(token)
    );
  });
}

export function removeCachedAuthToken(token) {
  return new Promise((resolve) =>
    chrome.identity.removeCachedAuthToken({ token }, resolve)
  );
}

// Google APIs
export async function fetchUserInfo(token) {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: { Authorization: 'Bearer ' + token },
    }
  );
  return response.json();
}

export async function revokeToken(token) {
  return fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
}

// Gemini API
export async function sendToGemini(prompt) {
  try {
    const apiKey = await getGeminiApiKey();

    if (!apiKey) {
      throw new Error('Failed to get API key from server');
    }

    const response = await fetch(`${API_ENDPOINTS.GEMINI_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error('Gemini call failed:', error);
    throw error;
  }
}
