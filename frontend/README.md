# POSアプリケーション - フロントエンド

Next.js 14 + TypeScriptで構築されたPOSシステムのフロントエンド

## プロジェクト構造

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # ホームページ
│   │   ├── pos/
│   │   │   └── page.tsx        # POSレジ画面 ⭐
│   │   └── scanner/
│   │       └── page.tsx        # バーコードスキャナー
│   └── components/
│       ├── BarcodeScannerComponent.tsx     # バーコードスキャンUI
│       ├── ScannedProductDisplay.tsx       # 商品情報表示
│       └── PurchaseList.tsx                # 購入リスト
├── public/                     # 静的ファイル
├── package.json               # 依存パッケージ
└── .env.local                 # 環境変数
```

## 画面構成

### 1. ホームページ (`/`)
- API接続状態の確認
- 各機能へのナビゲーション

### 2. POSレジ画面 (`/pos`) ⭐
UIimage.mdの仕様に基づいた完全なPOSシステム

**機能:**
- ① バーコードスキャンボタン
- ② コード表示エリア
- ③ 名称表示エリア
- ④ 単価表示エリア
- ⑤ 購入リストへ追加ボタン
- ⑥ 購入品目リスト（名称/数量/単価/単品合計）
- ⑦ 購入ボタン

**フロー:**
1. 「スキャン (カメラ)」をクリック
2. バーコードをスキャン
3. 商品情報をAPI経由で取得・表示
4. 「追加」ボタンで購入リストに追加
5. ②③④エリアがクリアされる
6. 繰り返しスキャンして商品を追加
7. 「購入」ボタンで購入確定
8. 合計金額（税込・税抜）をポップアップ表示

### 3. バーコードスキャナー (`/scanner`)
シンプルなバーコードスキャンと商品検索のデモページ

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成：

```bash
cp .env.local.example .env.local
```

`.env.local` の内容：

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 開発サーバー起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## コンポーネント説明

### BarcodeScannerComponent
バーコードスキャン機能を提供

**Props:**
- `onScan: (code: string) => void` - スキャン成功時のコールバック
- `isScanning: boolean` - スキャナーの有効/無効

### ScannedProductDisplay
スキャンした商品情報を表示

**Props:**
- `product: Product | null` - 商品情報
- `onAddToCart: (product: Product) => void` - 追加ボタンのコールバック
- `error: string` - エラーメッセージ
- `isLoading: boolean` - ローディング状態

### PurchaseList
購入リスト（カート）を表示

**Props:**
- `cart: Product[]` - カート内の商品配列
- `totalAmount: number` - 合計金額

**機能:**
- 同じ商品をグループ化
- 数量を自動集計
- 単品合計を計算
- 合計金額と商品点数を表示

## 状態管理

POSページでは以下のStateを管理：

```typescript
const [isScanning, setIsScanning] = useState(false)      // スキャナー状態
const [scannedProduct, setScannedProduct] = useState<Product | null>(null)  // スキャン商品
const [cart, setCart] = useState<Product[]>([])          // カート
const [isLoading, setIsLoading] = useState(false)        // ローディング
const [error, setError] = useState('')                   // エラー
```

## API連携

### エンドポイント

- `GET /health` - ヘルスチェック（ホームページ）
- `GET /api/products/code/{code}` - 商品コード検索（POSページ）

### リクエスト例

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const response = await fetch(`${apiUrl}/api/products/code/${code}`)
const product = await response.json()
```

## 使用技術

- **Next.js 14**: App Router
- **React 18**: UIライブラリ
- **TypeScript**: 型安全な開発
- **react-zxing**: バーコードスキャンライブラリ

## 開発ガイド

### 新しいページを追加

```bash
mkdir src/app/your-page
touch src/app/your-page/page.tsx
```

### 新しいコンポーネントを追加

```bash
touch src/components/YourComponent.tsx
```

### コンポーネントの使用

```typescript
import YourComponent from '@/components/YourComponent'

export default function Page() {
  return <YourComponent prop1="value" />
}
```

## トラブルシューティング

### カメラが起動しない

1. ブラウザのカメラ許可を確認
2. HTTPSまたはlocalhostでアクセスしているか確認
3. 他のアプリがカメラを使用していないか確認

### API接続エラー

1. バックエンドが起動しているか確認
   ```bash
   curl http://localhost:8000/health
   ```

2. `.env.local` の設定を確認
   ```bash
   cat .env.local
   ```

3. CORS設定を確認（バックエンド側）

### バーコードが読み取れない

1. バーコードを拡大表示
2. 照明を調整
3. カメラとバーコードの距離を調整（10-30cm推奨）

## パフォーマンス最適化

- `useMemo` で合計金額計算を最適化
- コンポーネント分割で再レンダリングを最小化
- イミュータブルな状態更新

## 次の実装予定

- [ ] 購入処理のDB保存
- [ ] 取引履歴の表示
- [ ] 商品削除機能
- [ ] 数量変更機能
- [ ] レシート印刷機能

## 関連ドキュメント

- [E2Eテストガイド](../../docs/e2e-testing-guide.md)
- [開発環境セットアップ](../../docs/development.md)
