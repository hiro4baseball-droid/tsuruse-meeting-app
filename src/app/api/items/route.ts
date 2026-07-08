import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fromDateKey } from "@/lib/week";

const CATEGORIES = ["agenda", "issue", "task"] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const meetingWeek = searchParams.get("meetingWeek"); // dateKey | "backlog" | null (=all)
  const assignee = searchParams.get("assignee");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (assignee) where.assignee = assignee;
  if (meetingWeek === "backlog") {
    where.meetingWeek = null;
  } else if (meetingWeek) {
    where.meetingWeek = fromDateKey(meetingWeek);
  }

  const items = await prisma.item.findMany({
    where,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { comments: true } } },
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      title: body.title.trim(),
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      category: body.category,
      assignee: typeof body.assignee === "string" && body.assignee ? body.assignee : null,
      dueDate: typeof body.dueDate === "string" && body.dueDate ? new Date(body.dueDate) : null,
      meetingWeek:
        typeof body.meetingWeek === "string" && body.meetingWeek
          ? fromDateKey(body.meetingWeek)
          : null,
      createdBy: typeof body.createdBy === "string" && body.createdBy ? body.createdBy : null,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
