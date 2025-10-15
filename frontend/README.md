# POSアプリケーション - フロントエンド

Next.js 14 + TypeScriptで構築されたPOSシステムのフロントエンド

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

または

```bash
yarn install
```

### 2. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして編集：

```bash
cp .env.local.example .env.local
```

`.env.local` ファイルの内容例：

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 起動方法

### 開発サーバー

```bash
npm run dev
```

または

```bash
yarn dev
```

アプリケーションは http://localhost:3000 で起動します。

### 本番ビルド

```bash
npm run build
npm start
```

## プロジェクト構造

```
frontend/
├── src/
│   └── app/
│       ├── layout.tsx      # ルートレイアウト
│       ├── page.tsx        # ホームページ
│       └── globals.css     # グローバルスタイル
├── public/                 # 静的ファイル
├── package.json           # 依存パッケージ
├── tsconfig.json          # TypeScript設定
└── next.config.js         # Next.js設定
```

## 技術スタック

- **Next.js 14**: App Routerを使用
- **React 18**: UIライブラリ
- **TypeScript**: 型安全な開発

## 開発ガイド

### 新しいページの追加

`src/app/` ディレクトリ内に新しいフォルダを作成し、`page.tsx` を追加：

```typescript
// src/app/about/page.tsx
export default function About() {
  return <div>About Page</div>
}
```

### APIの呼び出し

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL
const response = await fetch(`${apiUrl}/endpoint`)
const data = await response.json()
```

## リンター

```bash
npm run lint
```

