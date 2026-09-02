import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serializeCampus, serializeItem, serializeMember, serializeWeeklyReport } from "@/lib/serialize";
import { addWeeks, formatWeekLabel, fromDateKey, mondayOf, toDateKey } from "@/lib/week";
import AgendaBoard from "@/components/AgendaBoard";
import CampusSelector from "@/components/CampusSelector";
import WeeklyReportForm from "@/components/WeeklyReportForm";

export const dynamic = "force-dynamic";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; campus?: string }>;
}) {
  const { week, campus } = await searchParams;
  const monday = week ? fromDateKey(week) : mondayOf(new Date());
  const weekKey = toDateKey(monday);
  const isCurrentWeek = weekKey === toDateKey(mondayOf(new Date()));

  const campuses = await prisma.campus.findMany({ orderBy: { name: "asc" } });
  // URL の campus が実在する校舎のときだけ採用する
  const campusId = campus && campuses.some((c) => c.id === campus) ? campus : null;

  const weekLink = (targetMonday: Date) => {
    const params = new URLSearchParams({ week: toDateKey(targetMonday) });
    if (campusId) params.set("campus", campusId);
    return `/?${params.toString()}`;
  };

  const [items, members, thisWeekReport, previousReport] = await Promise.all([
    prisma.item.findMany({
      where: { meetingWeek: monday },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { comments: true } } },
    }),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
    prisma.weeklyReport.findFirst({ where: { meetingWeek: monday, campusId } }),
    prisma.weeklyReport.findFirst({
      where: { meetingWeek: { lt: monday }, campusId },
      orderBy: { meetingWeek: "desc" },
    }),
  ]);

  const report = thisWeekReport
    ? serializeWeeklyReport(thisWeekReport, monday, false)
    : previousReport
      ? serializeWeeklyReport(previousReport, monday, true)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={weekLink(addWeeks(monday, -1))} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
            ← 前週
          </Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatWeekLabel(monday)}の会議</h1>
          <Link href={weekLink(addWeeks(monday, 1))} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
            次週 →
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <CampusSelector campuses={campuses.map(serializeCampus)} selectedId={campusId} weekKey={weekKey} />
          {!isCurrentWeek && (
            <Link href={campusId ? `/?campus=${campusId}` : "/"} className="text-sm text-indigo-600 hover:underline">
              今週に戻る
            </Link>
          )}
        </div>
      </div>

      <WeeklyReportForm
        key={`${campusId ?? "none"}:${weekKey}`}
        report={report}
        meetingWeek={weekKey}
        campusId={campusId}
      />

      <AgendaBoard items={items.map(serializeItem)} members={members.map(serializeMember)} meetingWeek={weekKey} />
    </div>
  );
}
