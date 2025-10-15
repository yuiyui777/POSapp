"""
API Tests for product search functionality
"""
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.main import app
from starlette.testclient import TestClient

client = TestClient(app)


def test_read_root():
    """ルートエンドポイントのテスト"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "docs" in response.json()


def test_read_product_success():
    """商品コード検索成功のテスト"""
    # テストデータの商品コード
    response = client.get("/products/4589901001018")
    assert response.status_code == 200
    data = response.json()
    assert data["CODE"] == "4589901001018"
    assert data["NAME"] == "テクワン・消せるボールペン 黒"
    assert data["PRICE"] == 180


def test_read_product_not_found():
    """商品が見つからない場合のテスト"""
    response = client.get("/products/9999999999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_list_products():
    """商品一覧取得のテスト"""
    response = client.get("/products/")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "products" in data
    assert data["count"] >= 5  # テストデータが5件以上あることを確認


def test_list_products_with_pagination():
    """ページネーション付き商品一覧取得のテスト"""
    response = client.get("/products/?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] <= 2  # 最大2件取得

