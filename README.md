# 🐄 牧場管理システム — プレテスト環境

## 構成
- **フロントエンド / API**: Next.js 14 (Pages Router) → Vercel
- **データベース**: MySQL（既存サーバー）+ phpMyAdmin
- **認証**: セッションCookie（HMAC-SHA256署名・追加ライブラリなし）
- **AI診断**: Anthropic Claude API（サーバーサイド経由）

---

## セットアップ手順

### 1. DBセットアップ（phpMyAdmin）
`sql/` フォルダのSQLを順番に実行:
```
00_create_database.sql  → DBを作成
01_masters.sql          → 牛舎・スタッフ・種牛マスタ
02_cattle.sql           → 個体・母牛・分娩テーブル
03_records.sql          → 体重・健康・子牛販売テーブル
04_user.sql             → アプリ専用ユーザー作成 ⚠️パスワード要変更
```

### 2. 環境変数設定
`.env.local.example` を `.env.local` にコピーして値を設定:
```bash
cp .env.local.example .env.local
# .env.local を編集して各値を設定
```

### 3. ローカル起動
```bash
npm install
npm run dev
# http://localhost:3000 でアクセス
```

### 4. Vercelデプロイ
```bash
git init && git add . && git commit -m "initial"
git remote add origin https://github.com/YOUR/farm-management.git
git push -u origin main
# Vercel でリポジトリをインポートし、環境変数を登録してDeploy
```

---

## 認証情報の設定（必須）
`.env.local` に以下を設定:
```
ADMIN_USERNAME=admin（任意のユーザー名）
ADMIN_PASSWORD=（16文字以上の強力なパスワード）
SESSION_SECRET=（openssl rand -base64 32 で生成）
```

## ディレクトリ構成
```
farm-management/
├── middleware.ts          # 全ページ認証ガード
├── pages/
│   ├── _app.tsx           # ヘッダー・ログアウトボタン
│   ├── index.tsx          # ダッシュボード
│   ├── auth/login.tsx     # ログイン画面
│   └── api/
│       ├── auth/          # login / logout / me
│       ├── cattle/        # 個体 CRUD
│       ├── weight/        # 体重記録
│       ├── health/        # 健康記録
│       ├── breeding/      # 母牛・種牛・分娩登録
│       ├── calf-sales/    # 子牛販売台帳
│       ├── ai/            # AI診断
│       └── masters.ts     # マスタ一括取得
├── lib/
│   ├── db.ts              # MySQL接続プール
│   └── withAuth.ts        # API認証ガードラッパー
├── types/index.ts         # 共通型定義
├── sql/                   # DBセットアップSQL（phpMyAdmin用）
└── .env.local.example     # 環境変数テンプレート
```
