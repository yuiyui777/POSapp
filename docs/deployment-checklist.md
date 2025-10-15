# Azureデプロイチェックリスト

このチェックリストを使用して、デプロイ前の準備が完了しているか確認してください。

## デプロイ前の準備

### 1. コード準備 ✓

#### バックエンド
- [x] `requirements.txt`に`gunicorn==21.2.0`を追加
- [ ] `backend/.env`ファイルを作成（`env.example.txt`を参考に）
- [ ] 本番環境用のデータベース接続情報を確認
- [ ] `DEBUG=False`での動作をローカルで確認
- [ ] CORS設定に本番環境のフロントエンドURLを追加予定

#### フロントエンド
- [ ] `frontend/.env.local`ファイルを作成（`env.local.example.txt`を参考に）
- [ ] バックエンドAPIのURLを環境変数で管理していることを確認
- [ ] ビルドが成功することを確認 (`npm run build`)

### 2. Azure リソース準備

#### 共通
- [ ] Azure CLIをインストール済み
- [ ] `az login`でAzureにログイン済み
- [ ] リソースグループを作成済み（または作成予定）

#### データベース
- [ ] Azure Database for MySQLが作成済み
- [ ] ファイアウォール設定で「Azureサービスへのアクセスを許可」をON
- [ ] SSL接続が有効
- [ ] 接続情報（ホスト名、ユーザー名、パスワード、データベース名）を控えている

#### バックエンド
- [ ] App Service プランを作成予定（またはB1以上のプランを選択）
- [ ] Web App名を決定（グローバルで一意である必要がある）
- [ ] 環境変数の値を準備
  - `DATABASE_URL`
  - `APP_NAME`
  - `DEBUG=False`
  - `FRONTEND_URL`（デプロイ後に設定）

#### フロントエンド
- [ ] Static Web App名を決定
- [ ] GitHubリポジトリとの連携準備
- [ ] 環境変数の値を準備
  - `NEXT_PUBLIC_API_URL`（バックエンドURL、デプロイ後に設定）

### 3. GitHub準備

- [ ] GitHubリポジトリにコードがpush済み
- [ ] mainブランチが最新状態
- [ ] GitHub Actionsを使用する場合、ワークフローファイルを準備

### 4. セキュリティ

- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] パスワードやトークンがコードにハードコードされていない
- [ ] HTTPSでの通信を確認予定

---

## デプロイ手順

### ステップ1: バックエンドのデプロイ

```bash
# App Service プランの作成
az appservice plan create \
  --name pos-backend-plan \
  --resource-group pos-system-rg \
  --location japaneast \
  --is-linux \
  --sku B1

# Web Appの作成
az webapp create \
  --name pos-backend-app \
  --resource-group pos-system-rg \
  --plan pos-backend-plan \
  --runtime "PYTHON:3.11"

# 環境変数の設定
az webapp config appsettings set \
  --resource-group pos-system-rg \
  --name pos-backend-app \
  --settings \
    DATABASE_URL="YOUR_DATABASE_URL" \
    DEBUG=False \
    APP_NAME="POS API"
```

**スタートアップコマンドを設定:**
Azure Portal > Web App > 「構成」 > 「全般設定」
```
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

**デプロイ:**
- GitHub Actionsを使用する場合: リポジトリへのpushで自動デプロイ
- 手動デプロイの場合: Azure Portal > デプロイセンターから設定

**確認:**
```bash
curl https://pos-backend-app.azurewebsites.net/health
```

### ステップ2: フロントエンドのデプロイ

```bash
# Static Web Appの作成（GitHub連携）
az staticwebapp create \
  --name pos-frontend \
  --resource-group pos-system-rg \
  --location japaneast \
  --source https://github.com/YOUR_USERNAME/POSapp \
  --branch main \
  --app-location "/frontend" \
  --output-location ".next" \
  --login-with-github
```

**環境変数の設定:**
Azure Portal > Static Web App > 「構成」
- `NEXT_PUBLIC_API_URL`: バックエンドのURL（`https://pos-backend-app.azurewebsites.net`）

**確認:**
```bash
# Static Web AppのURLを取得
az staticwebapp show \
  --name pos-frontend \
  --resource-group pos-system-rg \
  --query "defaultHostname" -o tsv
```
ブラウザでURLを開いて動作確認

### ステップ3: CORS設定の更新

バックエンドの環境変数に`FRONTEND_URL`を追加:
```bash
az webapp config appsettings set \
  --resource-group pos-system-rg \
  --name pos-backend-app \
  --settings \
    FRONTEND_URL="https://YOUR_STATIC_WEB_APP.azurestaticapps.net"
```

---

## デプロイ後の確認

### 機能テスト

- [ ] フロントエンドにアクセスできる
- [ ] バックエンドAPIにアクセスできる (`/docs`エンドポイント確認)
- [ ] カメラが起動する（HTTPSが必要）
- [ ] バーコードスキャンが動作する
- [ ] 商品情報が正しく表示される
- [ ] 購入リストへの追加が動作する
- [ ] 購入処理が成功する
- [ ] データベースに取引が記録される

### パフォーマンステスト

- [ ] ページの読み込み速度を確認
- [ ] APIのレスポンス時間を確認
- [ ] 複数デバイスからの同時アクセスをテスト

### セキュリティ確認

- [ ] HTTPSで通信されている
- [ ] 環境変数が正しく設定されている
- [ ] データベース接続がSSLで暗号化されている
- [ ] 不要なエンドポイントが公開されていない

---

## トラブルシューティング

### バックエンドが起動しない
```bash
# ログを確認
az webapp log tail \
  --resource-group pos-system-rg \
  --name pos-backend-app
```

### フロントエンドからAPIにアクセスできない
1. CORSエラーを確認（開発者ツールのConsole）
2. バックエンドの`FRONTEND_URL`環境変数を確認
3. HTTPとHTTPSの混在がないか確認

### データベース接続エラー
1. ファイアウォール設定を確認
2. 接続文字列を確認
3. SSL設定を確認

---

## ロールバック手順

### バックエンド
```bash
# 以前のバージョンにロールバック
az webapp deployment list-publishing-profiles \
  --resource-group pos-system-rg \
  --name pos-backend-app
```

### フロントエンド
GitHub > Actions > 前回成功したワークフローを再実行

---

## 次のステップ

デプロイが成功したら:
1. [ ] モニタリングとアラートの設定（Application Insights）
2. [ ] 定期的なバックアップの確認
3. [ ] ドキュメントの更新
4. [ ] ユーザーテストの実施
5. [ ] パフォーマンスの最適化

---

## 参考情報

- [完全なデプロイガイド](./azure-deployment-guide.md)
- [Azure App Service ドキュメント](https://docs.microsoft.com/ja-jp/azure/app-service/)
- [Azure Static Web Apps ドキュメント](https://docs.microsoft.com/ja-jp/azure/static-web-apps/)

