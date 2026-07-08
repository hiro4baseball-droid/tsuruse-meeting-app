"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
      ログアウト
    </button>
  );
}
