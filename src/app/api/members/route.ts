import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const members = await prisma.member.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  try {
    const member = await prisma.member.create({ data: { name: body.name.trim() } });
    return NextResponse.json({ member }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "already exists" }, { status: 409 });
  }
}
