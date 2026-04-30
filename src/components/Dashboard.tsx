'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { User } from '@/app/page';
import Editor from './Editor';
import ShareDialog from './ShareDialog';
import UploadButton from './UploadButton';

type DocSummary = {
  id: string;
  title: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string };
  role: 'owner' | 'shared';
  myPermission?: string;
  shares?: Array<{ user: { id: string; name: string; email: string }; permission: string }>;
};
type DocFull = DocSummary & { content: string };

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [docs, setDocs] = useState<{ owned: DocSummary[]; shared: DocSummary[] }>({ owned: [], shared: [] });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<DocFull | null>(null);
  const [permission, setPermission] = useState('owner');
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebar, setSidebar] = useState(true);

  const loadList = useCallback(async () => {
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) return;
      const data = await res.json();
      setDocs({ owned: Array.isArray(data.owned) ? data.owned : [], shared: Array.isArray(data.shared) ? data.shared : [] });
    } catch {}
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  const openDoc = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/documents/' + id);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActiveDoc(data.document);
      setPermission(data.permission);
      setActiveId(id);
    } catch {
      toast.error('Could not open that document');
    }
  }, []);

  async function createDoc() {
    try {
      const res = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      loadList();
      openDoc(data.document.id);
    } catch {
      toast.error('Failed to create document');
    }
  }

  const saveDoc = useCallback(async (id: string, patch: { title?: string; content?: string }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/documents/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      loadList();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally { setSaving(false); }
  }, [loadList]);

  async function deleteDoc(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await fetch('/api/documents/' + id, { method: 'DELETE' });
      if (activeId === id) { setActiveDoc(null); setActiveId(null); }
      loadList();
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  }

  function handleUpload(doc: any) { loadList(); openDoc(doc.id); toast.success('File imported'); }

  const canEdit = permission === 'owner' || permission === 'edit';
  const initials = user.name.split(' ').map((w) => w[0]).join('');

  return (
    <div className="h-screen flex overflow-hidden">
      <aside className={`${sidebar ? 'w-72' : 'w-0'} shrink-0 bg-white border-r border-ink-100 flex flex-col transition-all duration-200 overflow-hidden`}>
        <div className="p-4 border-b border-ink-50">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <span className="font-semibold text-ink-800 tracking-tight" style={{ fontFamily: '"Newsreader", Georgia, serif' }}>CollabDocs</span>
          </div>
          <div className="flex gap-2">
            <button onClick={createDoc} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-600 text-white text-[13px] font-medium rounded-lg hover:bg-accent-700 active:scale-[0.97] transition-all shadow-sm">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              New doc
            </button>
            <UploadButton onUploaded={handleUpload} />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {docs.owned.length > 0 && (
            <div className="mb-4">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-ink-300 uppercase tracking-widest">My documents</div>
              {docs.owned.map((d) => (
                <button key={d.id} onClick={() => openDoc(d.id)} className={`w-full text-left px-3 py-2 rounded-lg mb-0.5 group flex items-start gap-2.5 ${activeId === d.id ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mt-0.5 shrink-0 opacity-40" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{d.title || 'Untitled'}</div>
                    <div className="text-[10px] text-ink-300 mt-0.5">{new Date(d.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteDoc(d.id); }} className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-red-400 transition-all mt-0.5 p-0.5" title="Delete">
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </button>
              ))}
            </div>
          )}
          {docs.shared.length > 0 && (
            <div className="mb-4">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-ink-300 uppercase tracking-widest">Shared with me</div>
              {docs.shared.map((d) => (
                <button key={d.id} onClick={() => openDoc(d.id)} className={`w-full text-left px-3 py-2 rounded-lg mb-0.5 flex items-start gap-2.5 ${activeId === d.id ? 'bg-accent-50 text-accent-700' : 'text-ink-600 hover:bg-ink-50'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mt-0.5 shrink-0 opacity-40" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{d.title || 'Untitled'}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-ink-300">{d.owner.name}</span>
                      <span className="text-[10px] bg-ink-100 text-ink-400 px-1.5 rounded">{d.myPermission === 'edit' ? 'Can edit' : 'View only'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {docs.owned.length === 0 && docs.shared.length === 0 && (
            <div className="text-center py-10 px-3"><p className="text-ink-300 text-sm">Nothing here yet.</p><p className="text-ink-300 text-xs mt-1">Create a doc or upload a file.</p></div>
          )}
        </nav>
        <div className="p-3 border-t border-ink-50 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-[11px] font-bold shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-ink-700 truncate">{user.name}</div>
            <div className="text-[10px] text-ink-400 truncate">{user.email}</div>
          </div>
          <button onClick={onLogout} title="Log out" className="p-1 text-ink-300 hover:text-ink-600 transition-colors rounded">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-[#f4f5f7]">
        <header className="h-13 border-b border-ink-100 bg-white flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setSidebar(!sidebar)} className="text-ink-400 hover:text-ink-700 transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          {activeDoc ? (
            <>
              <input value={activeDoc.title} onChange={(e) => setActiveDoc({ ...activeDoc, title: e.target.value })} onBlur={() => canEdit && saveDoc(activeDoc.id, { title: activeDoc.title })} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} disabled={!canEdit} className="flex-1 text-sm font-medium text-ink-800 bg-transparent border-none outline-none truncate disabled:text-ink-400" placeholder="Untitled" />
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-ink-300">{saving ? 'Saving...' : 'Saved'}</span>
                {!canEdit && <span className="text-[11px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium border border-amber-100">View only</span>}
                {permission === 'owner' && (
                  <button onClick={() => setShareOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-accent-600 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors">
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    Share
                  </button>
                )}
              </div>
            </>
          ) : <span className="text-sm text-ink-300">No document open</span>}
        </header>
        <div className="flex-1 overflow-y-auto">
          {activeDoc ? (
            <Editor key={activeDoc.id} doc={activeDoc} canEdit={canEdit} onSave={(content) => saveDoc(activeDoc.id, { content })} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-ink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" fill="none" stroke="#b1b9c9" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-ink-500 font-medium text-[15px] mb-1">Pick a document from the sidebar</p>
                <p className="text-ink-300 text-sm mb-5">or start fresh</p>
                <button onClick={createDoc} className="px-5 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-700 transition-colors shadow-sm">New document</button>
              </div>
            </div>
          )}
        </div>
      </main>
      {shareOpen && activeDoc && <ShareDialog docId={activeDoc.id} docTitle={activeDoc.title} shares={activeDoc.shares || []} onClose={() => { setShareOpen(false); if (activeId) openDoc(activeId); }} />}
    </div>
  );
}
