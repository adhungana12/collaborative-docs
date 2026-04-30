export function parseInline(text: string): any[] {
  const nodes: any[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let m;

  while ((m = re.exec(text)) !== null) {
    if (m[2]) {
      nodes.push({ type: 'text', marks: [{ type: 'bold' }], text: m[2] });
    } else if (m[3]) {
      nodes.push({ type: 'text', marks: [{ type: 'italic' }], text: m[3] });
    } else if (m[4]) {
      nodes.push({ type: 'text', text: m[4] });
    }
  }

  return nodes.length ? nodes : [{ type: 'text', text }];
}

export function fromPlainText(raw: string) {
  const lines = raw.split('\n');
  return {
    type: 'doc',
    content: lines.map((line) =>
      line.trim()
        ? { type: 'paragraph', content: [{ type: 'text', text: line }] }
        : { type: 'paragraph' }
    ),
  };
}

export function fromMarkdown(raw: string) {
  const lines = raw.split('\n');
  const content: any[] = [];

  for (const line of lines) {
    const hMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (hMatch) {
      content.push({
        type: 'heading',
        attrs: { level: hMatch[1].length },
        content: [{ type: 'text', text: hMatch[2] }],
      });
      continue;
    }

    const bulletMatch = line.match(/^[\-\*]\s+(.+)/);
    if (bulletMatch) {
      const item = {
        type: 'listItem',
        content: [{ type: 'paragraph', content: parseInline(bulletMatch[1]) }],
      };
      const prev = content[content.length - 1];
      if (prev?.type === 'bulletList') {
        prev.content.push(item);
      } else {
        content.push({ type: 'bulletList', content: [item] });
      }
      continue;
    }

    const numMatch = line.match(/^\d+\.\s+(.+)/);
    if (numMatch) {
      const item = {
        type: 'listItem',
        content: [{ type: 'paragraph', content: parseInline(numMatch[1]) }],
      };
      const prev = content[content.length - 1];
      if (prev?.type === 'orderedList') {
        prev.content.push(item);
      } else {
        content.push({ type: 'orderedList', content: [item] });
      }
      continue;
    }

    if (!line.trim()) {
      content.push({ type: 'paragraph' });
      continue;
    }

    content.push({ type: 'paragraph', content: parseInline(line) });
  }

  return { type: 'doc', content };
}
