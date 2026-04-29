'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';

type Props = {
  doc: { id: string; content: string };
  canEdit: boolean;
  onSave: (content: string) => void;
};

export default function Editor({ doc, canEdit, onSave }: Props) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  // parse whatever the backend gave us
  function parseContent() {
    if (!doc.content) return undefined;
    try {
      const parsed = JSON.parse(doc.content);
      // docx uploads come as { __html: "..." } — let tiptap handle the html
      if (parsed.__html) return parsed.__html;
      return parsed;
    } catch {
      return doc.content;
    }
  }

  const initial = parseContent();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: typeof initial === 'string' && initial.startsWith('<') ? initial : initial,
    editable: canEdit,
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate({ editor }) {
      // debounce saves so we're not hammering the api on every keystroke
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onSave(JSON.stringify(editor.getJSON()));
      }, 800);
    },
  });

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { editor?.setEditable(canEdit); }, [canEdit, editor]);

  if (!editor) return null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {canEdit && <Toolbar editor={editor} />}
      <div className="bg-white min-h-[calc(100vh-8rem)] mx-4 my-4 rounded-xl shadow-sm border border-ink-100/60">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}


// ---- toolbar ----

function Toolbar({ editor }: { editor: any }) {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-ink-100/60 px-4 py-1.5">
      <div className="flex items-center gap-0.5 flex-wrap max-w-3xl mx-auto">
        {/* headings */}
        <Btn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} tip="Heading 1">H1</Btn>
        <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} tip="Heading 2">H2</Btn>
        <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} tip="Heading 3">H3</Btn>

        <Sep />

        {/* inline formatting */}
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} tip="Bold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>
        </Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} tip="Italic">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>
        </Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} tip="Underline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" /></svg>
        </Btn>

        <Sep />

        {/* lists */}
        <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} tip="Bullet list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>
        </Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} tip="Numbered list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" /></svg>
        </Btn>

        <Sep />

        {/* undo/redo */}
        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tip="Undo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" /></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tip="Redo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" /></svg>
        </Btn>
      </div>
    </div>
  );
}

function Btn({ active, onClick, disabled, tip, children }: {
  active?: boolean; onClick: () => void; disabled?: boolean;
  tip: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tip}
      className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
        active ? 'bg-accent-100 text-accent-700'
        : disabled ? 'text-ink-200 cursor-not-allowed'
        : 'text-ink-500 hover:bg-ink-50 hover:text-ink-700'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-ink-100 mx-1" />;
}
