# AI Workflow Note

## What I used

Claude (Anthropic) for code generation, architecture decisions, and drafting documentation.

## Where it helped most

**Scaffolding.** Setting up a Next.js project with Prisma, TipTap, Tailwind, and all the config files is about 45 minutes of work I've done enough times to find tedious. I described the stack and data model, and Claude generated the initial file structure. I reviewed each file before using it, but the time savings were real — probably 30-40 minutes reclaimed.

**API routes.** The CRUD routes follow a predictable pattern: check auth, validate input, hit the database, return a response. I described the access control rules and let Claude generate the routes, then read through them to make sure the permission checks were correct. The pattern is repetitive enough that AI handles it well.

**TipTap integration.** I've used TipTap before but not recently, and the API surface is large. Having Claude generate the initial editor setup with toolbar buttons saved me from flipping through docs for every method name. I spent my time tuning the experience instead of looking up `toggleHeading` syntax.

**Markdown parser.** The regex-based converter from markdown to TipTap JSON was generated and then reviewed. The first version had a bug where it didn't group consecutive list items into a single list node — I caught that in testing and fixed it.

## What I changed

**Auth approach.** Claude initially suggested a JWT-based auth system with bcrypt password hashing. That's the "correct" general-purpose answer, but wrong for this context. I replaced it with cookie-based user selection because the goal is demonstrating sharing behavior, not building a login system.

**Editor styling.** The generated CSS was generic — system fonts, default spacing. I replaced it with DM Sans for body text and Newsreader for headings, adjusted the line height and padding to feel comfortable for long-form writing, and added a custom caret color. Small things, but they make the difference between "this is a demo" and "someone thought about this."

**DOCX handling.** Claude's first version tried to convert Mammoth's HTML output to TipTap JSON on the server. That's unnecessary — TipTap can parse HTML natively on the client. I changed the upload endpoint to pass the HTML through with a `__html` flag and let the editor handle it, which is simpler and less likely to break.

**Error messages.** AI-generated error responses tend to be either too generic ("Something went wrong") or too technical ("Prisma P2002 unique constraint violation"). I went through each endpoint and wrote error messages that a user would actually find useful: "No user with that email," "That's you — can't share with yourself," etc.

## What I rejected

**Yjs for real-time collaboration.** Claude suggested it. I said no. It would have consumed the entire timebox for a feature the prompt explicitly calls optional.

**shadcn/ui component library.** Suggested as a faster path for the UI. I preferred writing the components directly because (a) there are only a few of them, and (b) I wanted the design to feel intentional rather than assembled from a kit.

## How I verified things worked

I tested manually by logging in as each of the three users and running through the core flows: creating documents, editing with each formatting option, uploading .txt and .md files, sharing with different permission levels, confirming that view-only users can't edit, deleting documents, and refreshing to make sure everything persisted.

I wrote unit tests for the file parsing utilities, since that's the code most likely to have edge-case bugs (regex matching, list grouping, empty line handling).

I read through every API route to verify that permission checks happen before mutations, that error responses use correct HTTP status codes, and that Prisma queries are parameterized (they are by default, but worth confirming).
