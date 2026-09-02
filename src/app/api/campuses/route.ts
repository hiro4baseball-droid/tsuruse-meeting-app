import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const campuses = await prisma.campus.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ campuses });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  try {
    const campus = await prisma.campus.create({ data: { name: body.name.trim() } });
    return NextResponse.json({ campus }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "already exists" }, { status: 409 });
  }
}
