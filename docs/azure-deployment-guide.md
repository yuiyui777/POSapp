# Azureデプロイガイド

このガイドでは、モバイルPOSシステムをAzureにデプロイする手順を説明します。

## 目次

1. [デプロイ構成概要](#デプロイ構成概要)
2. [事前準備](#事前準備)
3. [バックエンドのデプロイ](#バックエンドのデプロイ)
4. [フロントエンドのデプロイ](#フロントエンドのデプロイ)
5. [環境変数の設定](#環境変数の設定)
6. [デプロイ後の確認](#デプロイ後の確認)
7. [CI/CD設定](#cicd設定)
8. [トラブルシューティング](#トラブルシューティング)

---

## デプロイ構成概要

### 推奨Azureサービス構成

```
┌─────────────────────────────────────────────────────┐
│                    Azure Cloud                      │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Azure Static Web Apps                       │  │
│  │  - Next.jsフロントエンド                      │  │
│  │  - 自動HTTPS                                  │  │
│  │  - CDN配信                                    │  │
│  └────────────┬─────────────────────────────────┘  │
│               │ HTTPS                               │
│               ▼                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Azure App Service (Linux)                   │  │
│  │  - FastAPI バックエンド                       │  │
│  │  - Python 3.11                                │  │
│  │  - Auto Scaling                               │  │
│  └────────────┬─────────────────────────────────┘  │
│               │ MySQL Protocol (SSL)                │
│               ▼                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Azure Database for MySQL (既存)             │  │
│  │  - データ永続化                               │  │
│  │  - 自動バックアップ                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### コスト概算

| サービス | プラン | 月額概算 |
|---------|-------|---------|
| Azure Static Web Apps | Free または Standard | ¥0 - ¥1,000 |
| Azure App Service | Basic B1 | ¥1,500 - ¥2,000 |
| Azure Database for MySQL | 既存プラン | (既に使用中) |
| **合計** | | **約¥1,500 - ¥3,000/月** |

---

## 事前準備

### 1. 必要なツールのインストール

```bash
# Azure CLI のインストール（macOS）
brew install azure-cli

# Azure CLIにログイン
az login

# 使用するサブスクリプションを確認
az account list --output table

# サブスクリプションを設定（必要に応じて）
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 2. リソースグループの作成

```bash
# リソースグループを作成（すでにある場合はスキップ）
az group create \
  --name pos-system-rg \
  --location japaneast
```

### 3. GitHub リポジトリの準備

- リポジトリがpublicまたはprivateでGitHubにpushされていること
- デプロイ時にGitHub Actionsを使用するため、GitHub連携が必要

---

## バックエンドのデプロイ

### オプション1: Azure App Service（推奨）

#### ステップ1: App Serviceプランの作成

```bash
# App Service プランの作成（Linux、Basic B1）
az appservice plan create \
  --name pos-backend-plan \
  --resource-group pos-system-rg \
  --location japaneast \
  --is-linux \
  --sku B1
```

#### ステップ2: Web Appの作成

```bash
# Python 3.11 を使用するWeb Appを作成
az webapp create \
  --name pos-backend-app \
  --resource-group pos-system-rg \
  --plan pos-backend-plan \
  --runtime "PYTHON:3.11"
```

#### ステップ3: デプロイ設定

**方法A: GitHub Actionsを使用（推奨）**

1. Azure Portal でWeb Appを開く
2. 「デプロイセンター」→「GitHub」を選択
3. リポジトリとブランチを選択
4. ビルドプロバイダーで「GitHub Actions」を選択
5. 「保存」をクリック

GitHub Actionsワークフローが自動生成されます。

**方法B: ローカルからZIPデプロイ**

```bash
# backendディレクトリに移動
cd backend

# 依存関係を含めてZIPファイル作成
zip -r deploy.zip . -x "venv/*" -x "__pycache__/*" -x "*.pyc"

# デプロイ
az webapp deployment source config-zip \
  --resource-group pos-system-rg \
  --name pos-backend-app \
  --src deploy.zip
```

#### ステップ4: 環境変数の設定

```bash
# データベース接続情報を設定
az webapp config appsettings set \
  --resource-group pos-system-rg \
  --name pos-backend-app \
  --settings \
    DATABASE_URL="mysql+pymysql://USERNAME:PASSWORD@HOSTNAME/DATABASE_NAME?ssl_ca=" \
    DEBUG=False \
    APP_NAME="POS API"
```

#### ステップ5: スタートアップコマンドの設定

Azure Portal > Web App > 「構成」 > 「全般設定」で以下を設定:

```bash
# スタートアップコマンド
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

**requirements.txtにgunicornを追加:**

```txt
# 既存の依存関係...
fastapi==0.104.1
uvicorn[standard]==0.24.0
# ... その他

# 追加
gunicorn==21.2.0
```

---

## フロントエンドのデプロイ

### オプション1: Azure Static Web Apps（推奨）

#### ステップ1: Static Web Appの作成

```bash
# Azure Static Web Apps の作成
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

#### ステップ2: ビルド設定の調整

リポジトリルートに `.github/workflows/azure-static-web-apps-*.yml` が自動生成されます。
以下のように調整:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          api_location: ""
          output_location: ".next"
          app_build_command: "npm run build"
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

#### ステップ3: 環境変数の設定

Azure Portal > Static Web App > 「構成」で環境変数を追加:

- `NEXT_PUBLIC_API_URL`: バックエンドのURL（例: `https://pos-backend-app.azurewebsites.net`）

**またはGitHub Secretsに追加:**

1. GitHubリポジトリ > Settings > Secrets and variables > Actions
2. 「New repository secret」をクリック
3. 以下を追加:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://pos-backend-app.azurewebsites.net`

---

## 環境変数の設定

### バックエンド環境変数

| 変数名 | 説明 | 例 |
|-------|------|---|
| `DATABASE_URL` | MySQL接続文字列 | `mysql+pymysql://user:pass@host/db` |
| `DEBUG` | デバッグモード | `False` (本番環境) |
| `APP_NAME` | アプリケーション名 | `POS API` |

### フロントエンド環境変数

| 変数名 | 説明 | 例 |
|-------|------|---|
| `NEXT_PUBLIC_API_URL` | バックエンドAPI URL | `https://pos-backend-app.azurewebsites.net` |

---

## デプロイ後の確認

### 1. バックエンドの動作確認

```bash
# ヘルスチェック
curl https://pos-backend-app.azurewebsites.net/health

# APIドキュメント確認
# ブラウザで以下を開く
https://pos-backend-app.azurewebsites.net/docs
```

### 2. フロントエンドの動作確認

```bash
# Static Web Appの URL を取得
az staticwebapp show \
  --name pos-frontend \
  --resource-group pos-system-rg \
  --query "defaultHostname" -o tsv
```

ブラウザでURLを開き、POSシステムが正常に動作することを確認。

### 3. E2E テスト

1. フロントエンドにアクセス
2. カメラ権限を許可
3. バーコードをスキャン
4. 商品情報が表示されることを確認
5. 購入リストに追加
6. 購入ボタンをクリック
7. データベースに取引が保存されることを確認

---

## CI/CD設定

### GitHub Actionsワークフロー（完全版）

`.github/workflows/azure-deploy.yml` を作成:

```yaml
name: Deploy to Azure

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        working-directory: ./backend
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: pos-backend-app
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./backend

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install and Build
        working-directory: ./frontend
        run: |
          npm ci
          npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          output_location: ".next"
```

### 必要なGitHub Secrets

1. `AZURE_WEBAPP_PUBLISH_PROFILE`: Azure Portal > Web App > 「発行プロファイルの取得」からダウンロードした内容
2. `AZURE_STATIC_WEB_APPS_API_TOKEN`: 自動生成されたトークン
3. `NEXT_PUBLIC_API_URL`: バックエンドのURL

---

## デプロイ前の準備チェックリスト

### コード準備

- [ ] `requirements.txt`に`gunicorn`を追加
- [ ] バックエンドの環境変数を`.env.example`で文書化
- [ ] フロントエンドの環境変数を`.env.local.example`で文書化
- [ ] ハードコードされたURLを環境変数に置き換え
- [ ] `DEBUG=False`での動作確認
- [ ] CORS設定を本番環境用に調整

### バックエンド: CORS設定の調整

`backend/main.py`:

```python
from config import settings

# CORS設定
origins = [
    "http://localhost:3000",  # 開発環境
    "https://YOUR_STATIC_WEB_APP.azurestaticapps.net",  # 本番環境
]

# または環境変数から読み込む
if settings.FRONTEND_URL:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### データベース

- [ ] Azure Database for MySQLのファイアウォール設定でAzure サービスからのアクセスを許可
- [ ] 本番環境用のデータベースユーザー作成（必要に応じて）
- [ ] SSL接続の確認

### セキュリティ

- [ ] 本番環境の環境変数にパスワードやトークンが含まれていないか確認
- [ ] Azure Key Vaultの使用を検討（機密情報管理）
- [ ] HTTPSのみの通信を強制
- [ ] CORS設定の確認

---

## トラブルシューティング

### バックエンドが起動しない

**症状**: Web Appにアクセスできない

**確認事項**:
1. Azure Portal > Web App > 「ログストリーム」でエラーログを確認
2. スタートアップコマンドが正しいか確認
3. 環境変数が正しく設定されているか確認

```bash
# ログを確認
az webapp log tail \
  --resource-group pos-system-rg \
  --name pos-backend-app
```

### データベース接続エラー

**症状**: `OperationalError: (2003, "Can't connect to MySQL server")`

**確認事項**:
1. Azure Database for MySQLのファイアウォール設定
   - Azure Portal > MySQL Server > 「接続のセキュリティ」
   - 「Azure サービスへのアクセスを許可」をONに
2. 接続文字列が正しいか確認
3. SSL設定が正しいか確認

### フロントエンドからAPIにアクセスできない

**症状**: CORS エラー

**確認事項**:
1. バックエンドのCORS設定にフロントエンドのURLが含まれているか
2. `NEXT_PUBLIC_API_URL`環境変数が正しく設定されているか
3. HTTPとHTTPSの混在がないか（Mixed Content エラー）

### カメラが動作しない

**症状**: カメラ権限エラー

**確認事項**:
1. HTTPSで配信されているか（カメラAPIはHTTPSが必要）
2. ブラウザのカメラ権限設定
3. デバイスにカメラが接続されているか

---

## 本番運用のベストプラクティス

### 1. モニタリング

- **Azure Application Insights**を有効化してパフォーマンス監視
- **Azure Monitor**でアラート設定

```bash
# Application Insights の作成
az monitor app-insights component create \
  --app pos-insights \
  --resource-group pos-system-rg \
  --location japaneast
```

### 2. バックアップ

- Azure Database for MySQLの自動バックアップを確認
- 重要なデータは定期的に手動バックアップ

### 3. スケーリング

- App Serviceのオートスケール設定
- 負荷テストの実施

### 4. セキュリティ

- Azure Security Centerの推奨事項を確認
- 定期的なセキュリティ更新

---

## 参考リソース

- [Azure App Service ドキュメント](https://docs.microsoft.com/ja-jp/azure/app-service/)
- [Azure Static Web Apps ドキュメント](https://docs.microsoft.com/ja-jp/azure/static-web-apps/)
- [FastAPI デプロイガイド](https://fastapi.tiangolo.com/deployment/)
- [Next.js デプロイメント](https://nextjs.org/docs/deployment)

---

## まとめ

このガイドに従ってデプロイを実施することで、モバイルPOSシステムをAzure上で安全に運用できます。

**推奨デプロイ順序**:
1. Azure Database for MySQL（既に設定済み）
2. バックエンド（Azure App Service）
3. フロントエンド（Azure Static Web Apps）
4. CI/CD パイプライン（GitHub Actions）
5. モニタリングとアラート設定

質問や問題が発生した場合は、Azure Portal の「サポート」から問い合わせることができます。

