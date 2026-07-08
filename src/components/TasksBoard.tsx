"use client";

import { useRouter } from "next/navigation";
import { type ItemDTO, type MemberDTO } from "@/lib/types";
import ItemCard from "./ItemCard";
import AddItemForm from "./AddItemForm";

export default function TasksBoard({ items, members }: { items: ItemDTO[]; members: MemberDTO[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const names = [...members.map((m) => m.name)];
  for (const item of items) {
    if (item.assignee && !names.includes(item.assignee)) names.push(item.assignee);
  }
  const unassigned = items.some((i) => !i.assignee);
  const groups = [...names, ...(unassigned ? ["担当未定"] : [])];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((name) => {
        const groupItems = items.filter((i) => (name === "担当未定" ? !i.assignee : i.assignee === name));
        return (
          <div key={name} className="flex flex-col gap-2">
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">
              {name}
              <span className="ml-1 text-xs font-normal text-zinc-400">{groupItems.length}</span>
            </h2>
            {groupItems.length === 0 && <p className="text-xs text-zinc-400">対応中のタスクはありません</p>}
            {groupItems.map((item) => (
              <ItemCard key={item.id} item={item} onChanged={refresh} showWeekBadge />
            ))}
            {name !== "担当未定" && (
              <AddItemForm
                members={members}
                defaultCategory="task"
                lockCategory
                defaultAssignee={name}
                meetingWeek={null}
                onCreated={refresh}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
