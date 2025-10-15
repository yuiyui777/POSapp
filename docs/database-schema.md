# データベーススキーマ設計書

## 概要

POSシステムのデータベーススキーマ定義です。Azure Database for MySQL上で動作します。

## ER図（テーブル関係）

```
product_master (商品マスタ)
  ├── PRD_ID (PK)
  ├── CODE (UNIQUE)
  ├── NAME
  └── PRICE

transactions (取引ヘッダ)
  ├── TRD_ID (PK)
  ├── DATETIME
  ├── EMP_CD
  ├── STORE_CD
  ├── POS_NO
  ├── TOTAL_AMT
  └── TTL_AMT_EX_TAX

transaction_details (取引明細)
  ├── TRD_ID (PK, FK -> transactions)
  ├── DTL_ID (PK)
  ├── PRD_ID (FK -> product_master)
  ├── PRD_CODE
  ├── PRD_NAME
  ├── PRD_PRICE
  └── TAX_CD
```

## テーブル定義

### 1. product_master（商品マスタ）

商品情報を管理するマスタテーブル

| カラム名 | 型 | NULL | キー | 説明 |
|---------|-----|------|------|------|
| PRD_ID | INT | NO | PK | 商品一意キー（自動採番） |
| CODE | VARCHAR(25) | NO | UNIQUE | 商品コード（バーコード） |
| NAME | VARCHAR(50) | NO | - | 商品名称 |
| PRICE | INT | NO | - | 商品単価（円） |

**インデックス:**
- PRIMARY KEY: PRD_ID
- UNIQUE INDEX: CODE

**サンプルデータ:**

| PRD_ID | CODE | NAME | PRICE |
|--------|------|------|-------|
| 1 | 4589901001018 | テクワン・消せるボールペン 黒 | 180 |
| 2 | 4589901001025 | テクワン・スーパーノート B5 5冊パック | 450 |
| 3 | 4589901001032 | ハイブリッドカッター Pro | 800 |
| 4 | 4589901001049 | スマート付箋 5色ミックス | 320 |
| 5 | 4589901001056 | 疲れない椅子 Alpha (ポップアップ限定) | 12000 |

### 2. transactions（取引ヘッダ）

各取引の基本情報を管理

| カラム名 | 型 | NULL | キー | デフォルト | 説明 |
|---------|-----|------|------|----------|------|
| TRD_ID | INT | NO | PK | - | 取引一意キー（自動採番） |
| DATETIME | DATETIME | NO | - | CURRENT_TIMESTAMP | 取引日時 |
| EMP_CD | VARCHAR(10) | YES | - | NULL | レジ担当者コード |
| STORE_CD | VARCHAR(5) | YES | - | NULL | 店舗コード |
| POS_NO | VARCHAR(3) | YES | - | NULL | POS機ID |
| TOTAL_AMT | INT | YES | - | NULL | 合計金額（税込） |
| TTL_AMT_EX_TAX | INT | YES | - | NULL | 合計金額（税抜） |

**インデックス:**
- PRIMARY KEY: TRD_ID

### 3. transaction_details（取引明細）

取引の商品明細を管理

| カラム名 | 型 | NULL | キー | 説明 |
|---------|-----|------|------|------|
| TRD_ID | INT | NO | PK, FK | 取引一意キー |
| DTL_ID | INT | NO | PK | 取引明細一意キー |
| PRD_ID | INT | NO | FK | 商品一意キー |
| PRD_CODE | VARCHAR(13) | NO | - | 商品コード（スナップショット） |
| PRD_NAME | VARCHAR(50) | NO | - | 商品名称（スナップショット） |
| PRD_PRICE | INT | NO | - | 商品単価（スナップショット） |
| TAX_CD | VARCHAR(2) | YES | - | 消費税区分 |

**インデックス:**
- PRIMARY KEY: (TRD_ID, DTL_ID)
- INDEX: PRD_ID

