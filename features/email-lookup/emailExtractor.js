export class EmailExtractor {
  constructor() {
    // Email regex patterns
    this.emailPatterns = [
      // Standard email pattern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      // Email with parentheses/brackets
      /\b[A-Za-z0-9._%+-]+\s*[@\(at\)]\s*[A-Za-z0-9.-]+\s*[\.\(dot\)]\s*[A-Z|a-z]{2,}\b/g,
      // Obfuscated emails (e.g., "name at domain dot com")
      /\b[A-Za-z0-9._%+-]+\s+at\s+[A-Za-z0-9.-]+\s+dot\s+[A-Za-z]{2,}\b/gi,
    ];

    // Support-related keywords
    this.supportKeywords = [
      'support',
      'help',
      'contact',
      'reach out',
      'technical',
      'developer',
      'engineering',
      'admin',
      'info',
      'service',
      'assistance',
      'bug',
      'issue',
    ];

    // Common selectors where emails are found
    this.emailSelectors = [
      'a[href^="mailto:"]',
      '[class*="contact"]',
      '[id*="contact"]',
      '[class*="support"]',
      '[id*="support"]',
      '[class*="email"]',
      '[id*="email"]',
      'footer',
      '.footer',
      '.contact-info',
      '.contact-details',
      '.support-info',
      '.help-section',
    ];
  }

  // Method 1: Extract from DOM selectors
  extractFromDOM(html = document.documentElement.outerHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const emails = [];

    // Check mailto links first
    doc.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
      const email = link.href.replace('mailto:', '').split('?')[0];
      const context =
        link.textContent ||
        link
          .closest('p, div, section')
          ?.textContent?.trim()
          .substring(0, 100) ||
        '';
      emails.push({
        email: email.toLowerCase(),
        context,
        source: 'mailto_link',
        priority: 10,
        element: link.outerHTML,
      });
    });

    // Check common email containers
    this.emailSelectors.forEach((selector) => {
      try {
        doc.querySelectorAll(selector).forEach((element) => {
          const text = element.textContent || '';
          const foundEmails = this.extractFromText(text);
          foundEmails.forEach((emailObj) => {
            emails.push({
              ...emailObj,
              source: `dom_${selector}`,
              priority: this.supportKeywords.some((keyword) =>
                text.toLowerCase().includes(keyword)
              )
                ? 8
                : 5,
              element: element.outerHTML.substring(0, 200),
            });
          });
        });
      } catch (e) {
        console.warn(`Error with selector ${selector}:`, e);
      }
    });

    return emails;
  }

  // Method 2: Extract from plain text
  extractFromText(text) {
    const emails = [];

    this.emailPatterns.forEach((pattern, index) => {
      const matches = text.match(pattern) || [];
      matches.forEach((match) => {
        // Clean the extracted email first
        const cleanedEmail = this.cleanExtractedEmail(match);
        const email = this.normalizeEmail(cleanedEmail);

        if (this.isValidEmail(email)) {
          const context = this.getEmailContext(text, match);
          const priority = this.calculatePriority(context, email);

          emails.push({
            email: email.toLowerCase(),
            context,
            source: `text_pattern_${index}`,
            priority,
            raw: match,
          });
        }
      });
    });

    return emails;
  }

  // Method 3: Smart AI extraction (fallback)
  async extractWithAI(pageData) {
    try {
      const { buildEmailLookupPrompt } = await import('../../utils/prompts.js');
      const { sendToGemini } = await import('../../utils/api.js');

      const prompt = await buildEmailLookupPrompt(pageData, []);
      const raw = await sendToGemini(prompt);

      console.log('🤖 AI Raw Response:', raw);

      // Check if AI explicitly said no email found
      if (
        raw.toLowerCase().includes('no relevant email found') ||
        raw.toLowerCase().includes('no email found')
      ) {
        console.log('🤖 AI confirmed no emails found');
        return [];
      }

      // Try to parse JSON response first
      try {
        const sanitized = raw
          .trim()
          .replace(/^```(?:json)?\s*/, '')
          .replace(/\s*```$/, '')
          .replace(/^JSON:\s*/, '');

        const data = JSON.parse(sanitized);
        const result = data.Result || {};
        const emailArray = result.Emails || result.Email || [];

        if (Array.isArray(emailArray)) {
          return emailArray
            .filter((item) => item.Email && this.isValidEmail(item.Email))
            .map((item) => ({
              email: item.Email.toLowerCase(),
              context: item.Context || 'Found by AI',
              source: 'ai_structured',
              priority: 3,
              label: item.Label || 'Email',
            }));
        }
      } catch (parseError) {
        console.log('🤖 JSON parsing failed, trying regex extraction...');
      }

      // Fallback: extract emails from raw response using regex
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const foundEmails = raw.match(emailRegex) || [];

      return foundEmails
        .filter((email) => this.isValidEmail(email))
        .map((email) => ({
          email: email.toLowerCase(),
          context: `Found by AI in response`,
          source: 'ai_extraction',
          priority: 1, // Lower priority for regex-extracted
          label: 'Email',
        }));
    } catch (error) {
      console.error('AI extraction failed:', error);
      return [];
    }
  }

  // Method 4: Extract from page metadata
  extractFromMetadata(html = document.documentElement.outerHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const emails = [];

    // Check meta tags
    const metaSelectors = [
      'meta[name*="contact"]',
      'meta[name*="email"]',
      'meta[property*="contact"]',
      'meta[property*="email"]',
    ];

    metaSelectors.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((meta) => {
        const content = meta.getAttribute('content') || '';
        const foundEmails = this.extractFromText(content);
        foundEmails.forEach((emailObj) => {
          emails.push({
            ...emailObj,
            source: 'metadata',
            priority: 7,
          });
        });
      });
    });

    return emails;
  }

  // Main extraction method - tries all approaches
  async extractEmails(pageData) {
    console.log('🔍 Starting comprehensive email extraction...');

    const { currentPage, homepage } = pageData;
    const allEmails = [];

    // Method 1: DOM extraction (fast, reliable)
    console.log('📍 Extracting from DOM...');
    const domEmails = this.extractFromDOM(currentPage.html);
    allEmails.push(...domEmails);

    // Method 2: Text extraction (fast, catches obfuscated emails)
    console.log('📝 Extracting from text...');
    const textEmails = this.extractFromText(currentPage.text);
    allEmails.push(...textEmails);

    // Method 3: Metadata extraction
    console.log('🏷️ Extracting from metadata...');
    const metaEmails = this.extractFromMetadata(currentPage.html);
    allEmails.push(...metaEmails);

    // Also extract from homepage if it has content
    if (homepage.text && homepage.text !== 'Homepage could not be fetched') {
      console.log('🏠 Extracting from homepage...');
      const homepageTextEmails = this.extractFromText(homepage.text);
      const homepageDomEmails = this.extractFromDOM(homepage.html);
      allEmails.push(...homepageTextEmails, ...homepageDomEmails);
    }

    // Deduplicate and sort by priority
    const uniqueEmails = this.deduplicateEmails(allEmails);

    // If we found good emails, return them
    if (uniqueEmails.length > 0 && uniqueEmails[0].priority >= 5) {
      console.log(`✅ Found ${uniqueEmails.length} emails without AI`);
      return uniqueEmails;
    }

    // If we found ANY emails (even lower priority), don't use AI
    if (uniqueEmails.length > 0) {
      console.log(
        `⚠️ Found ${uniqueEmails.length} low-priority emails, skipping AI`
      );
      return uniqueEmails;
    }

    // Only use AI if we found absolutely nothing
    console.log(
      '🤖 No emails found with regex/DOM, trying AI as last resort...'
    );
    const aiEmails = await this.extractWithAI(pageData);

    // If AI also found nothing, return empty array
    if (aiEmails.length === 0) {
      console.log('❌ No emails found anywhere');
      return [];
    }

    allEmails.push(...aiEmails);

    return this.deduplicateEmails(allEmails);
  }

  // Helper methods
  normalizeEmail(email) {
    return email
      .replace(/\s+at\s+/gi, '@')
      .replace(/\s+dot\s+/gi, '.')
      .replace(/[\s\(\)]/g, '')
      .toLowerCase();
  }

  isValidEmail(email) {
    // Basic email regex
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;

    if (!emailRegex.test(email)) {
      return false;
    }

    // Length checks
    if (email.length < 5 || email.length > 320) {
      return false;
    }

    // Check for obvious invalid patterns
    const invalidPatterns = [
      /example/i,
      /test/i,
      /dummy/i,
      /sample/i,
      /placeholder/i,
      /noreply/i,
      /donotreply/i,

      // Common placeholders
      /^user@domain\./i,
      /^email@domain\./i,
      /^contact@domain\./i,
      /^admin@domain\./i,
      /^info@domain\./i,
      /^support@domain\./i,
      /^name@domain\./i,
      /^example@/i,
      /^test@/i,
      /^placeholder@/i,
      /^sample@/i,
      /@domain\./i, // Any @domain.* emails
      /@example\./i, // Any @example.* emails
      /@test\./i, // Any @test.* emails

      // Gibberish patterns
      /(.)\1{3,}/, // Repeated characters (aaaa)
      /[a-z]{20,}/, // Very long strings without breaks
      /[0-9]{10,}/, // Very long number sequences
      /phone|mobile|tel|call/i, // Phone-related terms mixed in
      /address|location|street/i, // Address terms mixed in

      // Suspicious combinations
      /gmail.*yahoo|yahoo.*gmail/i, // Multiple email providers
      /com.*org.*net/i, // Multiple TLDs
      /possible\.|\.possible/i, // Words like "possible" mixed in
      /email.*email/i, // Repeated "email" word

      // Invalid character sequences
      /[a-z]{15,}@/, // Very long local part without separators
      /@[a-z]{20,}\./, // Very long domain without separators
    ];

    if (invalidPatterns.some((pattern) => pattern.test(email))) {
      return false;
    }

    // Split and validate parts
    const [localPart, domainPart] = email.split('@');

    // Local part validation
    if (localPart.length > 64 || localPart.length < 1) {
      return false;
    }

    // Domain part validation
    if (domainPart.length > 253 || domainPart.length < 3) {
      return false;
    }

    // Check for valid domain structure
    const domainParts = domainPart.split('.');
    if (domainParts.length < 2 || domainParts.some((part) => part.length < 1)) {
      return false;
    }

    // TLD validation (must be reasonable)
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || tld.length > 6) {
      return false;
    }

    // Check for mixed content that shouldn't be in emails
    const suspiciousWords = [
      'phone',
      'mobile',
      'call',
      'tel',
      'number',
      'address',
      'street',
      'location',
      'city',
      'message',
      'possible',
      'maybe',
      'probably',
    ];

    if (suspiciousWords.some((word) => email.toLowerCase().includes(word))) {
      return false;
    }

    return true;
  }

  cleanExtractedEmail(rawEmail) {
    // Remove common prefixes/suffixes that get attached
    let cleaned = rawEmail
      .replace(/^[^a-zA-Z0-9]*/, '') // Remove leading non-alphanumeric
      .replace(/[^a-zA-Z0-9.@_+-]*$/, '') // Remove trailing non-alphanumeric
      .replace(/email:?/gi, '') // Remove "email:" prefix
      .replace(/contact:?/gi, '') // Remove "contact:" prefix
      .replace(/mailto:?/gi, '') // Remove "mailto:" prefix
      .trim();

    // Split on spaces and take the part that looks like an email
    const parts = cleaned.split(/\s+/);
    for (const part of parts) {
      if (part.includes('@') && part.includes('.')) {
        return part.toLowerCase();
      }
    }

    return cleaned.toLowerCase();
  }

  getEmailContext(text, email) {
    const emailIndex = text.toLowerCase().indexOf(email.toLowerCase());
    if (emailIndex === -1) return '';

    const start = Math.max(0, emailIndex - 50);
    const end = Math.min(text.length, emailIndex + email.length + 50);
    return text.substring(start, end).trim();
  }

  calculatePriority(context, email) {
    let priority = 1;

    // Higher priority for support-related context
    if (
      this.supportKeywords.some((keyword) =>
        context.toLowerCase().includes(keyword)
      )
    ) {
      priority += 5;
    }

    // Higher priority for specific email types
    if (
      email.includes('support') ||
      email.includes('help') ||
      email.includes('contact') ||
      email.includes('reach out') ||
      email.includes('info')
    ) {
      priority += 3;
    }

    return priority;
  }

  deduplicateEmails(emails) {
    if (!emails || emails.length === 0) {
      return [];
    }

    const emailMap = new Map();

    emails.forEach((emailObj) => {
      // Skip invalid email objects
      if (!emailObj || !emailObj.email) {
        return;
      }

      const email = emailObj.email;
      if (
        !emailMap.has(email) ||
        emailMap.get(email).priority < emailObj.priority
      ) {
        emailMap.set(email, emailObj);
      }
    });

    return Array.from(emailMap.values())
      .filter((emailObj) => emailObj && emailObj.email) // Extra safety check
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5); // Return top 5 emails
  }
}
