import { marked } from 'marked';

marked.setOptions({
    breaks: true,
    gfm: true
});

let DOMPurify = null;

async function getDOMPurify() {
    if (DOMPurify) return DOMPurify;

    if (typeof window !== 'undefined') {
        const createDOMPurify = (await import('dompurify')).default;
        DOMPurify = createDOMPurify(window);
    } else {
        const createDOMPurify = (await import('dompurify')).default;
        const { JSDOM } = await import('jsdom');
        const window = new JSDOM('').window;
        DOMPurify = createDOMPurify(window);
    }

    return DOMPurify;
}

const ALLOWED_TAGS = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'strong', 'em', 'del', 's', 'u',
    'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
];

const ALLOWED_ATTR = [
    'href', 'src', 'alt', 'title',
    'class', 'id', 'name',
    'target', 'rel'
];

export async function renderMarkdown(markdown) {
    if (!markdown) return '';
    const rawHtml = marked.parse(markdown);
    const purify = await getDOMPurify();
    return purify.sanitize(rawHtml, {
        ALLOWED_TAGS,
        ALLOWED_ATTR
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
