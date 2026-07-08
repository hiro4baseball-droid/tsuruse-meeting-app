import Link from "next/link";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/", label: "今週の会議" },
  { href: "/tasks", label: "メンバー別タスク" },
  { href: "/backlog", label: "今後のストック" },
  { href: "/members", label: "メンバー管理" },
];

export default function NavBar() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="font-bold text-zinc-900 dark:text-zinc-50">校舎会議</span>
        <nav className="flex flex-wrap gap-4 text-sm flex-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              {l.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </div>
    </header>
  );
}
