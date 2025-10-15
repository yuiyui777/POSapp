# 購入API実装ガイド

## 概要

フロントエンドから送られてきた購入リストを受け取り、データベースに「取引」と「取引明細」として記録する購入処理APIの実装ドキュメントです。

---

## API仕様

### エンドポイント

```
POST /api/purchase
```

### リクエスト

**Content-Type:** `application/json`

**ボディ:**
```json
{
  "items": [
    {
      "PRD_ID": 1,
      "CODE": "4589901001018",
      "NAME": "テクワン・消せるボールペン 黒",
      "PRICE": 180
    },
    {
      "PRD_ID": 2,
      "CODE": "4589901001025",
      "NAME": "テクワン・スーパーノート B5 5冊パック",
      "PRICE": 450
    }
  ],
  "emp_cd": "999999999",
  "store_cd": "30",
  "pos_no": "90"
}
```

**パラメータ:**

| フィールド | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| items | array | ✅ | - | 購入商品リスト |
| items[].PRD_ID | int | ✅ | - | 商品ID |
| items[].CODE | string | ✅ | - | 商品コード |
| items[].NAME | string | ✅ | - | 商品名 |
| items[].PRICE | int | ✅ | - | 単価 |
| emp_cd | string | ⬜ | 999999999 | レジ担当者コード |
| store_cd | string | ⬜ | 30 | 店舗コード |
| pos_no | string | ⬜ | 90 | POS機ID |

### レスポンス

**ステータスコード:** `201 Created`

**ボディ:**
```json
{
  "success": true,
  "transaction_id": 1,
  "total_amount": 630,
  "total_amount_ex_tax": 630,
  "items_count": 2
}
```

**フィールド:**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| success | boolean | 成功フラグ |
| transaction_id | int | 取引ID（TRD_ID） |
| total_amount | int | 合計金額 |
| total_amount_ex_tax | int | 合計金額（税抜）|
| items_count | int | 商品点数 |

---

## データベース処理フロー

### 1. 取引テーブルへ登録

```sql
INSERT INTO transactions (
  DATETIME, 
  EMP_CD, 
  STORE_CD, 
  POS_NO, 
  TOTAL_AMT, 
  TTL_AMT_EX_TAX
) VALUES (
  NOW(), 
  '999999999', 
  '30', 
  '90', 
  0, 
  0
)
```

`TRD_ID`が自動採番されます。

### 2. 取引明細テーブルへ登録

各商品について以下を実行：

```sql
INSERT INTO transaction_details (
  TRD_ID, 
  DTL_ID, 
  PRD_ID, 
  PRD_CODE, 
  PRD_NAME, 
  PRD_PRICE, 
  TAX_CD
) VALUES (
  1,           -- 採番されたTRD_ID
  1,           -- 明細連番（1から）
  1,           -- 商品ID
  '4589901001018',
  'テクワン・消せるボールペン 黒',
  180,
  '10'         -- 消費税区分（10%）
)
```

### 3. 合計金額を計算

```python
total_amount = sum([item.PRICE for item in items])
```

### 4. 取引テーブルを更新

```sql
UPDATE transactions 
SET 
  TOTAL_AMT = 630,
  TTL_AMT_EX_TAX = 630
WHERE TRD_ID = 1
```

---

## トランザクション管理

### 成功時

```python
try:
    transaction = crud.create_purchase(db, purchase_request)
    db.commit()  # ✅ コミット
    db.refresh(transaction)
except Exception as e:
    db.rollback()  # エラー発生時はロールバック
    raise HTTPException(...)
```

### エラー時の動作

- データベーストランザクションがロールバック
- `transactions`と`transaction_details`に不完全なデータが残らない
- クライアントに500エラーを返す

---

## エラーハンドリング

### 400 Bad Request

**ケース:** 購入リストが空

```json
{
  "detail": "Purchase list cannot be empty"
}
```

### 500 Internal Server Error

**ケース:** データベースエラー

```json
{
  "detail": "Failed to process purchase: [エラー詳細]"
}
```

---

## 使用例

### cURLでのテスト

```bash
curl -X POST http://localhost:8000/api/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"PRD_ID": 1, "CODE": "4589901001018", "NAME": "テクワン・消せるボールペン 黒", "PRICE": 180},
      {"PRD_ID": 2, "CODE": "4589901001025", "NAME": "テクワン・スーパーノート B5 5冊パック", "PRICE": 450}
    ]
  }'
```