**外部キー制約:**
- `fk_transaction_details_transactions`: TRD_ID → transactions(TRD_ID)
- `fk_transaction_details_product_master`: PRD_ID → product_master(PRD_ID)

## データ整合性

### 外部キー制約

すべての外部キーは以下のルールで設定されています：

- **ON DELETE**: NO ACTION（親レコードの削除を防止）
- **ON UPDATE**: NO ACTION（親レコードの更新を防止）

### スナップショット設計

`transaction_details`テーブルでは、商品情報（コード、名称、単価）をスナップショットとして保持しています。これにより：

1. 取引時点の商品情報を保持
2. 後から商品マスタが変更されても過去の取引データに影響しない
3. 商品マスタから商品が削除されても取引履歴は保持される

## マイグレーション管理

### Alembicの使用

データベースのバージョン管理にはAlembicを使用しています。

```bash
# マイグレーションの作成
cd backend
source venv/bin/activate
alembic revision --autogenerate -m "説明"

# マイグレーションの適用
alembic upgrade head

# マイグレーションのロールバック
alembic downgrade -1

# 現在のバージョン確認
alembic current

# マイグレーション履歴
alembic history
```

### 既存マイグレーション

| バージョン | 日時 | 説明 |
|-----------|------|------|
| 75867baf3a62 | 2025-10-16 | Create product_master, transactions and transaction_details tables |

## テストデータ

### 投入方法

```bash
cd backend
source venv/bin/activate
python3 seed_data.py
```

### データ内容

5件の文房具・オフィス製品のテストデータが投入されます。

## API エンドポイント

データベースにアクセスするためのAPIエンドポイント：

### 商品関連

- `GET /api/products/` - 商品一覧取得
- `GET /api/products/{product_id}` - 商品詳細取得（ID指定）
- `GET /api/products/code/{code}` - 商品詳細取得（コード指定）

### 使用例

```bash
# 商品一覧
curl http://localhost:8000/api/products/

# 特定商品（ID）
curl http://localhost:8000/api/products/1

# 特定商品（コード）
curl http://localhost:8000/api/products/code/4589901001018
```

## データベース接続情報

接続情報は `backend/.env` で管理されています：

```
DATABASE_URL=mysql+pymysql://username:password@hostname:3306/yui
```

### SSL接続

Azure MySQLへの接続にはSSL/TLSが必須です。`database.py`で自動的に設定されています。

## トラブルシューティング

### テーブルが作成されない

```bash
# マイグレーションを確認
alembic current

# マイグレーションを適用
alembic upgrade head
```

### データが表示されない

```bash
# データ投入を実行
python3 seed_data.py
```

### SSL接続エラー

`database.py`のSSL設定を確認してください：

```python
connect_args={
    "ssl": {"ca": None}  # Azure MySQLはSSL必須
}
```

## パフォーマンス考慮事項

### インデックス

- 商品コード（CODE）にはUNIQUEインデックスが設定されています
- 取引明細の商品ID（PRD_ID）にはインデックスが設定されています

### 将来的な最適化候補

1. 取引日時（DATETIME）へのインデックス追加
2. 店舗コード（STORE_CD）へのインデックス追加
3. パーティショニング（取引データが大量になった場合）

## セキュリティ

### アクセス制御

- データベースユーザーは最小権限の原則に従う
- 本番環境では読み取り専用ユーザーを別途作成推奨

### 機密情報

- パスワードは`.env`ファイルで管理（Gitには含めない）
- SSL/TLS接続の使用（必須）

## バックアップ

Azure Database for MySQLの自動バックアップ機能を使用してください：

- バックアップ保持期間: 7日間（推奨）
- ポイントインタイムリストア可能

## 参考資料

- [Azure Database for MySQL ドキュメント](https://docs.microsoft.com/ja-jp/azure/mysql/)
- [SQLAlchemy ドキュメント](https://docs.sqlalchemy.org/)
- [Alembic ドキュメント](https://alembic.sqlalchemy.org/)

