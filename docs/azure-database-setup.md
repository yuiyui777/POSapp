# Azure Database for MySQL セットアップガイド

このドキュメントでは、Azure Database for MySQLインスタンスのセットアップ手順を説明します。

## 前提条件

- Azureアカウント（無料または有料）
- Azure CLI（オプション、GUIでも可能）

## セットアップ手順

### 方法1: Azureポータル（GUI）でのセットアップ

#### 1. Azureポータルにログイン

https://portal.azure.com にアクセスしてログインします。

#### 2. リソースの作成

1. 左メニューから「リソースの作成」をクリック
2. 検索バーで「Azure Database for MySQL」を検索
3. 「Azure Database for MySQL フレキシブル サーバー」を選択
4. 「作成」をクリック

#### 3. 基本設定

- **サブスクリプション**: 使用するサブスクリプションを選択
- **リソースグループ**: 新規作成（例: `pos-system-rg`）
- **サーバー名**: 一意の名前（例: `pos-mysql-server-123`）
- **地域**: 日本東（Japan East）または 日本西（Japan West）
- **MySQL バージョン**: 8.0（推奨）
- **ワークロードタイプ**: 開発環境の場合は「開発」を選択

#### 4. コンピューティングとストレージ

- **コンピューティング レベル**: 開発環境の場合は「バースト可能」を選択
- **コンピューティング サイズ**: B1s（1 vCore, 1 GB RAM）- 開発環境向け
- **ストレージ**: 20 GB（最小）
- **バックアップ保持期間**: 7日間

#### 5. 認証

- **認証方法**: MySQL認証のみ
- **管理者ユーザー名**: `adminuser`（任意の名前）
- **パスワード**: 強力なパスワードを設定（大文字、小文字、数字、記号を含む）

#### 6. ネットワーク

- **接続方法**: パブリック アクセス
- **ファイアウォール規則**: 
  - 「現在のクライアント IP アドレスを追加」にチェック
  - 必要に応じて他のIPアドレスも追加

**重要**: Azure サービスからのアクセスを許可する場合は、「Azure 内のどの Azure サービスからもこのサーバーへのアクセスを許可する」にチェックを入れます。

#### 7. 確認と作成

1. 「確認および作成」をクリック
2. 設定内容を確認
3. 「作成」をクリック

デプロイには5〜10分かかります。

### 方法2: Azure CLI でのセットアップ

```bash
# Azure CLIにログイン
az login

# リソースグループの作成
az group create --name pos-system-rg --location japaneast

# MySQL フレキシブルサーバーの作成
az mysql flexible-server create \
  --resource-group pos-system-rg \
  --name pos-mysql-server-123 \
  --location japaneast \
  --admin-user adminuser \
  --admin-password 'YourStrongPassword123!' \
  --sku-name Standard_B1s \
  --tier Burstable \
  --storage-size 20 \
  --version 8.0

# ファイアウォール規則の追加（現在のIPアドレスを許可）
az mysql flexible-server firewall-rule create \
  --resource-group pos-system-rg \
  --name pos-mysql-server-123 \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS

# Azure サービスからのアクセスを許可
az mysql flexible-server firewall-rule create \
  --resource-group pos-system-rg \
  --name pos-mysql-server-123 \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## データベースの作成

### 方法1: Azure ポータル

1. 作成したMySQLサーバーに移動
2. 左メニューから「データベース」を選択
3. 「追加」をクリック
4. データベース名を入力（例: `posdb`）
5. 「OK」をクリック

### 方法2: MySQL クライアントを使用

```bash
# MySQL クライアントで接続
mysql -h pos-mysql-server-123.mysql.database.azure.com -u adminuser -p

# データベースの作成
CREATE DATABASE posdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 確認
SHOW DATABASES;

# 終了
exit;
```

### 方法3: Azure CLI

```bash
az mysql flexible-server db create \
  --resource-group pos-system-rg \
  --server-name pos-mysql-server-123 \
  --database-name posdb
```

## 接続情報の取得

### ホスト名

```
pos-mysql-server-123.mysql.database.azure.com
```

### 接続文字列（アプリケーション用）

```
mysql+pymysql://adminuser:YourStrongPassword123!@pos-mysql-server-123.mysql.database.azure.com:3306/posdb
```

## セキュリティのベストプラクティス

### 1. 接続情報の管理

接続情報は環境変数として管理し、コードにハードコーディングしない：

```bash
# backend/.env
DATABASE_URL=mysql+pymysql://adminuser:password@pos-mysql-server-123.mysql.database.azure.com:3306/posdb
```

### 2. SSL/TLS接続の使用

本番環境では必ずSSL/TLS接続を使用してください：

```python
# database.py
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"ssl": {"ssl_mode": "REQUIRED"}}
)
```

### 3. ファイアウォール設定

- 必要最小限のIPアドレスのみを許可
- 開発完了後は不要なファイアウォール規則を削除

### 4. 強力なパスワード

- 最低16文字
- 大文字、小文字、数字、記号を含む
- 定期的に変更

## トラブルシューティング

### 接続できない場合

1. **ファイアウォール規則を確認**
   - 現在のIPアドレスが許可されているか確認
   - Azure ポータルで「接続のセキュリティ」を確認

2. **サーバーの状態を確認**
   - サーバーが「使用可能」状態か確認

3. **接続文字列を確認**
   - ホスト名、ユーザー名、パスワードが正しいか確認

4. **ネットワーク接続を確認**
   ```bash
   # 接続テスト
   telnet pos-mysql-server-123.mysql.database.azure.com 3306
   ```

### エラーメッセージ別の対応

- `Access denied`: ユーザー名またはパスワードが間違っている
- `Can't connect to MySQL server`: ファイアウォール規則を確認
- `Unknown database`: データベースが作成されていない

## コスト管理

### 開発環境の推奨設定

- **コンピューティング**: B1s（約¥1,500/月）
- **ストレージ**: 20 GB（約¥300/月）
- **バックアップ**: 7日間（無料枠内）

**合計**: 約 ¥1,800/月

### コスト削減のヒント

1. 開発中は1つのデータベースを共有
2. 夜間や週末は自動停止を設定
3. 不要になったら必ずリソースを削除

## 次のステップ

1. バックエンドの `.env` ファイルに接続情報を設定
2. `alembic upgrade head` でマイグレーションを実行
3. アプリケーションからの接続をテスト

詳細は [development.md](development.md) を参照してください。

