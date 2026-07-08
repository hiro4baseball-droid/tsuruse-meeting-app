import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fromDateKey } from "@/lib/week";

const STATUSES = ["todo", "in_progress", "done"] as const;
const CATEGORIES = ["agenda", "issue", "task"] as const;

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/items/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "invalid title" }, { status: 400 });
    }
    data.title = body.title.trim();
  }
  if (body.description !== undefined) {
    data.description = typeof body.description === "string" ? body.description.trim() || null : null;
  }
  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "invalid category" }, { status: 400 });
    }
    data.category = body.category;
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.assignee !== undefined) {
    data.assignee = typeof body.assignee === "string" && body.assignee ? body.assignee : null;
  }
  if (body.dueDate !== undefined) {
    data.dueDate = typeof body.dueDate === "string" && body.dueDate ? new Date(body.dueDate) : null;
  }
  if (body.meetingWeek !== undefined) {
    data.meetingWeek =
      typeof body.meetingWeek === "string" && body.meetingWeek ? fromDateKey(body.meetingWeek) : null;
  }

  try {
    const item = await prisma.item.update({ where: { id }, data });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/items/[id]">) {
  const { id } = await ctx.params;
  try {
    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
