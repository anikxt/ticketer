/**
 * Chrome Storage Utilities
 * Handles local and sync storage operations
 */

export async function setLocalStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

export async function getLocalStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

export async function setSyncStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, resolve);
  });
}

export async function getSyncStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

export async function removeStorage(key, useSync = false) {
  const storage = useSync ? chrome.storage.sync : chrome.storage.local;
  return new Promise((resolve) => {
    storage.remove([key], resolve);
  });
}

export async function clearStorage(useSync = false) {
  const storage = useSync ? chrome.storage.sync : chrome.storage.local;
  return new Promise((resolve) => {
    storage.clear(resolve);
  });
}
