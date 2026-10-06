"use client";

import { useRouter } from "next/navigation";
import { type ItemDTO, type MemberDTO } from "@/lib/types";
import ItemCard from "./ItemCard";

/** 完了日（日本時間）の「YYYY年M月」 */
function monthLabel(iso: string | null): string {
  if (!iso) return "完了日不明";
  return new Date(iso).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long" });
}

export default function CompletedBoard({ items, members }: { items: ItemDTO[]; members: MemberDTO[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();

  if (items.length === 0) {
    return <p className="text-sm text-zinc-400">完了済みの項目はまだありません</p>;
  }

  // items は完了日の新しい順で渡されるので、出現順のまま月ごとにまとめる
  const groups: { label: string; items: ItemDTO[] }[] = [];
  for (const item of items) {
    const label = monthLabel(item.completedAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.label} className="flex flex-col gap-2">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">
            {group.label}
            <span className="ml-1 text-xs font-normal text-zinc-400">{group.items.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {group.items.map((item) => (
              <ItemCard key={item.id} item={item} onChanged={refresh} members={members} showWeekBadge />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
