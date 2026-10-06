import { prisma } from "@/lib/prisma";
import { serializeItem, serializeMember } from "@/lib/serialize";
import CompletedBoard from "@/components/CompletedBoard";

export const dynamic = "force-dynamic";

export default async function CompletedPage() {
  // 完了日時の記録を始める前に完了していた項目は、最終更新日時を完了日時として一度だけ埋める。
  await prisma.$executeRaw`UPDATE "Item" SET "completedAt" = "updatedAt" WHERE "status" = 'done' AND "completedAt" IS NULL`;

  const [items, members] = await Promise.all([
    prisma.item.findMany({
      where: { status: "done" },
      orderBy: [{ completedAt: "desc" }],
      include: { _count: { select: { comments: true } } },
    }),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">完了済み</h1>
        <p className="text-sm text-zinc-500">完了にした議題・課題・タスクの記録です。完了した日が新しい順に並びます。</p>
      </div>
      <CompletedBoard items={items.map(serializeItem)} members={members.map(serializeMember)} />
    </div>
  );
}
