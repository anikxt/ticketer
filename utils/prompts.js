export async function buildEmailLookupPrompt(pageData, docTexts = []) {
  const { currentPage, homepage } = pageData;

  console.log('pageData: ', pageData);

  return `
    You have two sources:

    1. Provided Page
      - URL: ${currentPage.url}
      - Text: ${currentPage.text}
      - HTML/DOM: ${currentPage.html}

    2. Base Domain Homepage
      - URL: ${homepage.url}
      - Text: ${homepage.text}
      - HTML/DOM: ${homepage.html}

    And the extracted document texts:
      ${docTexts.join('\n\n')}

    Steps:
      1. Search visible text of Source 1 for developer/technical-support emails with labels like "support", "developer", "engineering", "technical", "contact", "help", "reach out".
          - If found -> stop & return those emails.
      2. If none in text, search DOM/HTML of Source 1 for emails.
          - If found -> stop & return those emails.
      3. If no emails found in Source 1, repeat steps 1-2 on Source 2 (homepage).
          - If found -> stop & return those emails.
      4. If still no emails found, search each extracted document.

      For each email found, provide in this exact JSON format:
      {
        "Result": {
          "Emails": [
            {
              "Email": "support@example.com",
              "Context": "Contact support team for help",
              "Source": "Current Page",
              "Label": "support"
            }
          ]
        }
      }

      If no relevant email found anywhere, output exactly:
      {
        "Result": {
          "Email": "No relevant email found"
        }
      }

      CRITICAL: Output ONLY valid JSON. No markdown, no explanations, no additional text.
      Start your response with { and end with }.
  `;
}
