"""
FastAPI Application - Main Entry Point
商品コード検索APIを含むメインアプリケーション
"""
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app import crud, schemas
from database import get_db
from config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="POSシステムのバックエンドAPI - 商品コード検索機能",
    version="0.2.0",
)


@app.get("/", tags=["Root"])
def read_root():
    """ルートエンドポイント"""
    return {
        "message": "POS API (app/main.py) - 商品コード検索",
        "docs": "/docs",
        "version": "0.2.0"
    }


@app.get("/products/{product_code}", response_model=schemas.Product, tags=["Products"])
def read_product(product_code: str, db: Session = Depends(get_db)):
    """
    商品コードで商品を検索
    
    - **product_code**: 商品コード（バーコード）
    
    商品が見つからない場合は404エラーを返します。
    """
    db_product = crud.get_product_by_code(db, code=product_code)
    if db_product is None:
        # 仕様書の「NULL情報を返す」をREST APIの慣習に則り404 Not Foundとして解釈
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@app.get("/api/products/list", tags=["Products"])
def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    商品一覧を取得
    
    - **skip**: スキップする件数（ページング用）
    - **limit**: 取得する最大件数
    """
    products = crud.get_products(db, skip=skip, limit=limit)
    return {
        "count": len(products),
        "products": [
            {
                "PRD_ID": p.PRD_ID,
                "CODE": p.CODE,
                "NAME": p.NAME,
                "PRICE": p.PRICE
            }
            for p in products
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)

