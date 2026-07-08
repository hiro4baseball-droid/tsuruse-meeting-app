import { prisma } from "@/lib/prisma";
import { serializeItem, serializeMember } from "@/lib/serialize";
import { mondayOf, toDateKey } from "@/lib/week";
import BacklogBoard from "@/components/BacklogBoard";

export const dynamic = "force-dynamic";

export default async function BacklogPage() {
  const [items, members] = await Promise.all([
    prisma.item.findMany({
      where: { meetingWeek: null },
      orderBy: [{ createdAt: "asc" }],
      include: { _count: { select: { comments: true } } },
    }),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">今後のストック</h1>
        <p className="text-sm text-zinc-500">まだ会議の週が決まっていない議題・課題・タスクの置き場です。準備ができたら今週の会議に割り当てましょう。</p>
      </div>
      <BacklogBoard items={items.map(serializeItem)} members={members.map(serializeMember)} currentWeekKey={toDateKey(mondayOf(new Date()))} />
    </div>
  );
}
