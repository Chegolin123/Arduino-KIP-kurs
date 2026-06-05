const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'blockquote',
  'hr', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div'
]);

const VOID_TAGS = new Set(['br', 'hr', 'img']);

const SAFE_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'class', 'id', 'style',
  'colspan', 'rowspan', 'width', 'height', 'target', 'rel'
]);

function isSafeUrl(url, tagName) {
  const value = String(url || '').trim();
  if (!value) return false;

  if (value.startsWith('#') || value.startsWith('/')) return true;

  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value) || /^tel:/i.test(value)) {
    return true;
  }

  if (tagName === 'img' && /^data:image\//i.test(value)) {
    return true;
  }

  return false;
}

function sanitizeAttributes(tagName, attrsText) {
  const attrs = [];
  const attrRegex = /([a-zA-Z0-9:-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
  let match;

  while ((match = attrRegex.exec(attrsText)) !== null) {
    const name = match[1].toLowerCase();
    let value = match[2] || '';

    if (!SAFE_ATTRS.has(name) && !name.startsWith('data-')) continue;
    if (name.startsWith('on')) continue;

    if (value) {
      value = value.trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
    }

    if ((name === 'href' || name === 'src') && !isSafeUrl(value, tagName)) continue;

    if (name === 'target' && value !== '_blank' && value !== '_self' && value !== '_parent' && value !== '_top') {
      continue;
    }

    if (name === 'rel') continue;

    const escaped = String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    attrs.push(`${name}="${escaped}"`);
  }

  if (tagName === 'a' && attrs.some((a) => a.startsWith('target="_blank"')) && !attrs.some((a) => a.startsWith('rel='))) {
    attrs.push('rel="noopener noreferrer"');
  }

  return attrs.length ? ` ${attrs.join(' ')}` : '';
}

function sanitizeHtml(input) {
  let html = String(input || '');

  html = html.replace(/<!--([\s\S]*?)-->/g, '');
  html = html.replace(/<\/(script|style|iframe|object|embed|form|input|button|textarea|select|option|svg|math)[^>]*>/gi, '');
  html = html.replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|option|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, '');
  html = html.replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|svg|math)[^>]*\/?>/gi, '');

  html = html.replace(/<\s*([a-zA-Z0-9]+)([^>]*)>/g, (match, tagNameRaw, attrsText) => {
    const tagName = tagNameRaw.toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) return '';
    const attrs = sanitizeAttributes(tagName, attrsText || '');
    const selfClosing = VOID_TAGS.has(tagName) ? ' /' : '';
    return `<${tagName}${attrs}${selfClosing}>`;
  });

  html = html.replace(/<\/(\s*[a-zA-Z0-9]+\s*)>/g, (match, tagNameRaw) => {
    const tagName = tagNameRaw.trim().toLowerCase();
    if (!ALLOWED_TAGS.has(tagName) || VOID_TAGS.has(tagName)) return '';
    return `</${tagName}>`;
  });

  html = html.replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, '');
  html = html.replace(/javascript:/gi, '');
  html = html.replace(/vbscript:/gi, '');
  html = html.replace(/data:text\/html/gi, '');

  return html;
}

module.exports = { sanitizeHtml };
