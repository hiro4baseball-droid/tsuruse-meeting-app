"use client";

import { useState } from "react";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  type Category,
  type CommentDTO,
  type ItemDTO,
  type MemberDTO,
  type Status,
} from "@/lib/types";
import { useDisplayName } from "@/hooks/useDisplayName";

const CATEGORY_STYLE: Record<string, string> = {
  agenda: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  issue: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  task: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

const STATUS_STYLE: Record<string, string> = {
  todo: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  done: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 line-through decoration-1",
};

export default function ItemCard({
  item,
  onChanged,
  extraAction,
  showWeekBadge,
  members = [],
}: {
  item: ItemDTO;
  onChanged: () => void;
  extraAction?: { label: string; onClick: (item: ItemDTO) => void };
  showWeekBadge?: boolean;
  members?: MemberDTO[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<CommentDTO[] | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [displayName, setDisplayName] = useDisplayName();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDescription, setEditDescription] = useState(item.description ?? "");
  const [editCategory, setEditCategory] = useState<Category>(item.category);
  const [editAssignee, setEditAssignee] = useState(item.assignee ?? "");
  const [editDueDate, setEditDueDate] = useState(item.dueDate ? item.dueDate.slice(0, 10) : "");

  function startEdit() {
    setEditTitle(item.title);
    setEditDescription(item.description ?? "");
    setEditCategory(item.category);
    setEditAssignee(item.assignee ?? "");
    setEditDueDate(item.dueDate ? item.dueDate.slice(0, 10) : "");
    setEditing(true);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setBusy(true);
    await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        category: editCategory,
        assignee: editAssignee || null,
        dueDate: editDueDate || null,
      }),
    });
    setBusy(false);
    setEditing(false);
    onChanged();
  }

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && comments === null) {
      setLoadingComments(true);
      const res = await fetch(`/api/items/${item.id}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
      setLoadingComments(false);
    }
  }

  async function changeStatus(status: Status) {
    setBusy(true);
    await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    onChanged();
  }

  async function remove() {
    if (!confirm(`「${item.title}」を削除しますか？`)) return;
    setBusy(true);
    await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    setBusy(false);
    onChanged();
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    const res = await fetch(`/api/items/${item.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: displayName || "匿名", body: commentBody }),
    });
    const data = await res.json();
    setComments((prev) => [...(prev ?? []), data.comment]);
    setCommentBody("");
    onChanged();
  }

  // Date.now() is impure, but a badge color that's stale by a render cycle is harmless here.
  // eslint-disable-next-line react-hooks/purity
  const dueSoon = item.dueDate && item.status !== "done" && new Date(item.dueDate).getTime() < Date.now();

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[item.category]}`}>
              {CATEGORY_LABEL[item.category]}
            </span>
            {item.assignee && (
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                担当: {item.assignee}
              </span>
            )}
            {showWeekBadge && (
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                {item.meetingWeek
                  ? `${new Date(item.meetingWeek).getUTCMonth() + 1}/${new Date(item.meetingWeek).getUTCDate()}の週`
                  : "ストック"}
              </span>
            )}
            {item.dueDate && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  dueSoon
                    ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                期限: {item.dueDate.slice(0, 10)}
              </span>
            )}
          </div>
          <button onClick={toggleExpand} className="text-left font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
            {item.title}
          </button>
        </div>
        <select
          value={item.status}
          disabled={busy}
          onChange={(e) => changeStatus(e.target.value as Status)}
          className={`shrink-0 rounded-full border-0 px-2 py-1 text-xs font-medium ${STATUS_STYLE[item.status]}`}
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-3">
          {editing ? (
            <form onSubmit={saveEdit} className="space-y-2">
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="タイトル"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="詳細・メモ（任意）"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm whitespace-pre-wrap"
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as Category)}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
                >
                  {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  list={`edit-member-options-${item.id}`}
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  placeholder="担当者"
                  className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
                />
                <datalist id={`edit-member-options-${item.id}`}>
                  {members.map((m) => (
                    <option key={m.id} value={m.name} />
                  ))}
                </datalist>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={busy || !editTitle.trim()}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </form>
          ) : (
            item.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{item.description}</p>
            )
          )}

          {!editing && (
            <div className="flex flex-wrap gap-2">
              {extraAction && (
                <button
                  onClick={() => extraAction.onClick(item)}
                  className="text-xs rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-1 hover:bg-indigo-100"
                >
                  {extraAction.label}
                </button>
              )}
              <button
                onClick={startEdit}
                className="text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                編集
              </button>
              <button onClick={remove} className="text-xs rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 px-2 py-1 hover:bg-red-100">
                削除
              </button>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-zinc-500 mb-1">事前コメント・メモ</p>
            {loadingComments && <p className="text-xs text-zinc-400">読み込み中...</p>}
            <ul className="space-y-1 mb-2">
              {comments?.map((c) => (
                <li key={c.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-medium">{c.author}: </span>
                  {c.body}
                </li>
              ))}
              {comments?.length === 0 && <li className="text-xs text-zinc-400">まだコメントはありません</li>}
            </ul>
            <form onSubmit={addComment} className="flex gap-2">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="名前"
                className="w-20 shrink-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 text-sm"
              />
              <input
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="コメントを追加"
                className="flex-1 min-w-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 text-sm"
              />
              <button type="submit" className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-500">
                追加
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
