"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CampusDTO } from "@/lib/types";

const STORAGE_KEY = "campus_selected_id";

export default function CampusSelector({
  campuses,
  selectedId,
  weekKey,
}: {
  campuses: CampusDTO[];
  selectedId: string | null;
  weekKey: string;
}) {
  const router = useRouter();

  function urlFor(campusId: string | null) {
    const params = new URLSearchParams({ week: weekKey });
    if (campusId) params.set("campus", campusId);
    return `/?${params.toString()}`;
  }

  // URL に campus が無いときは、前回選んだ校舎（有効なら）を復元する。
  useEffect(() => {
    if (selectedId) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && campuses.some((c) => c.id === stored)) {
        router.replace(urlFor(stored));
      }
    } catch {
      // localStorage が使えない環境では何もしない
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, campuses]);

  function onChange(campusId: string) {
    try {
      if (campusId) localStorage.setItem(STORAGE_KEY, campusId);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 保存できなくても続行
    }
    router.push(urlFor(campusId || null));
  }

  if (campuses.length === 0) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-zinc-500">校舎</span>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5"
      >
        <option value="">（未選択）</option>
        {campuses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
