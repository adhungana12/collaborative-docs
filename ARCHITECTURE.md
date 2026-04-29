# Architecture Note

## How I thought about scope

The prompt asks for a Google-Docs-inspired editor with editing, file upload, sharing, and persistence. That's a lot of surface area for a few hours. I decided to go deep on the editing experience and the sharing model, and keep everything else simple enough to actually work end-to-end.

I'd rather ship a thing that works than demo a thing that almost works.

## What I spent time on

**The editor.** This is the product. If the editing experience feels bad, nothing else matters. I used TipTap because ProseMirror is the real thing — it handles cursor behavior, selection, undo history, and content validation properly. Rolling my own contentEditable wrapper would have burned the whole timebox on edge cases. Content is stored as TipTap JSON rather than raw HTML. JSON is diffable, unambiguous, and easier to work with if I ever want to add version history or collaboration later.

**Sharing.** I wanted the access control model to be simple but real. Every document has one owner. The owner can share with other users by email and choose between view and edit permissions. Permissions are enforced on the backend — a view-only user gets a 403 if they try to PUT — and surfaced in the frontend with badges and disabled editing. The sidebar separates "my documents" from "shared with me" because that distinction matters in daily use.

**Auto-save.** Documents save 800ms after the last keystroke. No save button. This is how people expect editors to work now. I debounced it to avoid hammering the API while someone is actively typing.

## What I kept simple

**Auth.** Three seeded users, no passwords, just a cookie. This is a scope decision, not laziness — I needed multiple real users to demonstrate sharing, but building an auth system wasn't going to teach anyone anything about my product judgment. The data model is set up so that swapping in NextAuth or Clerk later wouldn't require schema changes.

**File upload.** Three formats: .txt, .md, .docx. Plain text and markdown get parsed server-side into TipTap JSON. DOCX goes through Mammoth to HTML, then TipTap parses that client-side (TipTap already knows how to read HTML, so there's no reason to duplicate that logic on the server). The markdown parser covers headings, lists, bold, and italic. It doesn't handle tables, code blocks, or nested lists — that's fine for an import feature at this scope.

**Database.** SQLite through Prisma. No external services to configure, no connection strings to manage. The schema uses standard Prisma conventions, so switching to Postgres for production is a one-line change in the schema file.

## What I skipped

**Real-time collaboration.** This is the hardest thing in the entire prompt. A proper implementation needs CRDTs (Yjs or Automerge), WebSocket infrastructure, and conflict resolution. It would take longer than the entire timebox and I'd probably still have bugs. I skipped it.

**Version history.** Useful feature, but the current architecture supports adding it later — I'd just snapshot the TipTap JSON on each save and add a separate table for versions.

**Mobile layout.** The app works on mobile screens but the sidebar and toolbar aren't optimized for touch. I'd want to make the sidebar a full-screen overlay on small viewports and rethink the toolbar as a floating bubble menu.

**Comprehensive tests.** I wrote unit tests for the parsing logic because that's where bugs are most likely (regex edge cases, list grouping). In a real project I'd add API integration tests and at least a few component tests with Testing Library.

## If I had another 2-4 hours

1. Deploy to Vercel with Postgres so reviewers don't need to run it locally.
2. Add real auth with NextAuth — Google OAuth, probably.
3. Version history with a timeline UI.
4. PDF and Markdown export from the editor.
5. Presence indicators showing who's viewing a document.
