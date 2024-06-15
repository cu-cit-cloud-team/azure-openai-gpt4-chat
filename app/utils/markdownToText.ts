import { decode, encode } from 'he';
import { marked } from 'marked';

const block = (token) => {
  const text = marked.parseInline(token.text || token);
  return `${text}\n\n`;
};
const escapeBlock = (token) => {
  const text = marked.parseInline(token.text);
  return `${encode(text)}\n\n`;
};
const line = (token) => {
  const text = marked.parseInline(token.text);
  return `${text}\n`;
};
const inline = (token) => {
  const text = marked.parseInline(token.text);
  return text;
};
const newline = () => '\n';
const empty = () => '';

const TextRenderer: marked.Renderer = {
  // block elements
  code: escapeBlock,
  blockquote: block,
  html: empty,
  heading: block,
  hr: newline,
  list: (token) => {
    const text = marked.parseInline(token.raw);
    return block(text.trim());
  },
  listitem: line,
  checkbox: empty,
  paragraph: block,
  space: empty,
  table: (header, body) => line(header + body),
  tablerow: (token) => {
    const text = marked.parseInline(token.text);
    return line(text.trim());
  },
  tablecell: (token) => {
    const text = marked.parseInline(token.text);
    return `${text} `;
  },
  // inline elements
  strong: inline,
  bold: inline,
  em: inline,
  i: inline,
  codespan: inline,
  br: newline,
  del: inline,
  link: (_0, _1, token) => {
    const text = marked.parseInline(token.text);
    return text;
  },
  image: (_0, _1, token) => {
    const text = marked.parseInline(token.text);
    return text;
  },
  text: inline,
  // etc.
  options: {},
};

export const markdownToText = (
  markdown: string,
  options?: marked.MarkedOptions
): string => {
  if (!markdown?.length) {
    return '';
  }

  const unmarked = marked(markdown, {
    ...options,
    useNewRenderer: true,
    renderer: TextRenderer,
  });
  const unescaped = decode(unmarked);
  const trimmed = unescaped.trim();
  return trimmed;
};
