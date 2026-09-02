import { prisma } from "@/lib/prisma";
import { serializeCampus } from "@/lib/serialize";
import CampusManager from "@/components/CampusManager";

export const dynamic = "force-dynamic";

export default async function CampusesPage() {
  const campuses = await prisma.campus.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">校舎管理</h1>
        <p className="text-sm text-zinc-500">
          定例議題（目標・現状・体験数・具体的行動・内部充実のアクション）を校舎ごとに管理するための一覧です。
        </p>
      </div>
      <CampusManager campuses={campuses.map(serializeCampus)} />
    </div>
  );
}
