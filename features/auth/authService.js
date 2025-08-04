import {
  getAuthToken,
  removeCachedAuthToken,
  fetchUserInfo,
  revokeToken,
  showMenuButton,
  showSignInButton,
  showProfile,
  showLookupContainer,
  showResultContainer,
  setTextContent,
  SELECTORS,
  MESSAGES,
  querySelector,
} from '../../utils/index.js';

export async function signInWithAccountSwitch() {
  try {
    let token;
    try {
      token = await getAuthToken(false);
      if (token) await removeCachedAuthToken(token);
    } catch {
      /* ignore */
    }

    token = await getAuthToken(true);
    const userInfo = await fetchUserInfo(token);

    setTextContent(SELECTORS.PROFILE_EMAIL, userInfo.email);
    showMenuButton(true);
    showSignInButton(false);
    showProfile(true);
    showLookupContainer(true);
    showResultContainer(false);

    console.log('Token:', token);
  } catch (err) {
    setTextContent(SELECTORS.PROFILE_EMAIL, MESSAGES.SIGN_IN_FAILED);

    console.error(MESSAGES.SIGN_IN_ERROR, err);
  }
}

export async function signOut() {
  try {
    let token;
    try {
      token = await getAuthToken(false);
    } catch {
      /* no token */
    }

    if (token) {
      await removeCachedAuthToken(token);
      await revokeToken(token);
    }

    setTextContent(SELECTORS.PROFILE_EMAIL, MESSAGES.SIGN_OUT_SUCCESS);
    showMenuButton(false);
    showSignInButton(true);
    showProfile(false);
    showLookupContainer(false);
    showResultContainer(false);
  } catch (err) {
    setTextContent(SELECTORS.PROFILE_EMAIL, MESSAGES.SIGN_OUT_FAILED);

    console.error(MESSAGES.SIGN_OUT_ERROR, err);
  }
}

export function initAuth() {
  const authButton = querySelector(SELECTORS.AUTH_LOGIN);
  if (authButton) {
    authButton.addEventListener('click', signInWithAccountSwitch);
  }
}

export function initProfile() {
  const profileLogout = querySelector(SELECTORS.AUTH_LOGOUT);
  profileLogout.addEventListener('click', signOut);
}
