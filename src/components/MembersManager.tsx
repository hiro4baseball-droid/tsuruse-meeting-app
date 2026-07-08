"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberDTO } from "@/lib/types";

export default function MembersManager({ members }: { members: MemberDTO[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("追加に失敗しました（既に存在する名前かもしれません）");
      return;
    }
    setName("");
    router.refresh();
  }

  async function removeMember(id: string, memberName: string) {
    if (!confirm(`「${memberName}」を削除しますか？`)) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="max-w-md flex flex-col gap-3">
      <form onSubmit={addMember} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="スタッフ名"
          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
        />
        <button type="submit" disabled={busy || !name.trim()} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
          追加
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-zinc-800 dark:text-zinc-100">{m.name}</span>
            <button onClick={() => removeMember(m.id, m.name)} className="text-xs text-red-600 hover:underline">
              削除
            </button>
          </li>
        ))}
        {members.length === 0 && <li className="px-3 py-4 text-sm text-zinc-400 text-center">メンバーが登録されていません</li>}
      </ul>
    </div>
  );
}
