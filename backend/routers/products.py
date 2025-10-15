from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import ProductMaster

router = APIRouter(
    prefix="/api/products",
    tags=["products"]
)


@router.get("/", summary="商品一覧取得")
def get_products(db: Session = Depends(get_db)):
    """商品マスタから全商品を取得"""
    products = db.query(ProductMaster).all()
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


@router.get("/{product_id}", summary="商品詳細取得")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """指定されたIDの商品を取得"""
    product = db.query(ProductMaster).filter(ProductMaster.PRD_ID == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品が見つかりません")
    
    return {
        "PRD_ID": product.PRD_ID,
        "CODE": product.CODE,
        "NAME": product.NAME,
        "PRICE": product.PRICE
    }


@router.get("/code/{code}", summary="商品コードで商品取得")
def get_product_by_code(code: str, db: Session = Depends(get_db)):
    """商品コードで商品を取得"""
    product = db.query(ProductMaster).filter(ProductMaster.CODE == code).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品が見つかりません")
    
    return {
        "PRD_ID": product.PRD_ID,
        "CODE": product.CODE,
        "NAME": product.NAME,
        "PRICE": product.PRICE
    }

