// import {
//   querySelector,
//   SELECTORS,
//   sendToGemini,
//   buildEmailLookupPrompt,
//   extractDocumentLinks,
// } from '../../utils/index.js';
// import {
//   fetchPdfText,
//   processDocumentLinks,
// } from '../document-processing/documentProcessor.js';

// export async function initEmailLookup() {
//   const lookupButton = querySelector(SELECTORS.LOOKUP_CONTAINER);

//   lookupButton.addEventListener('click', () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
//       const tab = tabs[0];
//       const url = tab.url;

//       if (url && url.endsWith('.pdf')) {
//         const resultEmail = querySelector('.result__email');
//         resultEmail.innerText = 'Extracting text from PDF...';
//         try {
//           const text = await fetchPdfText(url);
//           // Pass the extracted text as the "text" field, and leave html blank
//           handlePageContext({ url, text, html: '' });
//         } catch (err) {
//           resultEmail.innerText = 'Error: ' + err.message;
//         }
//       } else {
//         const resultEmail = querySelector('.result__email');
//         resultEmail.innerText = 'Extracting email...';
//         chrome.scripting.executeScript({
//           target: { tabId: tab.id },
//           files: ['/features/document-processing/contentScript.js'],
//         });
//       }
//     });
//   });

//   chrome.runtime.onMessage.addListener((message) => {
//     if (message.type === 'PAGE_CONTEXT') {
//       console.log(message);
//       handlePageContext(message);
//     }
//   });
// }

// async function handlePageContext({ url, text, html }) {
//   console.log('url: ', url);
//   console.log('text: ', text);
//   console.log('html: ', html);
//   try {
//     const docLinks = extractDocumentLinks(html);
//     const docTexts = await processDocumentLinks(docLinks);
//     const prompt = buildEmailLookupPrompt(url, text, html, docTexts);
//     const raw = await sendToGemini(prompt);

//     console.log('raw: ', raw);

//     // --- Sanitize raw response ---
//     const sanitized = raw
//       .trim()
//       .replace(/^```(?:json)?\s*/, '')
//       .replace(/\s*```$/, '')
//       .replace(/^JSON:\s*/, '');

//     const data = JSON.parse(sanitized);
//     const result = data.Result || {};
//     console.log('result: ', result);
//     const emailArray = result.Email || [];
//     console.log('emailArray: ', emailArray);

//     console.log('emailArray.length: ', emailArray.length);

//     if (emailArray.length > 0) {
//       const email = emailArray[0].Email;

//       console.log('email: ', email);

//       const panel = querySelector(SELECTORS.RESULT_CONTAINER);
//       panel.innerHTML = `
//           <h3>Found Email:</h3>
//           <p><strong>${email}</strong></p>
//         `;
//     } else {
//       const panel = querySelector(SELECTORS.RESULT_CONTAINER);
//       panel.innerHTML = `
//           <h3>No Email Found</h3>
//           <p>No relevant email was found on this page.</p>
//         `;
//     }
//   } catch (err) {
//     console.error(err);
//     querySelector(SELECTORS.RESULT_CONTAINER).innerText =
//       'Error: ' + err.message;
//   }
// }

// features/email-lookup/emailLookupService.js
import { querySelector, SELECTORS } from '../../utils/index.js';
import { EmailExtractor } from './emailExtractor.js';

const emailExtractor = new EmailExtractor();

export async function initEmailLookup() {
  const lookupButton = querySelector(SELECTORS.LOOKUP_BUTTON);

  if (!lookupButton) {
    console.error('Lookup button not found');
    return;
  }

  lookupButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      const url = tab.url;

      // Show loading state
      updateResultsUI('🔍 Extracting emails...', 'loading');

      if (url && url.endsWith('.pdf')) {
        try {
          const { fetchPdfText } = await import(
            '../document-processing/pdfProcessor.js'
          );
          const text = await fetchPdfText(url);

          // Create pageData structure for PDF
          const pageData = {
            currentPage: {
              url: url,
              text: text,
              html: '',
              title: 'PDF Document',
              timestamp: Date.now(),
            },
            homepage: {
              url: '',
              text: '',
              html: '',
            },
          };

          handlePageContext(pageData);
        } catch (err) {
          updateResultsUI(`Error: ${err.message}`, 'error');
        }
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['features/document-processing/contentScript.js'],
        });
      }
    });
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PAGE_CONTEXT') {
      handlePageContext(message);
    }
  });
}

async function handlePageContext(pageData) {
  try {
    console.log('🚀 Processing page context...');

    // Use comprehensive email extraction
    const emails = await emailExtractor.extractEmails(pageData);

    if (emails.length > 0) {
      console.log(`📧 Found ${emails.length} emails:`, emails);
      displayEmails(emails);
    } else {
      updateResultsUI('❌ No emails found on this page', 'no-results');
    }
  } catch (err) {
    console.error('❌ Error processing page:', err);
    updateResultsUI(`Error: ${err.message}`, 'error');
  }
}

function displayEmails(emails) {
  const panel = querySelector(SELECTORS.RESULT_CONTAINER);
  if (!panel) {
    console.error('Results container not found');
    return;
  }

  const bestEmail = emails[0];

  let html = `
    <div class="email-results">
      <h3>✅ Found ${emails.length} Email${emails.length > 1 ? 's' : ''}</h3>
      
      <div class="primary-email">
        <div class="email-address">${bestEmail.email}</div>
        <div class="email-context">${bestEmail.context}</div>
        <div class="email-meta">
          <span class="source">${bestEmail.source}</span>
          <span class="priority">Priority: ${bestEmail.priority}</span>
        </div>
      </div>
  `;

  if (emails.length > 1) {
    html += `
      <details class="other-emails">
        <summary>Show ${emails.length - 1} other email${
      emails.length > 2 ? 's' : ''
    }</summary>
        <div class="email-list">
    `;

    emails.slice(1).forEach((email) => {
      html += `
        <div class="email-item">
          <div class="email-address">${email.email}</div>
          <div class="email-context">${email.context}</div>
          <div class="email-source">${email.source}</div>
        </div>
      `;
    });

    html += `</div></details>`;
  }

  html += `</div>`;
  panel.innerHTML = html;
}

function updateResultsUI(message, type = 'info') {
  const panel = querySelector(SELECTORS.RESULT_CONTAINER);
  if (panel) {
    panel.innerHTML = `
      <div class="result-message ${type}">
        <p>${message}</p>
      </div>
    `;
  }
}
