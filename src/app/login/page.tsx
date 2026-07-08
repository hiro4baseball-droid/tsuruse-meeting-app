import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">校舎会議アプリ</h1>
        <p className="text-sm text-zinc-500 mb-6">合言葉を入力してログインしてください</p>
        <LoginForm nextPath={next ?? "/"} />
      </div>
    </div>
  );
}
