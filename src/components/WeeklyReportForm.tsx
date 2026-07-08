"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WeeklyReportDTO } from "@/lib/types";

export default function WeeklyReportForm({
  report,
  meetingWeek,
}: {
  report: WeeklyReportDTO | null;
  meetingWeek: string;
}) {
  const router = useRouter();
  const [targetBySummer, setTargetBySummer] = useState(report?.targetBySummer?.toString() ?? "");
  const [currentCount, setCurrentCount] = useState(report?.currentCount?.toString() ?? "");
  const [trialCount, setTrialCount] = useState(report?.trialCount?.toString() ?? "");
  const [concreteActions, setConcreteActions] = useState(report?.concreteActions ?? "");
  const [internalActions, setInternalActions] = useState(report?.internalActions ?? "");
  const [saving, setSaving] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);

  async function save() {
    setSaving(true);
    setSavedJustNow(false);
    await fetch("/api/reports", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meetingWeek,
        targetBySummer,
        currentCount,
        trialCount,
        concreteActions,
        internalActions,
      }),
    });
    setSaving(false);
    setSavedJustNow(true);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">定例議題</h2>
        {report?.isDraft && (
          <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
            前週の内容を引き継いでいます（未保存）
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-sm">
          <span className="block text-zinc-500 mb-1">① 夏までの目標</span>
          <input
            type="number"
            value={targetBySummer}
            onChange={(e) => setTargetBySummer(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="block text-zinc-500 mb-1">② 現状の人数</span>
          <input
            type="number"
            value={currentCount}
            onChange={(e) => setCurrentCount(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="block text-zinc-500 mb-1">③ 体験数</span>
          <input
            type="number"
            value={trialCount}
            onChange={(e) => setTrialCount(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="block text-zinc-500 mb-1">④ 具体的行動</span>
        <textarea
          value={concreteActions}
          onChange={(e) => setConcreteActions(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 whitespace-pre-wrap"
        />
      </label>

      <label className="block text-sm">
        <span className="block text-zinc-500 mb-1">⑤ 内部充実のアクション</span>
        <textarea
          value={internalActions}
          onChange={(e) => setInternalActions(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 whitespace-pre-wrap"
        />
      </label>

      <div className="flex items-center justify-end gap-3">
        {savedJustNow && !saving && <span className="text-xs text-green-600">保存しました</span>}
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
