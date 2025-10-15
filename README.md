# モバイルPOSシステム

バーコードスキャンと購入管理を行うモバイルPOS専用アプリケーションです。

## プロジェクト構成

```
POSapp/
├── backend/          # FastAPIバックエンド
├── frontend/         # Next.jsフロントエンド
└── docs/            # ドキュメント
```

## 技術スタック

### バックエンド
- **FastAPI**: Pythonベースの高速Webフレームワーク
- **SQLAlchemy**: ORM（Object-Relational Mapping）
- **Alembic**: データベースマイグレーションツール
- **Azure Database for MySQL**: マネージドデータベースサービス

### フロントエンド
- **Next.js 14**: Reactベースのフルスタックフレームワーク
- **TypeScript**: 型安全な開発
- **App Router**: Next.jsの最新ルーティングシステム
- **react-zxing**: バーコード/QRコードスキャナー

## 主な機能

### モバイルPOSレジ画面
- 📷 **リアルタイムバーコードスキャン**: カメラを使用した商品スキャン
- 🛒 **購入リスト管理**: スキャンした商品の一覧表示と数量管理
- 💰 **自動計算**: 合計金額の自動計算（税込・税抜）
- ✅ **購入処理**: データベースへの取引記録
- 📱 **レスポンシブデザイン**: モバイル・タブレット対応

## セットアップ

### 前提条件
- Python 3.11以上
- Node.js 18以上
- Azure アカウント（データベース用）

### 開発環境のセットアップ

詳細な手順は [docs/development.md](docs/development.md) を参照してください。

#### 1. バックエンド

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate
pip install -r requirements.txt

# 環境変数を設定
cp .env.example .env
# .env ファイルを編集してデータベース接続情報を設定

# サーバー起動
uvicorn main:app --reload
```

バックエンドは http://localhost:8000 で起動します。

#### 2. フロントエンド

```bash
cd frontend
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local ファイルを編集してAPI URLを設定

# 開発サーバー起動
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。

### データベースセットアップ

Azure Database for MySQLのセットアップ手順は [docs/azure-database-setup.md](docs/azure-database-setup.md) を参照してください。

## Azureへのデプロイ

本番環境へのデプロイ手順については、以下のドキュメントを参照してください：

- **[Azure デプロイガイド](docs/azure-deployment-guide.md)** - 詳細な手順とベストプラクティス
- **[デプロイチェックリスト](docs/deployment-checklist.md)** - デプロイ前の確認事項

### クイックスタート

```bash
# 1. バックエンドをAzure App Serviceにデプロイ
az webapp create --name pos-backend-app --resource-group pos-system-rg --runtime "PYTHON:3.11"

# 2. フロントエンドをAzure Static Web Appsにデプロイ
az staticwebapp create --name pos-frontend --resource-group pos-system-rg --source https://github.com/YOUR_USERNAME/POSapp

# 詳細は上記ドキュメント参照
```

## API エンドポイント

### 商品管理
- `GET /api/products/` - 商品一覧取得
- `GET /api/products/{product_id}` - 商品詳細（ID指定）
- `GET /api/products/code/{code}` - 商品コード検索

### 購入処理 ⭐
- `POST /api/purchase` - 購入処理（取引をDBに保存）

### システム
- `GET /` - API情報
- `GET /health` - ヘルスチェック

## API ドキュメント

バックエンドを起動後、以下のURLでAPIドキュメントにアクセスできます：

- Swagger UI: http://localhost:8000/docs ⭐
- ReDoc: http://localhost:8000/redoc

## 開発ワークフロー

1. 機能ブランチを作成
2. 開発・テスト
3. プルリクエストを作成
4. レビュー後にマージ

## ライセンス

社内プロジェクト

