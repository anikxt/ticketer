export async function fetchPdfText(url) {
  const pdfjsLib = window.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
    '/assets/libs/pdfjs-worker.js'
  );

  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) throw new Error(`Fetch PDF failed (${response.status})`);
  const buf = await response.arrayBuffer();

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  } catch (e) {
    console.error('PDF parse error:', e);
    return '';
  }

  const maxPages = 20;
  const pageCount = Math.min(pdf.numPages, maxPages);
  let text = '';
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n\n';
  }

  if (pdf.numPages > maxPages) text += '...(truncated)';
  return text;
}
