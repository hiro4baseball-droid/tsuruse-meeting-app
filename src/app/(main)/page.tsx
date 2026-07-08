import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serializeItem, serializeMember, serializeWeeklyReport } from "@/lib/serialize";
import { addWeeks, formatWeekLabel, fromDateKey, mondayOf, toDateKey } from "@/lib/week";
import AgendaBoard from "@/components/AgendaBoard";
import WeeklyReportForm from "@/components/WeeklyReportForm";

export const dynamic = "force-dynamic";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const monday = week ? fromDateKey(week) : mondayOf(new Date());
  const weekKey = toDateKey(monday);
  const prevWeekKey = toDateKey(addWeeks(monday, -1));
  const nextWeekKey = toDateKey(addWeeks(monday, 1));
  const isCurrentWeek = weekKey === toDateKey(mondayOf(new Date()));

  const [items, members, thisWeekReport, previousReport] = await Promise.all([
    prisma.item.findMany({
      where: { meetingWeek: monday },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { comments: true } } },
    }),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
    prisma.weeklyReport.findUnique({ where: { meetingWeek: monday } }),
    prisma.weeklyReport.findFirst({
      where: { meetingWeek: { lt: monday } },
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/?week=${prevWeekKey}`} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
            ← 前週
          </Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatWeekLabel(monday)}の会議</h1>
          <Link href={`/?week=${nextWeekKey}`} className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
            次週 →
          </Link>
        </div>
        {!isCurrentWeek && (
          <Link href="/" className="text-sm text-indigo-600 hover:underline">
            今週に戻る
          </Link>
        )}
      </div>

      <WeeklyReportForm report={report} meetingWeek={weekKey} />

      <AgendaBoard items={items.map(serializeItem)} members={members.map(serializeMember)} meetingWeek={weekKey} />
    </div>
  );
}
