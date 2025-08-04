import { signInWithAccountSwitch, signOut } from '../auth/authService.js';
import { querySelector, SELECTORS } from '../../utils/index.js';

export function initHeaderMenu() {
  const headerMenuBtn = querySelector(SELECTORS.HEADER_MENU);
  const headerMenuDropdown = querySelector(SELECTORS.HEADER_MENU_DROPDOWN);

  if (!headerMenuBtn || !headerMenuDropdown) return;

  headerMenuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    headerMenuDropdown.style.display =
      headerMenuDropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Hide menu when clicking outside
  document.addEventListener('click', function () {
    headerMenuDropdown.style.display = 'none';
  });

  // Prevent menu from closing when clicking inside
  headerMenuDropdown.addEventListener('click', function (e) {
    e.stopPropagation();
  });

  // Switch account
  const switchAccountBtn = querySelector(SELECTORS.AUTH_SWITCH);
  switchAccountBtn.addEventListener('click', function (e) {
    headerMenuDropdown.style.display = 'none';
    signInWithAccountSwitch(e);
  });

  // Sign out
  const logoutBtns = document.querySelectorAll(SELECTORS.AUTH_LOGOUT);
  logoutBtns.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      headerMenuDropdown.style.display = 'none';
      signOut(e);
    });
  });
}
