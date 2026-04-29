import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { fromPlainText, fromMarkdown } from "@/lib/parsers";

const ALLOWED = ["txt", "md", "docx"];

export async function POST(req: NextRequest) {
  const me = await getUser();
  if (!me)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file attached" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.includes(ext)) {
    return NextResponse.json(
      { error: `Can't handle .${ext} files. Try .txt, .md, or .docx` },
      { status: 400 }
    );
  }

  const title = file.name.replace(/\.[^.]+$/, "");
  let content: string;

  try {
    if (ext === "txt") {
      const text = await file.text();
      content = JSON.stringify(fromPlainText(text));
    } else if (ext === "md") {
      const text = await file.text();
      content = JSON.stringify(fromMarkdown(text));
    } else {
      // docx — convert to html with mammoth, let tiptap parse it client-side
      const mammoth = require("mammoth");
      const buf = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.convertToHtml({ buffer: buf });
      content = JSON.stringify({ __html: result.value });
    }
  } catch (err) {
    console.error("File processing failed:", err);
    return NextResponse.json(
      { error: "Something went wrong reading that file" },
      { status: 500 }
    );
  }

  const doc = await db.document.create({
    data: { title, content, ownerId: me.id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ document: doc }, { status: 201 });
}
