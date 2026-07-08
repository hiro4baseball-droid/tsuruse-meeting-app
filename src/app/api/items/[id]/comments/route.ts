import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/items/[id]/comments">) {
  const { id } = await ctx.params;
  const comments = await prisma.comment.findMany({
    where: { itemId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest, ctx: RouteContext<"/api/items/[id]/comments">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  const author = typeof body.author === "string" && body.author.trim() ? body.author.trim() : "匿名";

  const comment = await prisma.comment.create({
    data: { itemId: id, author, body: body.body.trim() },
  });
  return NextResponse.json({ comment }, { status: 201 });
}
