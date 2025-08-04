/**
 * Shared Constants
 * All app-wide constants and configuration
 */

// API Endpoints
export const API_ENDPOINTS = {
  GOOGLE_USERINFO: 'https://www.googleapis.com/oauth2/v3/userinfo',
  GOOGLE_REVOKE: (token) =>
    `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
  GEMINI_BASE:
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
};

// UI Selectors
export const SELECTORS = {
  // Auth
  AUTH_CONTAINER: '.auth.container',
  AUTH_LOGIN: '.auth__login',
  AUTH_LOGOUT: '.auth__logout',
  AUTH_SWITCH: '.auth__switch',
  PROFILE: '.profile',
  PROFILE_EMAIL: '.profile__email',

  // Header
  HEADER_MENU: '.header__menu',
  HEADER_MENU_DROPDOWN: '.header__menu-dropdown',

  // Lookup
  LOOKUP_CONTAINER: '.lookup.container',
  LOOKUP_BUTTON: '.lookup__button',

  // Results
  RESULT_CONTAINER: '.result__email',
};

// File Types
export const FILE_TYPES = {
  PDF: 'pdf',
  DOCX: 'docx',
  DOC: 'doc',
};

// Messages
export const MESSAGES = {
  SIGN_IN_SUCCESS: 'Successfully signed in',
  SIGN_IN_FAILED: 'Sign-in failed',
  SIGN_OUT_SUCCESS: 'Signed out',
  SIGN_OUT_FAILED: 'Sign-out failed',
  SIGN_IN_ERROR: 'Sign-in error:',
  SIGN_OUT_ERROR: 'Sign-out error:',
  FETCH_USER_INFO_FAILED: 'Failed to fetch user info:',
  SELECT_EMAIL: 'Select an email...',
  NO_EMAILS_FOUND: 'No emails found',
};

// Email patterns and keywords (moved from EmailExtractor for reusability)
export const EMAIL_PATTERNS = [
  // Standard email pattern
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Email with parentheses/brackets
  /\b[A-Za-z0-9._%+-]+\s*[@\(at\)]\s*[A-Za-z0-9.-]+\s*[\.\(dot\)]\s*[A-Z|a-z]{2,}\b/g,
  // Obfuscated emails (e.g., "name at domain dot com")
  /\b[A-Za-z0-9._%+-]+\s+at\s+[A-Za-z0-9.-]+\s+dot\s+[A-Za-z]{2,}\b/gi,
];

export const SUPPORT_KEYWORDS = [
  'support',
  'help',
  'contact',
  'reach out',
  'technical',
  'developer',
  'engineering',
  'admin',
  'info',
  'service',
  'assistance',
  'bug',
  'issue',
];
