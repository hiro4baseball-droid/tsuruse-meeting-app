import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeWeeklyReport } from "@/lib/serialize";
import { fromDateKey } from "@/lib/week";

/** クエリ/ボディの campus 値を campusId（string）か null に正規化する。 */
function normalizeCampusId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET(request: NextRequest) {
  const weekParam = request.nextUrl.searchParams.get("week");
  if (!weekParam) {
    return NextResponse.json({ error: "week is required" }, { status: 400 });
  }
  const monday = fromDateKey(weekParam);
  const campusId = normalizeCampusId(request.nextUrl.searchParams.get("campus"));

  const existing = await prisma.weeklyReport.findFirst({ where: { meetingWeek: monday, campusId } });
  if (existing) {
    return NextResponse.json({ report: serializeWeeklyReport(existing, monday, false) });
  }

  // この週（この校舎）の入力がまだ無い場合は、直近の過去週の内容を下書きとして引き継ぐ。
  const previous = await prisma.weeklyReport.findFirst({
    where: { meetingWeek: { lt: monday }, campusId },
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
  const campusId = normalizeCampusId(body.campusId);

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

  // (meetingWeek, campusId) が複合ユニーク。campusId が null のとき Postgres は
  // NULL を区別するため upsert が使えないので、find → update/create で処理する。
  const existing = await prisma.weeklyReport.findFirst({ where: { meetingWeek: monday, campusId } });
  const report = existing
    ? await prisma.weeklyReport.update({ where: { id: existing.id }, data })
    : await prisma.weeklyReport.create({ data: { meetingWeek: monday, campusId, ...data } });

  return NextResponse.json({ report: serializeWeeklyReport(report, monday, false) });
}
