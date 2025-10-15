# POSアプリケーション - バックエンド

FastAPIベースのPOSシステムバックエンドAPI

## プロジェクト構造

```
backend/
├── app/                     # 新しいアプリケーション構造
│   ├── __init__.py
│   ├── main.py             # 商品コード検索API (Port 8001)
│   ├── crud.py             # データベース操作
│   └── schemas.py          # Pydanticスキーマ
├── models/                  # SQLAlchemyモデル
│   ├── product_master.py
│   ├── transaction.py
│   └── transaction_detail.py
├── routers/                 # APIルーター
│   └── products.py
├── alembic/                 # マイグレーション
├── tests/                   # テスト
│   ├── test_main.py
│   └── MANUAL_TESTS.md     # 手動テスト手順
├── main.py                  # メインAPI (Port 8000)
├── database.py              # データベース接続
├── config.py                # 設定
├── seed_data.py             # テストデータ投入
└── requirements.txt
```

## 2つのAPIサーバー

### 1. メインAPI (Port 8000)
元のAPIサーバー - 複数のエンドポイントを提供

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

アクセス: http://localhost:8000/docs

### 2. 商品コード検索API (Port 8001)
新しいAPI - 商品コード検索に特化

```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8001
```

アクセス: http://localhost:8001/docs

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

### 5. テストデータ投入

```bash
python seed_data.py
```

## 起動方法

### メインAPI（Port 8000）

```bash
uvicorn main:app --reload
```

または

```bash
python main.py
```

サーバーは http://localhost:8000 で起動します。

### 商品コード検索API（Port 8001）

```bash
python -m uvicorn app.main:app --reload --port 8001
```

サーバーは http://localhost:8001 で起動します。

## API エンドポイント

### メインAPI (Port 8000)

- `GET /` - ルート
- `GET /health` - ヘルスチェック
- `GET /api/products/` - 商品一覧
- `GET /api/products/{product_id}` - 商品詳細（ID）
- `GET /api/products/code/{code}` - 商品詳細（コード）

### 商品コード検索API (Port 8001)

- `GET /` - ルート
- `GET /products/{product_code}` - 商品コード検索 ⭐ **メイン機能**
- `GET /api/products/list` - 商品一覧

## テスト

### 手動テスト

```bash
# 商品コード検索
curl http://localhost:8001/products/4589901001018

# 商品一覧
curl http://localhost:8001/api/products/list
```

詳細は `tests/MANUAL_TESTS.md` を参照してください。

### 自動テスト

```bash
pytest tests/test_main.py -v
```

## 開発ガイド

### 新しいCRUD操作を追加

`app/crud.py` に関数を追加：

```python
def get_something(db: Session, id: int):
    return db.query(Model).filter(Model.id == id).first()
```

### 新しいスキーマを追加

`app/schemas.py` にPydanticモデルを追加：

```python
class Something(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True
```

### 新しいエンドポイントを追加

`app/main.py` にエンドポイントを追加：

```python
@app.get("/something/{id}", response_model=schemas.Something)
def get_something(id: int, db: Session = Depends(get_db)):
    result = crud.get_something(db, id)
    if not result:
        raise HTTPException(status_code=404, detail="Not found")
    return result
```

### マイグレーション

```bash
# 新しいマイグレーションを作成
alembic revision --autogenerate -m "説明メッセージ"

# マイグレーションを適用
alembic upgrade head

# ロールバック
alembic downgrade -1
```

## APIドキュメント

各APIサーバー起動後、以下のURLでSwagger UIにアクセス：

- メインAPI: http://localhost:8000/docs
- 商品コード検索API: http://localhost:8001/docs

## ヘルスチェック

```bash
curl http://localhost:8000/health
```
