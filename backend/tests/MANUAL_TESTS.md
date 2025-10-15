# 手動テスト手順

## 商品コード検索API のテスト

### 前提条件
- バックエンドサーバーが http://localhost:8001 で起動していること
- テストデータが投入されていること

### テストケース

#### 1. ルートエンドポイント
```bash
curl http://localhost:8001/
```

**期待結果:**
```json
{
    "message": "POS API (app/main.py) - 商品コード検索",
    "docs": "/docs",
    "version": "0.2.0"
}
```

#### 2. 商品コード検索 - 成功
```bash
curl http://localhost:8001/products/4589901001018
```

**期待結果:**
```json
{
    "PRD_ID": 1,
    "CODE": "4589901001018",
    "NAME": "テクワン・消せるボールペン 黒",
    "PRICE": 180
}
```

#### 3. 商品コード検索 - 別の商品
```bash
curl http://localhost:8001/products/4589901001032
```

**期待結果:**
```json
{
    "PRD_ID": 3,
    "CODE": "4589901001032",
    "NAME": "ハイブリッドカッター Pro",
    "PRICE": 800
}
```

#### 4. 商品コード検索 - 存在しない商品
```bash
curl http://localhost:8001/products/9999999999999
```

**期待結果:** HTTP 404
```json
{
    "detail": "Product not found"
}
```

#### 5. 商品一覧取得
```bash
curl http://localhost:8001/api/products/list
```

**期待結果:**
```json
{
    "count": 5,
    "products": [
        {
            "PRD_ID": 1,
            "CODE": "4589901001018",
            "NAME": "テクワン・消せるボールペン 黒",
            "PRICE": 180
        },
        ...
    ]
}
```

#### 6. 商品一覧取得 - ページネーション
```bash
curl "http://localhost:8001/api/products/list?skip=0&limit=2"
```

**期待結果:** 最大2件の商品が返される

### Swagger UI でのテスト

http://localhost:8001/docs にアクセスして、各エンドポイントをGUIでテストできます。

## テスト結果

すべてのエンドポイントが正常に動作することを確認しました。

- ✅ ルートエンドポイント
- ✅ 商品コード検索（存在する商品）
- ✅ 商品コード検索（存在しない商品で404）
- ✅ 商品一覧取得
- ✅ ページネーション

## 実行日: 2025-10-16

