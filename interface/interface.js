import { initHeaderMenu } from '../features/header/headerService.js';
import { initAuth, initProfile } from '../features/auth/authService.js';
import { initEmailLookup } from '../features/email-lookup/emailLookupService.js';
import {
  fetchUserInfo,
  showMenuButton,
  showSignInButton,
  showProfile,
  showLookupContainer,
  showResultContainer,
  showHeaderMenuDropdown,
  setTextContent,
  getEnvironment,
  isDebugMode,
  SELECTORS,
  MESSAGES,
} from '../utils/index.js';

// Check if the user is signed in on load
function checkSignInStateOnLoad() {
  chrome.identity.getAuthToken({ interactive: false }, async (token) => {
    try {
      if (chrome.runtime.lastError || !token) {
        // Not signed in
        showMenuButton(false);
        showSignInButton(true);
        showHeaderMenuDropdown(false);
        showProfile(false);
        showLookupContainer(false);
        showResultContainer(false);

        if (isDebugMode()) {
          console.log('👤 User not signed in');
        }
      } else {
        // Signed in
        showMenuButton(true);
        showSignInButton(false);
        showHeaderMenuDropdown(false);
        showProfile(true);
        showLookupContainer(true);
        showResultContainer(true);

        try {
          const userInfo = await fetchUserInfo(token);
          setTextContent(SELECTORS.PROFILE_EMAIL, userInfo.email);

          if (isDebugMode()) {
            console.log('👤 User signed in:', userInfo.email);
          }
        } catch (err) {
          console.error(MESSAGES.FETCH_USER_INFO_FAILED, err);
        }
      }
    } catch (error) {
      console.error('❌ Error checking sign-in state:', error);
    }
  });
}

// Initialize features one by one with error handling
async function initializeFeatures() {
  const features = [
    { name: 'Auth', init: initAuth },
    { name: 'Profile', init: initProfile },
    { name: 'Header', init: initHeaderMenu },
    { name: 'Email Lookup', init: initEmailLookup },
  ];

  for (const feature of features) {
    try {
      if (isDebugMode()) {
        console.log(`🔧 Initializing ${feature.name}...`);
      }

      feature.init();

      if (isDebugMode()) {
        console.log(`✅ ${feature.name} initialized`);
      }
    } catch (error) {
      console.error(`❌ Failed to initialize ${feature.name}:`, error);
    }
  }
}

// Main initialization
async function initialize() {
  try {
    console.log(`🚀 Ticketer starting (${getEnvironment()})`);

    // Check sign-in state
    checkSignInStateOnLoad();

    // Initialize features
    await initializeFeatures();

    console.log('✅ Ticketer initialized successfully');
  } catch (error) {
    console.error('❌ Critical initialization error:', error);
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM is already ready
  initialize();
}

// Debug helpers
if (isDebugMode()) {
  window.ticketerDebug = {
    initialize,
    checkSignInStateOnLoad,
    getEnvironment,
  };
}
