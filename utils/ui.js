/**
 * UI Visibility Control Functions
 * All functions follow the pattern: show(boolean) -> void
 */

import { SELECTORS } from './constants.js';
import { querySelector } from './dom.js';

// Auth UI Controls
export function showMenuButton(show) {
  const menuButton = querySelector(SELECTORS.HEADER_MENU);
  menuButton.style.display = show ? '' : 'none';
}

export function showSignInButton(show) {
  const authContainer = querySelector(SELECTORS.AUTH_CONTAINER);
  authContainer.style.display = show ? '' : 'none';
}

export function showHeaderMenuDropdown(show) {
  const headerMenuDropdown = querySelector(SELECTORS.HEADER_MENU_DROPDOWN);
  headerMenuDropdown.style.display = show ? '' : 'none';
}

export function showProfile(show) {
  const profileContainer = querySelector(SELECTORS.PROFILE);
  profileContainer.style.display = show ? '' : 'none';
}

// Email Lookup UI Controls
export function showLookupContainer(show) {
  const lookupContainer = querySelector(SELECTORS.LOOKUP_CONTAINER);
  lookupContainer.style.display = show ? '' : 'none';
}

export function showResultContainer(show) {
  const resultContainer = querySelector(SELECTORS.RESULT_CONTAINER);
  resultContainer.style.display = show ? '' : 'none';
}

// Generic UI Controls
export function showElement(selector, show) {
  const element = querySelector(selector);
  element.style.display = show ? '' : 'none';
}

export function toggleElement(selector) {
  const element = querySelector(selector);
  element.style.display = element.style.display === 'none' ? '' : 'none';
}
