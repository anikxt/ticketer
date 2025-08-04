/**
 * Main Utils Export Hub
 * Single import point for all utilities
 */

// Export all UI functions
export * from './ui.js';

// Export all API functions
export * from './api.js';

// Export all DOM utilities
export * from './dom.js';

// Export all constants
export * from './constants.js';

// Export all storage utilities
export * from './storage.js';

// Export all prompts
export * from './prompts.js';

// Export all environment utilities
export * from './environment.js';

// Convenience exports for commonly used functions
export {
  showMenuButton,
  showSignInButton,
  showHeaderMenuDropdown,
  showProfile,
  showLookupContainer,
  showResultContainer,
  showElement,
  toggleElement,
} from './ui.js';

export {
  getAuthToken,
  removeCachedAuthToken,
  fetchUserInfo,
  revokeToken,
  sendToGemini,
} from './api.js';

export {
  createElement,
  querySelector,
  querySelectorAll,
  addEventListener,
  setTextContent,
  getTextContent,
  extractDocumentLinks,
  extractTextFromPage,
  extractEmailsFromText,
} from './dom.js';

export {
  getGeminiApiKey,
  getApiBaseUrl,
  isDebugMode,
  getEnvironment,
} from './environment.js';

export { buildEmailLookupPrompt } from './prompts.js';
