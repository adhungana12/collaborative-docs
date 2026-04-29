import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function seed() {
  // three demo accounts — no passwords, just pick one to log in
  const alice = await db.user.upsert({
    where: { email: 'alice@ajaia.com' },
    update: {},
    create: { email: 'alice@ajaia.com', name: 'Alice Chen' },
  });

  const bob = await db.user.upsert({
    where: { email: 'bob@ajaia.com' },
    update: {},
    create: { email: 'bob@ajaia.com', name: 'Bob Martinez' },
  });

  await db.user.upsert({
    where: { email: 'carol@ajaia.com' },
    update: {},
    create: { email: 'carol@ajaia.com', name: 'Carol Wright' },
  });

  // give alice a starter document so the app isn't empty on first load
  const welcomeContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Welcome to CollabDocs' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This is a sample document. Try editing it, or create something new from the sidebar.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'What you can do' }],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', marks: [{ type: 'bold' }], text: 'Format text' },
                  { type: 'text', text: ' — bold, italic, underline, headings, lists' },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', marks: [{ type: 'bold' }], text: 'Import files' },
                  { type: 'text', text: ' — drop in a .txt, .md, or .docx to create a doc' },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', marks: [{ type: 'bold' }], text: 'Share with others' },
                  { type: 'text', text: ' — invite someone by email, pick view or edit access' },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: 'Everything saves automatically as you type.',
          },
        ],
      },
    ],
  };

  const doc = await db.document.upsert({
    where: { id: 'welcome-doc' },
    update: {},
    create: {
      id: 'welcome-doc',
      title: 'Welcome to CollabDocs',
      content: JSON.stringify(welcomeContent),
      ownerId: alice.id,
    },
  });

  // share it with bob so he has something in "shared with me"
  await db.documentShare.upsert({
    where: { documentId_userId: { documentId: doc.id, userId: bob.id } },
    update: {},
    create: {
      documentId: doc.id,
      userId: bob.id,
      permission: 'view',
    },
  });

  console.log('✓ Seeded 3 users + 1 sample doc');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
