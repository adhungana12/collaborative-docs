import { fromPlainText, fromMarkdown, parseInline } from '@/lib/parsers';

describe('parseInline', () => {
  it('leaves plain text alone', () => {
    expect(parseInline('hello world')).toEqual([{ type: 'text', text: 'hello world' }]);
  });

  it('picks up **bold** markers', () => {
    const result = parseInline('say **this** loudly');
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ type: 'text', marks: [{ type: 'bold' }], text: 'this' });
  });

  it('picks up *italic* markers', () => {
    const result = parseInline('say *this* softly');
    expect(result[1]).toEqual({ type: 'text', marks: [{ type: 'italic' }], text: 'this' });
  });
});

describe('fromPlainText', () => {
  it('turns lines into paragraphs', () => {
    const doc = fromPlainText('first line\nsecond line');
    expect(doc.type).toBe('doc');
    expect(doc.content).toHaveLength(2);
    expect(doc.content[0].content[0].text).toBe('first line');
    expect(doc.content[1].content[0].text).toBe('second line');
  });

  it('treats blank lines as empty paragraphs', () => {
    const doc = fromPlainText('above\n\nbelow');
    expect(doc.content[1].type).toBe('paragraph');
    expect(doc.content[1].content).toBeUndefined();
  });
});

describe('fromMarkdown', () => {
  it('converts # headings', () => {
    const doc = fromMarkdown('# Big title\n## Smaller');
    expect(doc.content[0].type).toBe('heading');
    expect(doc.content[0].attrs.level).toBe(1);
    expect(doc.content[1].attrs.level).toBe(2);
  });

  it('groups consecutive bullet items into one list', () => {
    const doc = fromMarkdown('- apples\n- bananas\n- oranges');
    expect(doc.content).toHaveLength(1);
    expect(doc.content[0].type).toBe('bulletList');
    expect(doc.content[0].content).toHaveLength(3);
  });

  it('groups numbered items into one list', () => {
    const doc = fromMarkdown('1. first\n2. second');
    expect(doc.content).toHaveLength(1);
    expect(doc.content[0].type).toBe('orderedList');
    expect(doc.content[0].content).toHaveLength(2);
  });

  it('handles a mix of headings, paragraphs, and lists', () => {
    const doc = fromMarkdown('# Title\n\nSome text.\n\n- item a\n- item b');
    const types = doc.content.map((n: any) => n.type);
    expect(types).toContain('heading');
    expect(types).toContain('paragraph');
    expect(types).toContain('bulletList');
  });
});
