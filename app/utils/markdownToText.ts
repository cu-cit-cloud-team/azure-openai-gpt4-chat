import { decode, encode } from 'he';
import { marked } from 'marked';

const block = (text: string) => `${text}\n\n`;
const escapeBlock = (text: string) => `${encode(text)}\n\n`;
const line = (text: string) => `${text}\n`;
const inline = (text: string) => text;
const newline = () => '\n';
const empty = () => '';

const TextRenderer: marked.Renderer = {
  // block elements
  code: escapeBlock,
  blockquote: block,
  html: empty,
  heading: block,
  hr: newline,
  list: (text) => block(text.trim()),
  listitem: line,
  checkbox: empty,
  paragraph: block,
  table: (header, body) => line(header + body),
  tablerow: (text) => line(text.trim()),
  tablecell: (text) => `${text} `,
  // inline elements
  strong: inline,
  bold: inline,
  em: inline,
  i: inline,
  codespan: inline,
  br: newline,
  del: inline,
  link: (_0, _1, text) => text,
  image: (_0, _1, text) => text,
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

  const unmarked = marked(markdown, { ...options, renderer: TextRenderer });
  const unescaped = decode(unmarked);
  const trimmed = unescaped.trim();
  return trimmed;
};
