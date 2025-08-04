/**
 * DOM Manipulation Utilities
 * Common DOM operations and helpers
 */

export function createElement(tag, className, textContent) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

export function querySelector(selector) {
  return document.querySelector(selector);
}

export function querySelectorAll(selector) {
  return document.querySelectorAll(selector);
}

export function addEventListener(selector, event, handler) {
  const element = querySelector(selector);
  if (element) element.addEventListener(event, handler);
  return element;
}

export function setTextContent(selector, text) {
  const element = querySelector(selector);
  if (element) element.textContent = text;
  return element;
}

export function getTextContent(selector) {
  const element = querySelector(selector);
  return element ? element.textContent : '';
}

// Document extraction utilities
export function extractDocumentLinks(html = '') {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const urls = [];

  // <a href>
  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.href;
    if (/\.(pdf|docx?|txt)$/i.test(href))
      urls.push({ url: href, context: a.outerHTML });
  });

  // <embed>, <iframe>
  doc.querySelectorAll('embed[src], iframe[src]').forEach((el) => {
    const src = el.src;
    if (/\.(pdf|docx?|txt)$/i.test(src))
      urls.push({ url: src, context: el.outerHTML });
  });

  // <object data>
  doc.querySelectorAll('object[data]').forEach((el) => {
    const data = el.data;
    if (/\.(pdf|docx?|txt)$/i.test(data))
      urls.push({ url: data, context: el.outerHTML });
  });

  return urls;
}

export function extractTextFromPage() {
  return document.body.innerText || document.body.textContent || '';
}

export function extractEmailsFromText(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return text.match(emailRegex) || [];
}
