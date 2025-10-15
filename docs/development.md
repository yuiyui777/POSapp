# 開発環境セットアップガイド

このドキュメントでは、POSアプリケーションの開発環境をセットアップする手順を説明します。

## 目次

1. [前提条件](#前提条件)
2. [リポジトリのクローン](#リポジトリのクローン)
3. [バックエンドのセットアップ](#バックエンドのセットアップ)
4. [フロントエンドのセットアップ](#フロントエンドのセットアップ)
5. [データベースのセットアップ](#データベースのセットアップ)
6. [アプリケーションの起動](#アプリケーションの起動)
7. [トラブルシューティング](#トラブルシューティング)

## 前提条件

開発を開始する前に、以下のソフトウェアをインストールしてください。

### 必須ソフトウェア

- **Python 3.11以上**
  ```bash
  python --version  # 3.11以上であることを確認
  ```

- **Node.js 18以上**
  ```bash
  node --version   # 18.0.0以上であることを確認
  npm --version    # 9.0.0以上であることを確認
  ```

- **Git**
  ```bash
  git --version
  ```

### 推奨ソフトウェア

- **VS Code** または他のコードエディタ
- **MySQL Workbench** または他のデータベースクライアント
- **Postman** または他のAPIクライアント

## リポジトリのクローン

```bash
# GitHubからクローン
git clone <repository-url>
cd POSapp
```

## バックエンドのセットアップ

### 1. ディレクトリに移動

```bash
cd backend
```

### 2. Python仮想環境の作成

```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

仮想環境が有効化されると、プロンプトに `(venv)` が表示されます。

### 3. 依存パッケージのインストール

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集して、データベース接続情報を設定：

```
DATABASE_URL=mysql+pymysql://adminuser:password@pos-mysql-server-123.mysql.database.azure.com:3306/posdb
APP_NAME=POS API
DEBUG=True
```

**重要**: `.env` ファイルはGitにコミットしないでください（`.gitignore`に含まれています）。

### 5. データベースマイグレーションの準備

```bash
# Alembicのバージョン管理ディレクトリを確認
ls alembic/versions/

# 初回のマイグレーションを作成（モデルを追加した後）
alembic revision --autogenerate -m "initial migration"

# マイグレーションを適用
alembic upgrade head
```

### 6. バックエンドの起動確認

```bash
uvicorn main:app --reload
```

ブラウザで以下のURLにアクセスして確認：

- API ルート: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs
- ヘルスチェック: http://localhost:8000/health

正常に起動できたら `Ctrl+C` で停止します。

## フロントエンドのセットアップ

### 1. 新しいターミナルを開く

バックエンドとは別のターミナルウィンドウを開きます。

### 2. ディレクトリに移動

```bash
cd frontend
```

### 3. 依存パッケージのインストール

```bash
npm install
```

または

```bash
yarn install
```

### 4. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` ファイルを編集：

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. フロントエンドの起動確認

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスして確認します。

正常に起動できたら `Ctrl+C` で停止します。

## データベースのセットアップ

データベースのセットアップについては [azure-database-setup.md](azure-database-setup.md) を参照してください。

### クイックスタート

1. Azureポータルでデータベースを作成
2. 接続情報を取得
3. `backend/.env` に設定
4. マイグレーションを実行

```bash
cd backend
source venv/bin/activate  # 仮想環境を有効化
alembic upgrade head
```

## アプリケーションの起動

### 開発モードで両方を起動

#### ターミナル1: バックエンド

```bash
cd backend
source venv/bin/activate  # macOS/Linux
# または venv\Scripts\activate  # Windows
uvicorn main:app --reload
```

#### ターミナル2: フロントエンド

```bash
cd frontend
npm run dev
```

### 確認

1. **フロントエンド**: http://localhost:3000
   - ホームページが表示されるか確認
   - API接続状態が「✅ 接続成功」になっているか確認

2. **バックエンド**: http://localhost:8000/docs
   - Swagger UIが表示されるか確認
   - `/health` エンドポイントをテスト

## 開発ワークフロー

### 1. 新しい機能の開発

```bash
# 機能ブランチを作成
git checkout -b feature/your-feature-name

# 開発作業...

# 変更をコミット
git add .
git commit -m "feat: 機能の説明"

# リモートにプッシュ
git push origin feature/your-feature-name
```

### 2. データベーススキーマの変更

```bash
# バックエンドでモデルを変更
# 例: backend/models/user.py

# マイグレーションを自動生成
cd backend
alembic revision --autogenerate -m "add user table"

# マイグレーションファイルを確認
# alembic/versions/xxx_add_user_table.py

# マイグレーションを適用
alembic upgrade head

# ロールバックが必要な場合
alembic downgrade -1
```

### 3. 新しいAPIエンドポイントの追加

```bash
# バックエンドでルーターを作成
# 例: backend/routers/users.py

# main.py にルーターを追加

# フロントエンドでAPI呼び出しを実装
# 例: frontend/src/app/users/page.tsx
```

## トラブルシューティング

### バックエンドが起動しない

#### エラー: `ModuleNotFoundError`

```bash
# 仮想環境が有効化されているか確認
which python  # macOS/Linux
where python  # Windows

# 依存パッケージを再インストール
pip install -r requirements.txt
```

#### エラー: データベース接続エラー

```bash
# .env ファイルの DATABASE_URL を確認
cat .env

# データベースへの接続をテスト
python -c "from database import engine; engine.connect()"
```

### フロントエンドが起動しない

#### エラー: `Module not found`

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### エラー: ポートが既に使用されている

```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 別のポートで起動
PORT=3001 npm run dev
```

### API接続エラー

#### CORS エラー

バックエンドの `main.py` で CORS 設定を確認：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントエンドのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### ネットワークエラー

1. バックエンドが起動しているか確認: http://localhost:8000/health
2. フロントエンドの `.env.local` で `NEXT_PUBLIC_API_URL` を確認
3. ブラウザのコンソールでエラーメッセージを確認

## 便利なコマンド

### バックエンド

```bash
# 依存パッケージの追加
pip install package-name
pip freeze > requirements.txt

# コードフォーマット
pip install black
black .

# リンター
pip install flake8
flake8 .

# テスト実行
pip install pytest
pytest
```

### フロントエンド

```bash
# 依存パッケージの追加
npm install package-name

# リンター
npm run lint

# 本番ビルド
npm run build
npm start
```

### データベース

```bash
# マイグレーション履歴を表示
alembic history

# 現在のバージョンを表示
alembic current

# 特定のバージョンにマイグレート
alembic upgrade <revision_id>
alembic downgrade <revision_id>
```

## 次のステップ

1. モデルの定義（`backend/models/`）
2. APIエンドポイントの実装（`backend/routers/`）
3. フロントエンドのページ作成（`frontend/src/app/`）
4. 認証・認可の実装
5. テストの作成

## 追加リソース

- [FastAPI ドキュメント](https://fastapi.tiangolo.com/)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [SQLAlchemy ドキュメント](https://docs.sqlalchemy.org/)
- [Alembic ドキュメント](https://alembic.sqlalchemy.org/)

## サポート

問題が発生した場合は、チームメンバーに相談してください。