### JavaScriptでの呼び出し

```javascript
const response = await fetch('http://localhost:8000/api/purchase', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: cart.map(product => ({
      PRD_ID: product.PRD_ID,
      CODE: product.CODE,
      NAME: product.NAME,
      PRICE: product.PRICE
    }))
  })
})

const data = await response.json()
console.log('Transaction ID:', data.transaction_id)
```

---

## テストケース

### ケース1: 2商品の購入

**リクエスト:**
- ボールペン（180円）
- ノート（450円）

**期待結果:**
- `transaction_id`: 自動採番
- `total_amount`: 630
- `items_count`: 2

### ケース2: 同じ商品を複数

**リクエスト:**
- ボールペン x3（180円 x 3）

**期待結果:**
- `total_amount`: 540
- `items_count`: 3
- 明細に3レコード作成

### ケース3: 高額商品

**リクエスト:**
- 椅子 x2（12,000円 x 2）

**期待結果:**
- `total_amount`: 24,000
- `items_count`: 2

---

## データベース確認

### 取引データの確認

```sql
SELECT 
  TRD_ID,
  DATETIME,
  EMP_CD,
  STORE_CD,
  POS_NO,
  TOTAL_AMT,
  TTL_AMT_EX_TAX
FROM transactions
ORDER BY TRD_ID DESC;
```

### 取引明細の確認

```sql
SELECT 
  TRD_ID,
  DTL_ID,
  PRD_NAME,
  PRD_PRICE,
  TAX_CD
FROM transaction_details
WHERE TRD_ID = 1
ORDER BY DTL_ID;
```

### 取引と明細の結合

```sql
SELECT 
  t.TRD_ID,
  t.DATETIME,
  t.TOTAL_AMT,
  td.DTL_ID,
  td.PRD_NAME,
  td.PRD_PRICE
FROM transactions t
JOIN transaction_details td ON t.TRD_ID = td.TRD_ID
ORDER BY t.TRD_ID, td.DTL_ID;
```

---

## パフォーマンス

### 期待される処理時間

- **API応答時間:** 100-500ms
- **DB書き込み:** 50-200ms
- **合計:** 150-700ms

### 最適化

- `db.flush()`でTRD_IDを先に取得
- バッチでINSERTを実行
- インデックスを活用

---

## セキュリティ

### 実装済み

- ✅ トランザクション管理（ACID準拠）
- ✅ 入力検証（Pydantic）
- ✅ エラーハンドリング
- ✅ ロールバック機能

### 今後の実装

- ⏳ 認証・認可
- ⏳ レート制限
- ⏳ 不正データチェック

---

## トラブルシューティング

### 購入処理が失敗する

**症状:** 500エラー

**確認ポイント:**
1. データベース接続を確認
2. バックエンドのログを確認
3. 外部キー制約を確認

**解決方法:**
```bash
# ログを確認
tail -f backend/logs/error.log

# データベース接続をテスト
curl http://localhost:8000/health
```

### 取引IDが採番されない

**症状:** `transaction_id`が0または

null

**原因:** `db.flush()`が実行されていない

**解決方法:**
`crud.py`で`db.flush()`を呼び出しているか確認

---

## Swagger UIでのテスト

1. http://localhost:8000/docs を開く
2. `POST /api/purchase` を展開
3. "Try it out" をクリック
4. リクエストボディを入力:
```json
{
  "items": [
    {"PRD_ID": 1, "CODE": "4589901001018", "NAME": "テクワン・消せるボールペン 黒", "PRICE": 180}
  ]
}
```
5. "Execute" をクリック
6. レスポンスを確認

---

## 実装済み機能

- ✅ 購入API（POST /api/purchase）
- ✅ トランザクション管理
- ✅ 取引テーブルへの保存
- ✅ 取引明細テーブルへの保存
- ✅ 合計金額の計算
- ✅ フロントエンドとの統合
- ✅ エラーハンドリング
- ✅ 自動テスト

## 次のステップ

- [ ] 税込金額の正確な計算
- [ ] 取引履歴表示機能
- [ ] 取引詳細表示機能
- [ ] 取引のキャンセル機能
- [ ] レシート印刷機能

---

## 参考資料

- [データベーススキーマ](./database-schema.md)
- [POSUIテストガイド](./pos-ui-testing-guide.md)
- [E2Eテストガイド](./e2e-testing-guide.md)

