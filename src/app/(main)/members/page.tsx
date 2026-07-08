import { prisma } from "@/lib/prisma";
import { serializeMember } from "@/lib/serialize";
import MembersManager from "@/components/MembersManager";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await prisma.member.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">メンバー管理</h1>
        <p className="text-sm text-zinc-500">担当者の候補として使うスタッフ一覧です。</p>
      </div>
      <MembersManager members={members.map(serializeMember)} />
    </div>
  );
}
