# Submission

## What's in the repo

| File | What it is |
|------|------------|
| `README.md` | Setup instructions, test accounts, feature overview |
| `ARCHITECTURE.md` | What I prioritized, what I skipped, and why |
| `AI_WORKFLOW.md` | How I used AI, what I changed, how I tested |
| `SUBMISSION.md` | This file |
| `VIDEO_URL.txt` | Walkthrough video link |
| `src/` | Application code (Next.js + TipTap + Prisma) |
| `prisma/` | Database schema and seed script |
| `__tests__/` | Unit tests for file parsing |
| `package.json` | Dependencies and scripts |
| `.env.example` | Environment config template |

## Live deployment

**https://collaborative-docs-c6hy-adhungana12s-projects.vercel.app**

Deploy path: Vercel + Vercel Postgres (or Neon). Switch the Prisma provider to `postgresql`, set `DATABASE_URL`, deploy. Takes about 15 minutes.

## Test accounts

| Name | Email | Starting state |
|------|-------|----------------|
| Alice Chen | alice@ajaia.com | Owns the sample document |
| Bob Martinez | bob@ajaia.com | Has view access to Alice's doc |
| Carol Wright | carol@ajaia.com | No documents — clean slate |

No passwords. Pick a user from the login screen.

## What works

- Login / logout with user switching
- Create, rename, edit, delete documents
- Rich text: bold, italic, underline, H1-H3, bullet lists, numbered lists
- Auto-save with debounce
- File import (.txt, .md, .docx) creating new editable documents
- Sharing by email with view/edit permissions
- Backend permission enforcement (view-only users get 403 on edits)
- Sidebar showing owned vs. shared documents with permission badges
- Full persistence across refresh

## What's incomplete

**Deployment.** Runs locally only. Deploying requires a Postgres instance and a one-line Prisma config change.

**Auth.** Cookie-based user selection. Works for the demo, but a real version needs proper authentication.

**Mobile.** Functional but not optimized. The sidebar should become an overlay on small screens.

## Next steps (given another 2-4 hours)

1. Production deploy with Postgres
2. Real auth (NextAuth + Google OAuth)
3. Document version history
4. Export to PDF and Markdown
5. Presence indicators
