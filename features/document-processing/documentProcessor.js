import { fetchPdfText } from './pdfProcessor.js';
import { fetchDocxText } from './docxProcessor.js';

export async function processDocumentLinks(docLinks) {
  const docTexts = [];

  for (let { url } of docLinks) {
    try {
      if (url.match(/\.pdf$/i)) {
        const text = await fetchPdfText(url);
        docTexts.push(`--- PDF: ${url}\n${text}`);
      } else if (url.match(/\.docx?$/i)) {
        const text = await fetchDocxText(url);
        docTexts.push(`--- DOCX: ${url}\n${text}`);
      }
    } catch (error) {
      console.error(`Failed to process document ${url}:`, error);
      docTexts.push(`--- ERROR: ${url}\nFailed to extract content`);
    }
  }

  return docTexts;
}

// Re-export for convenience
export { fetchPdfText } from './pdfProcessor.js';
export { fetchDocxText } from './docxProcessor.js';
