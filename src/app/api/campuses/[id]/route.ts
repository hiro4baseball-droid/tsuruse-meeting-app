import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/campuses/[id]">) {
  const { id } = await ctx.params;
  try {
    // 校舎に紐づく定例議題も一緒に削除する
    await prisma.weeklyReport.deleteMany({ where: { campusId: id } });
    await prisma.campus.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
