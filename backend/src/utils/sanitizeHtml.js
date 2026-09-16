const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'hr',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'sub',
  'sup',
  'mark',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'blockquote',
  'a',
]);

const BLOCK_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'title', 'noscript']);

function sanitizeHtml(html) {
  if (html === undefined || html === null) {
    return '';
  }

  let out = String(html);

  const blockPattern = new RegExp(`<(${Array.from(BLOCK_TAGS).join('|')})[^>]*>[\\s\\S]*?<\\/\\1\\s*>`, 'gi');
  out = out.replace(blockPattern, '');
  out = out.replace(/<(script|style|iframe|object|embed|link|meta|title|noscript)[^>]*\/?>/gi, '');

  out = out.replace(/\s(?:on\w+|style|class)=("(?:[^"]*)"|'(?:[^']*)'|[^\s>]+)/gi, '');
  out = out.replace(/\s(?:srcdoc|formaction|data-text)/gi, '');
  out = out.replace(/<!--[\s\S]*?-->/gi, '');

  out = out.replace(/<(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)((?:\s[^<>]*?)?)(\s*\/?)>/g, (full, close, tagName, attrs) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return '';
    }
    if (close) {
      return `</${tag}>`;
    }
    if (tag === 'a') {
      const match = /href\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]+)/i.exec(attrs);
      if (match) {
        const url = String(match[2] ?? match[3] ?? match[4]).trim();
        if (/^(https?:|mailto:|tel:)/i.test(url)) {
          return `<a href="${url.replace(/["<>]/g, '').replace(/javascript:/gi, '')}">`;
        }
      }
      return '<a>';
    }
    return `<${tag}>`;
  });

  return out.trim();
}

module.exports = { sanitizeHtml };