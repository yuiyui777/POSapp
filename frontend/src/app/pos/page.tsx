'use client'

import { useState, useMemo } from 'react'
import BarcodeScannerComponent from '@/components/BarcodeScannerComponent'
import ScannedProductDisplay from '@/components/ScannedProductDisplay'
import PurchaseList from '@/components/PurchaseList'

// 商品情報の型定義
interface Product {
  PRD_ID: number
  CODE: string
  NAME: string
  PRICE: number
}

export default function POSPage() {
  // --- 状態管理 (State) ---
  const [isScanning, setIsScanning] = useState(false) // スキャナがアクティブか
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null) // スキャンで取得した商品
  const [cart, setCart] = useState<Product[]>([]) // 購入リスト（カート）
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // --- ロジック ---

  // 合計金額を計算 (cartが変更されたときのみ再計算)
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.PRICE, 0)
  }, [cart])

  // 税込金額を計算（10%）
  const totalWithTax = useMemo(() => {
    return Math.floor(totalAmount * 1.1)
  }, [totalAmount])

  // バーコードスキャン時の処理
  const handleScan = async (code: string) => {
    if (code) {
      setIsScanning(false) // スキャンが成功したら一度カメラを止める
      setIsLoading(true)
      setError('')
      setScannedProduct(null)

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/products/code/${code}`)
        
        if (!response.ok) {
          throw new Error(
            response.status === 404 
              ? `商品が見つかりません (コード: ${code})` 
              : 'APIエラー'
          )
        }
        
        const data = await response.json()
        setScannedProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // 「購入リストに追加」ボタンの処理
  const handleAddToCart = (productToAdd: Product) => {
    if (productToAdd) {
      setCart(prevCart => [...prevCart, productToAdd])
      setScannedProduct(null) // 追加後は表示をクリア
    }
  }

  // 購入処理
  const handlePurchase = () => {
    if (cart.length === 0) return

    const message = `
購入を確定しますか？

商品点数: ${cart.length} 点
合計金額（税抜）: ¥${totalAmount.toLocaleString()}
合計金額（税込）: ¥${totalWithTax.toLocaleString()}
    `
    
    if (window.confirm(message)) {
      // ここで取引をDBに保存する処理を実装（後のステップ）
      alert(`購入完了！\n\n合計金額（税込）: ¥${totalWithTax.toLocaleString()}\n合計金額（税抜）: ¥${totalAmount.toLocaleString()}`)
      
      // カートをクリア
      setCart([])
      setScannedProduct(null)
    }
  }

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>モバイルPOSシステム</h1>
        <a href="/" style={styles.homeLink}>← ホームへ</a>
      </header>

      <main style={styles.main}>
        {/* ① バーコードスキャンボタン */}
        <button
          onClick={() => setIsScanning(true)}
          disabled={isScanning}
          style={{
            ...styles.scanButton,
            ...(isScanning ? styles.scanButtonDisabled : {})
          }}
        >
          {isScanning ? '📷 スキャン中...' : '① スキャン (カメラ)'}
        </button>

        {/* バーコードスキャナー */}
        <BarcodeScannerComponent onScan={handleScan} isScanning={isScanning} />

        {/* ②③④ スキャンした商品情報表示 & ⑤ 追加ボタン */}
        <ScannedProductDisplay
          product={scannedProduct}
          onAddToCart={handleAddToCart}
          error={error}
          isLoading={isLoading}
        />

        {/* ⑥ 購入リスト */}
        <PurchaseList 
          cart={cart} 
          totalAmount={totalAmount}
        />

        {/* ⑦ 購入ボタン */}
        <div style={styles.purchaseButtonContainer}>
          <button
            style={{
              ...styles.purchaseButton,
              ...(cart.length === 0 ? styles.purchaseButtonDisabled : {})
            }}
            onClick={handlePurchase}
            disabled={cart.length === 0}
          >
            ⑦ 購入
          </button>
        </div>
      </main>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '10px',
  },
  header: {
    maxWidth: '800px',
    margin: '0 auto 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  homeLink: {
    color: '#0070f3',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  scanButton: {
    width: '100%',
    padding: '18px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    marginBottom: '15px',
    transition: 'background-color 0.2s',
  },
  scanButtonDisabled: {
    backgroundColor: '#9e9e9e',
    cursor: 'not-allowed',
  },
  purchaseButtonContainer: {
    marginTop: '30px',
  },
  purchaseButton: {
    width: '100%',
    padding: '18px',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#e0e0e0',
    color: '#999',
    cursor: 'not-allowed',
  },
}

