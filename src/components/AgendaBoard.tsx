"use client";

import { useRouter } from "next/navigation";
import { CATEGORY_LABEL, type Category, type ItemDTO, type MemberDTO } from "@/lib/types";
import ItemCard from "./ItemCard";
import AddItemForm from "./AddItemForm";

const CATEGORIES: Category[] = ["agenda", "issue", "task"];

export default function AgendaBoard({
  items,
  members,
  meetingWeek,
}: {
  items: ItemDTO[];
  members: MemberDTO[];
  meetingWeek: string;
}) {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CATEGORIES.map((category) => {
        const categoryItems = items.filter((i) => i.category === category);
        return (
          <div key={category} className="flex flex-col gap-2">
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">
              {CATEGORY_LABEL[category]}
              <span className="ml-1 text-xs font-normal text-zinc-400">{categoryItems.length}</span>
            </h2>
            {categoryItems.map((item) => (
              <ItemCard key={item.id} item={item} onChanged={refresh} members={members} />
            ))}
            <AddItemForm
              members={members}
              defaultCategory={category}
              lockCategory
              meetingWeek={meetingWeek}
              onCreated={refresh}
            />
          </div>
        );
      })}
    </div>
  );
}
