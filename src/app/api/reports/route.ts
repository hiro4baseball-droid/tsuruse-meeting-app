import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeWeeklyReport } from "@/lib/serialize";
import { fromDateKey } from "@/lib/week";

export async function GET(request: NextRequest) {
  const weekParam = request.nextUrl.searchParams.get("week");
  if (!weekParam) {
    return NextResponse.json({ error: "week is required" }, { status: 400 });
  }
  const monday = fromDateKey(weekParam);

  const existing = await prisma.weeklyReport.findUnique({ where: { meetingWeek: monday } });
  if (existing) {
    return NextResponse.json({ report: serializeWeeklyReport(existing, monday, false) });
  }

  // No entry for this week yet: carry over the most recent earlier week's content as a draft.
  const previous = await prisma.weeklyReport.findFirst({
    where: { meetingWeek: { lt: monday } },
    orderBy: { meetingWeek: "desc" },
  });
  if (previous) {
    return NextResponse.json({ report: serializeWeeklyReport(previous, monday, true) });
  }

  return NextResponse.json({ report: null });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.meetingWeek !== "string") {
    return NextResponse.json({ error: "meetingWeek is required" }, { status: 400 });
  }
  const monday = fromDateKey(body.meetingWeek);

  const toIntOrNull = (v: unknown) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };
  const toStringOrNull = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

  const data = {
    targetBySummer: toIntOrNull(body.targetBySummer),
    currentCount: toIntOrNull(body.currentCount),
    trialCount: toIntOrNull(body.trialCount),
    concreteActions: toStringOrNull(body.concreteActions),
    internalActions: toStringOrNull(body.internalActions),
  };

  const report = await prisma.weeklyReport.upsert({
    where: { meetingWeek: monday },
    create: { meetingWeek: monday, ...data },
    update: data,
  });

  return NextResponse.json({ report: serializeWeeklyReport(report, monday, false) });
}
