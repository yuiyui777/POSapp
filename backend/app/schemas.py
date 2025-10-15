"""
Pydantic schemas for API request/response models
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Product(BaseModel):
    """商品スキーマ"""
    PRD_ID: int
    CODE: str
    NAME: str
    PRICE: int

    class Config:
        from_attributes = True  # SQLAlchemyモデルからPydanticモデルへ変換できるようにする


class ProductCreate(BaseModel):
    """商品作成スキーマ"""
    CODE: str
    NAME: str
    PRICE: int


class Transaction(BaseModel):
    """取引スキーマ"""
    TRD_ID: int
    DATETIME: datetime
    EMP_CD: Optional[str] = None
    STORE_CD: Optional[str] = None
    POS_NO: Optional[str] = None
    TOTAL_AMT: Optional[int] = None
    TTL_AMT_EX_TAX: Optional[int] = None

    class Config:
        from_attributes = True


class TransactionDetail(BaseModel):
    """取引明細スキーマ"""
    TRD_ID: int
    DTL_ID: int
    PRD_ID: int
    PRD_CODE: str
    PRD_NAME: str
    PRD_PRICE: int
    TAX_CD: Optional[str] = None

    class Config:
        from_attributes = True

