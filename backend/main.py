from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from config import settings
from database import get_db

app = FastAPI(
    title=settings.APP_NAME,
    description="POSシステムのバックエンドAPI",
    version="0.1.0",
)

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """ルートエンドポイント"""
    return {
        "message": "POS API へようこそ",
        "docs": "/docs",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    ヘルスチェックエンドポイント
    データベース接続も確認する
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
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

