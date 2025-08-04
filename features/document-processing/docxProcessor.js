export async function fetchDocxText(url) {
  const response = await fetch(url, { mode: 'cors' });
  const buf = await response.arrayBuffer();
  const { value } = await window.mammoth.extractRawText({ arrayBuffer: buf });
  return value;
}
