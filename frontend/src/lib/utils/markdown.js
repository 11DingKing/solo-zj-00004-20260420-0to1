import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

marked.setOptions({
    breaks: true,
    gfm: true
});

export function renderMarkdown(markdown) {
    if (!markdown) return '';
    const rawHtml = marked.parse(markdown);
    return DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'ul', 'ol', 'li',
            'blockquote', 'pre', 'code',
            'a', 'strong', 'em', 'del', 's', 'u',
            'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title',
            'class', 'id', 'name',
            'target', 'rel'
        ]
    });
}

export function extractExcerpt(markdown, maxLength = 200) {
    if (!markdown) return '';
    const plainText = markdown
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/[#*_`~]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
    if (plainText.length <= maxLength) {
        return plainText;
    }
    return plainText.substring(0, maxLength) + '...';
}
