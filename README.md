# CollabDocs

A small collaborative document editor. Users can create rich-text documents, import files, share docs with each other, and everything persists across sessions.

Built with Next.js 14, TipTap, Prisma, and SQLite.

## Setup

You need Node 18+ installed.

```bash
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```

Then open http://localhost:3000.

## Test accounts

There are three seeded users. No passwords — you just pick one from the login screen.

| Name | Email |
|------|-------|
| Alice Chen | alice@ajaia.com |
| Bob Martinez | bob@ajaia.com |
| Carol Wright | carol@ajaia.com |

Alice owns a sample document. Bob has view access to it. Carol starts with nothing, which is useful for testing the sharing flow from the receiving end.

## What it does

**Editing** — Create documents, rename them by clicking the title, type with rich-text formatting (bold, italic, underline, three heading levels, bullet and numbered lists). Content auto-saves about a second after you stop typing.

**File import** — Upload `.txt`, `.md`, or `.docx` files from the sidebar. Each one becomes a new editable document. Markdown headings, lists, and inline formatting come through. DOCX goes through Mammoth for HTML conversion, then TipTap parses it client-side.

**Sharing** — Document owners can invite others by email and choose view or edit permissions. The sidebar separates "my documents" from "shared with me" so the distinction is always visible. View-only users see a badge and can't edit.

**Persistence** — SQLite via Prisma. Documents, formatting, and share relationships survive a refresh.

## Tests

```bash
npm test
```

Covers the file parsing logic — plain text conversion, markdown-to-TipTap conversion, and inline mark detection.

## Deployment

The fastest path is Vercel + a hosted Postgres instance (Vercel Postgres, Neon, or Supabase).

1. Push to GitHub
2. Import into Vercel
3. Add a Postgres database
4. Change the Prisma provider from `sqlite` to `postgresql` and set `DATABASE_URL`
5. Deploy — the build script runs `prisma generate` and `prisma db push` automatically

## Tech choices

| What | Why |
|------|-----|
| Next.js App Router | One deployable unit for frontend and API. Less infrastructure to manage. |
| TipTap | ProseMirror under the hood. Handles the hard parts of rich text (cursor management, undo history, schema validation) so I don't have to. |
| Prisma + SQLite | Zero setup locally. The schema migrates to Postgres with a one-line config change. |
| Cookie-based auth | Simplest thing that supports multiple real users. A production version would use NextAuth or Clerk — the data model wouldn't change. |
| Tailwind | Fast to iterate on. I used DM Sans and Newsreader for typography instead of system defaults because the editor should feel good to type in. |
