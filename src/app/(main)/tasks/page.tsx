import { prisma } from "@/lib/prisma";
import { serializeItem, serializeMember } from "@/lib/serialize";
import TasksBoard from "@/components/TasksBoard";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [items, members] = await Promise.all([
    prisma.item.findMany({
      where: { status: { not: "done" } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { comments: true } } },
    }),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">メンバー別タスク</h1>
        <p className="text-sm text-zinc-500">一人ひとりが抱えている未完了の仕事を見える化します。</p>
      </div>
      <TasksBoard items={items.map(serializeItem)} members={members.map(serializeMember)} />
    </div>
  );
}
