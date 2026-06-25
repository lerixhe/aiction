import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

function parseInline(text: string): string {
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
  escaped = escaped.replace(
    /\[(.*?)\]\((.*?)\)/g,
    (_, label, url) => `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`
  );
  return escaped;
}

function parseMarkdown(content: string): string {
  const lines = content.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre><code class="language-${codeLanguage}">${escapeHtml(codeContent.trim())}</code></pre>`;
        inCodeBlock = false;
        codeContent = '';
        codeLanguage = '';
      } else {
        inCodeBlock = true;
        codeLanguage = escapeHtml(line.slice(3).trim()) || 'text';
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    if (inList && !line.match(/^[\s]*[-*]\s/) && !line.match(/^[\s]*\d+\.\s/) && line.trim() !== '') {
      html += listType === 'ul' ? '</ul>' : '</ol>';
      inList = false;
    }

    if (line.trim() === '') {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      continue;
    }

    if (line.startsWith('# ')) {
      html += `<h1>${parseInline(line.slice(2))}</h1>`;
    } else if (line.startsWith('## ')) {
      html += `<h2>${parseInline(line.slice(3))}</h2>`;
    } else if (line.startsWith('### ')) {
      html += `<h3>${parseInline(line.slice(4))}</h3>`;
    } else if (line.startsWith('> ')) {
      html += `<blockquote>${parseInline(line.slice(2))}</blockquote>`;
    } else if (line.match(/^[-*]\s/)) {
      if (!inList || listType !== 'ul') {
        if (inList) html += `</${listType}>`;
        html += '<ul>';
        inList = true;
        listType = 'ul';
      }
      html += `<li>${parseInline(line.slice(2))}</li>`;
    } else if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, '');
      if (!inList || listType !== 'ol') {
        if (inList) html += `</${listType}>`;
        html += '<ol>';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${parseInline(content)}</li>`;
    } else if (line.startsWith('---')) {
      html += '<hr>';
    } else {
      html += `<p>${parseInline(line)}</p>`;
    }
  }

  if (inList) {
    html += listType === 'ul' ? '</ul>' : '</ol>';
  }

  if (inCodeBlock) {
    html += `<pre><code class="language-${codeLanguage}">${escapeHtml(codeContent.trim())}</code></pre>`;
  }

  return html;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const markdownStyles = `
.markdown-content {
  font-size: 14px;
  line-height: 1.6;
}
.markdown-content h1 { font-size: 1.5em; font-weight: 600; margin: 0.5em 0; }
.markdown-content h2 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0; }
.markdown-content h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0; }
.markdown-content p { margin: 0.5em 0; }
.markdown-content ul, .markdown-content ol { margin: 0.5em 0; padding-left: 1.5em; }
.markdown-content li { margin: 0.25em 0; }
.markdown-content blockquote {
  border-left: 3px solid #d1d5db;
  padding-left: 1em;
  color: #6b7280;
  margin: 0.5em 0;
}
.markdown-content pre {
  background: #f3f4f6;
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  margin: 0.5em 0;
}
.markdown-content code.inline-code {
  background: #f3f4f6;
  padding: 0.15em 0.3em;
  border-radius: 3px;
  font-size: 0.9em;
}
.markdown-content a {
  color: #6366f1;
  text-decoration: underline;
}
.markdown-content hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1em 0;
}
.dark .markdown-content blockquote { border-left-color: #4b5563; color: #9ca3af; }
.dark .markdown-content pre { background: #1f2937; }
.dark .markdown-content code.inline-code { background: #1f2937; }
.dark .markdown-content a { color: #818cf8; }
.dark .markdown-content hr { border-top-color: #374151; }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = markdownStyles;
  style.setAttribute('data-aiction-markdown', '');
  document.head.appendChild(style);
  stylesInjected = true;
}
injectStyles();
