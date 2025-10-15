# POSアプリケーション - バックエンド

FastAPIベースのPOSシステムバックエンドAPI

## セットアップ

### 1. 仮想環境の作成と有効化

```bash
python -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate
```

### 2. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 3. 環境変数の設定

`.env.example` を `.env` にコピーして編集：

```bash
cp .env.example .env
```

`.env` ファイルの内容例：

```
DATABASE_URL=mysql+pymysql://username:password@your-azure-mysql.mysql.database.azure.com:3306/posdb
APP_NAME=POS API
DEBUG=True
```

### 4. データベースマイグレーション

```bash
# マイグレーションの初期化（最初の1回のみ）
alembic revision --autogenerate -m "initial migration"

# マイグレーションの適用
alembic upgrade head
```

## 起動方法

### 開発サーバー

```bash
uvicorn main:app --reload
```

または

```bash
python main.py
```

サーバーは http://localhost:8000 で起動します。

### APIドキュメント

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## プロジェクト構造

```
backend/
├── main.py              # FastAPIアプリケーションのエントリーポイント
├── config.py            # アプリケーション設定
├── database.py          # データベース接続設定
├── requirements.txt     # 依存パッケージ
├── alembic.ini          # Alembic設定
└── alembic/
    ├── env.py          # Alembicマイグレーション環境
    └── versions/       # マイグレーションファイル
```

## 開発ガイド

### 新しいマイグレーションの作成

モデルを変更した後：

```bash
alembic revision --autogenerate -m "説明メッセージ"
alembic upgrade head
```

### マイグレーションのロールバック

```bash
alembic downgrade -1  # 1つ前のバージョンに戻す
```

## ヘルスチェック

```bash
curl http://localhost:8000/health
```

