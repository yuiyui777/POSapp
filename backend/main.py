"""
FastAPI POSシステム - メインアプリケーション
すべての機能を統合した単一エントリーポイント
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from config import settings
from database import get_db
from routers import products

app = FastAPI(
    title=settings.APP_NAME,
    description="POSシステムのバックエンドAPI - 商品管理、取引管理",
    version="1.0.0",
)

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(products.router)


@app.get("/", tags=["Root"])
def read_root():
    """
    ルートエンドポイント
    APIの基本情報を返す
    """
    return {
        "message": "POS API へようこそ",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "products": "/api/products/",
            "product_by_id": "/api/products/{product_id}",
            "product_by_code": "/api/products/code/{code}"
        }
    }


@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """
    ヘルスチェックエンドポイント
    アプリケーションとデータベースの状態を確認
    """
    try:
        # データベース接続テスト
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
