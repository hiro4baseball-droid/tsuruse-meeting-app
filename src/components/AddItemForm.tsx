"use client";

import { useState } from "react";
import { CATEGORY_LABEL, type Category, type MemberDTO } from "@/lib/types";
import { useDisplayName } from "@/hooks/useDisplayName";

export default function AddItemForm({
  members,
  defaultCategory,
  lockCategory,
  defaultAssignee,
  meetingWeek,
  onCreated,
}: {
  members: MemberDTO[];
  defaultCategory: Category;
  lockCategory?: boolean;
  defaultAssignee?: string;
  meetingWeek: string | null;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [assignee, setAssignee] = useState(defaultAssignee ?? "");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [displayName] = useDisplayName();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        assignee: assignee || null,
        dueDate: dueDate || null,
        meetingWeek,
        createdBy: displayName || null,
      }),
    });
    setBusy(false);
    setTitle("");
    setDescription("");
    setAssignee("");
    setDueDate("");
    setOpen(false);
    onCreated();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 py-2 text-sm text-zinc-500 hover:border-indigo-400 hover:text-indigo-600"
      >
        ＋ 追加
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="詳細・メモ（任意）"
        rows={2}
        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        {!lockCategory && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
          >
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
        {!defaultAssignee && (
          <input
            list="member-options"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="担当者"
            className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
          />
        )}
        <datalist id="member-options">
          {members.map((m) => (
            <option key={m.id} value={m.name} />
          ))}
        </datalist>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          キャンセル
        </button>
        <button type="submit" disabled={busy || !title.trim()} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
          追加
        </button>
      </div>
    </form>
  );
}
