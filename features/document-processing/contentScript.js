(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    removeStyles: true,
    maxTextLength: 500000, // Limit text extraction
    excludeSelectors: ['script', 'style', 'noscript', 'svg'],
  };

  // Clean and extract content from HTML
  function extractContentFromHtml(htmlString) {
    // Create a temporary document to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Clone to avoid modifying the original
    const docClone = doc.documentElement.cloneNode(true);

    if (CONFIG.removeStyles) {
      // Remove all <style> tags
      docClone.querySelectorAll('style').forEach((el) => el.remove());

      // Remove all <link rel="stylesheet"> tags
      docClone
        .querySelectorAll('link[rel="stylesheet"]')
        .forEach((el) => el.remove());

      // Remove all inline style attributes
      docClone
        .querySelectorAll('[style]')
        .forEach((el) => el.removeAttribute('style'));
    }

    // Remove excluded elements
    CONFIG.excludeSelectors.forEach((selector) => {
      docClone.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // Extract text content
    let text = docClone.body?.innerText || docClone.body?.textContent || '';

    // Limit text length if too long
    if (text.length > CONFIG.maxTextLength) {
      text = text.substring(0, CONFIG.maxTextLength) + '...(truncated)';
    }

    return {
      text: text,
      html: docClone.outerHTML,
    };
  }

  // Extract current page content
  function extractPageContent() {
    // Clone the document to avoid modifying the live page
    const docClone = document.documentElement.cloneNode(true);

    if (CONFIG.removeStyles) {
      // Remove all <style> tags
      docClone.querySelectorAll('style').forEach((el) => el.remove());

      // Remove all <link rel="stylesheet"> tags
      docClone
        .querySelectorAll('link[rel="stylesheet"]')
        .forEach((el) => el.remove());

      // Remove all inline style attributes
      docClone
        .querySelectorAll('[style]')
        .forEach((el) => el.removeAttribute('style'));
    }

    // Remove excluded elements
    CONFIG.excludeSelectors.forEach((selector) => {
      docClone.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // Extract text content
    let pageText = document.body.innerText || document.body.textContent || '';

    // Limit text length if too long
    if (pageText.length > CONFIG.maxTextLength) {
      pageText = pageText.substring(0, CONFIG.maxTextLength) + '...(truncated)';
    }

    return {
      url: window.location.href,
      text: pageText,
      html: docClone.outerHTML,
      title: document.title,
      timestamp: Date.now(),
    };
  }

  // Fetch and extract homepage content
  async function fetchHomepageContent(baseUrl) {
    try {
      console.log(`🏠 Fetching homepage content from ${baseUrl}`);
      const response = await fetch(baseUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const homepageHtml = await response.text();
      const { text: homepageText, html: cleanedHomepageHtml } =
        extractContentFromHtml(homepageHtml);

      return {
        url: baseUrl,
        text: homepageText,
        html: cleanedHomepageHtml,
      };
    } catch (error) {
      console.warn('Failed to fetch homepage:', error);
      return {
        url: baseUrl,
        text: 'Homepage could not be fetched',
        html: '',
      };
    }
  }

  async function sendPageContext() {
    try {
      const currentPage = extractPageContent();
      const baseUrl = new URL(currentPage.url).origin;

      // Check if current page is already the homepage
      const isHomepage =
        currentPage.url === baseUrl || currentPage.url === `${baseUrl}/`;

      let homepageContent;

      if (isHomepage) {
        // Current page is homepage, so homepage content is the same as current page
        homepageContent = {
          url: baseUrl,
          text: '',
          html: '',
        };
        console.log(
          '📍 Current page is homepage, skipping separate homepage fetch'
        );
      } else {
        // Fetch homepage content separately
        homepageContent = await fetchHomepageContent(baseUrl);
      }

      chrome.runtime.sendMessage({
        type: 'PAGE_CONTEXT',
        currentPage: currentPage,
        homepage: homepageContent,
        timestamp: Date.now(),
      });

      console.log('Page content extracted and sent', {
        currentUrl: currentPage.url,
        homepageUrl: homepageContent.url,
        isHomepage: isHomepage,
      });
    } catch (error) {
      console.error('Failed to extract page content:', error);

      // Send error message
      chrome.runtime.sendMessage({
        type: 'PAGE_CONTEXT_ERROR',
        error: error.message,
        url: window.location.href,
      });
    }
  }

  // Execute extraction
  sendPageContext();
})();
