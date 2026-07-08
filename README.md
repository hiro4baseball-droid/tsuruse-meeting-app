# 校舎会議アプリ

毎週の校舎会議の議題を事前に確認・準備するためのアプリです。

## 主な機能

- **今週の会議**（トップページ）: 議題・課題共有・個人タスクをカテゴリ別に登録し、前週/次週も確認可能
- **メンバー別タスク**: 誰がどんな仕事を抱えているかをメンバーごとに一覧表示（見える化）
- **今後のストック**: まだ会議の週が決まっていない議題・課題を溜めておき、準備でき次第「今週の会議」に割り当て
- **メンバー管理**: 担当者候補となるスタッフの登録・削除
- 各カードは展開すると詳細説明・事前コメント（メモ）のやり取りができます
- ログインはスタッフ全員共通の合言葉（共通パスワード）方式です

## 技術構成

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL（`@prisma/adapter-pg` 経由）
- 認証: 共通パスワード + 署名付きCookie（DB不要のシンプルな実装）
- デプロイ: GitHub + Vercel

## ローカル開発

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を参考に `.env` を編集してください。

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
SHARED_PASSWORD="ログイン用の合言葉"
SESSION_SECRET="ランダムな長い文字列（openssl rand -hex 32 などで生成）"
```

`DATABASE_URL` には実際に使う PostgreSQL への接続文字列を指定します（後述の Vercel Postgres を先に作成し、その接続文字列をローカルでも使うのがおすすめです）。

### 3. テーブルの作成

```bash
npx prisma db push
```

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 を開き、`SHARED_PASSWORD` に設定した合言葉でログインします。

## GitHub へ登録する

```bash
git add -A
git commit -m "Initial commit"
gh repo create campus-meeting-app --private --source=. --remote=origin --push
```

`gh` コマンドが無い場合は、GitHub上で空のリポジトリを作成し、案内される手順（`git remote add origin ...` / `git push -u origin main`）を実行してください。

## Vercel へデプロイする

1. [vercel.com](https://vercel.com) にログインし、「Add New... → Project」から先ほど作成した GitHub リポジトリを import します。
2. プロジェクトの **Storage** タブから Postgres データベースを作成し、プロジェクトに接続します（`DATABASE_URL` などの環境変数が自動で追加されます）。
   - 接続後に生成される環境変数名がプロジェクトによって異なる場合があります。`DATABASE_URL` という名前で参照できるように、Settings → Environment Variables で確認・調整してください。
3. Settings → Environment Variables に以下を追加します（Production / Preview 両方）。
   - `SHARED_PASSWORD`: スタッフ全員に共有する合言葉
   - `SESSION_SECRET`: ランダムな長い文字列
4. ローカルから一度だけテーブルを作成します（Vercel Postgres の接続文字列を `.env` の `DATABASE_URL` に設定した状態で）:
   ```bash
   npx prisma db push
   ```
5. Deploy を実行します。以後は `main` ブランチに push するたびに自動でデプロイされます。

### スキーマを後から変更した場合

`prisma/schema.prisma` を変更したら、本番DBにも反映するため手元から一度だけ実行してください。

```bash
npx prisma db push
```

## 使い方の流れ

1. 「メンバー管理」でスタッフを登録
2. 会議の準備期間中、議題や課題を「今後のストック」または「今週の会議」に追加し、担当者・期限を設定
3. カードを展開して事前コメント・メモで認識合わせ
4. 「メンバー別タスク」で各自の抱えている仕事を随時確認
5. 会議当日は「今週の会議」を開いてそのまま進行
