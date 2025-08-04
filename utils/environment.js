/**
 * Environment Configuration
 * Handles environment variables and sensitive data
 */

// Simple environment detection
function getEnvironment() {
  try {
    // Check if extension is from Chrome Web Store (production)
    const manifest = chrome.runtime.getManifest();
    return manifest.update_url ? 'production' : 'development';
  } catch {
    return 'development';
  }
}

// Environment configuration (no async calls during init)
const environmentConfig = {
  development: {
    PROXY_SERVER_URL: 'http://localhost:3001',
    DEBUG: true,
  },
  production: {
    PROXY_SERVER_URL: 'http://localhost:3001',
    DEBUG: false,
  },
};

// Get current config
function getCurrentConfig() {
  const env = getEnvironment();
  return environmentConfig[env];
}

// Fetch API key from server (async)
export async function getGeminiApiKey() {
  try {
    const config = getCurrentConfig();
    const response = await fetch(`${config.PROXY_SERVER_URL}/api/key`);
    const data = await response.json();
    return data.key;
  } catch (error) {
    console.error('Error getting Gemini API key:', error);
    return null;
  }
}

export function getApiBaseUrl() {
  try {
    return getCurrentConfig().API_BASE_URL;
  } catch (error) {
    console.error('Error getting API base URL:', error);
    return 'https://generativelanguage.googleapis.com/v1beta';
  }
}

export function isDebugMode() {
  try {
    return getCurrentConfig().DEBUG;
  } catch (error) {
    console.error('Error checking debug mode:', error);
    return false;
  }
}

// Export the getEnvironment function
export { getEnvironment };
