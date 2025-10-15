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

export default function Home() {
  // --- 状態管理 (State) ---
  const [isScanning, setIsScanning] = useState(true) // スキャナがアクティブか（初期状態で有効）
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
      setIsScanning(true) // スキャナーを再開
    }
  }

  // 購入処理
  const handlePurchase = async () => {
    if (cart.length === 0) return

    const message = `
購入を確定しますか？

商品点数: ${cart.length} 点
合計金額（税抜）: ¥${totalAmount.toLocaleString()}
合計金額（税込）: ¥${totalWithTax.toLocaleString()}
    `
    
    if (!window.confirm(message)) {
      return // キャンセルされた場合は何もしない
    }

    // APIに購入データを送信
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(product => ({
            PRD_ID: product.PRD_ID,
            CODE: product.CODE,
            NAME: product.NAME,
            PRICE: product.PRICE
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`購入処理に失敗しました (ステータス: ${response.status})`)
      }

      const data = await response.json()
      
      // 購入完了のアラート
      alert(
        `購入完了！\n\n` +
        `取引ID: ${data.transaction_id}\n` +
        `商品点数: ${data.items_count} 点\n` +
        `合計金額（税込）: ¥${totalWithTax.toLocaleString()}\n` +
        `合計金額（税抜）: ¥${data.total_amount.toLocaleString()}`
      )
      
      // カートをクリア
      setCart([])
      setScannedProduct(null)
      
    } catch (err) {
      console.error('Purchase error:', err)
      alert(`エラー: ${err instanceof Error ? err.message : '購入処理に失敗しました'}`)
    }
  }

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>モバイルPOSシステム</h1>
      </header>

      <main style={styles.main}>
        {/* ① バーコードスキャン状態表示 */}
        <div style={styles.scanStatus}>
          {isScanning ? (
            <div style={styles.scanningStatus}>
              <span style={styles.scanningIcon}>📷</span>
              <span>スキャン準備完了 - バーコードをかざしてください</span>
            </div>
          ) : (
            <div style={styles.pausedStatus}>
              <span>⏸️ スキャン一時停止中</span>
            </div>
          )}
        </div>

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
    backgroundColor: '#f8f8f8',
    padding: '10px',
  },
  header: {
    maxWidth: '800px',
    margin: '0 auto 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '2px solid #000',
    boxShadow: '4px 4px 0px rgba(0,0,0,1)',
  },
  headerTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#000',
    margin: 0,
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '2px solid #000',
    boxShadow: '6px 6px 0px rgba(0,0,0,1)',
  },
  scanStatus: {
    width: '100%',
    padding: '16px',
    marginBottom: '20px',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    border: '2px solid #000',
  },
  scanningStatus: {
    backgroundColor: '#fff',
    color: '#000',
    padding: '12px',
    borderRadius: '4px',
  },
  scanningIcon: {
    marginRight: '10px',
    fontSize: '1.3rem',
  },
  pausedStatus: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '12px',
    borderRadius: '4px',
  },
  purchaseButtonContainer: {
    marginTop: '30px',
  },
  purchaseButton: {
    width: '100%',
    padding: '20px',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#000',
    color: '#fff',
    border: '3px solid #000',
    borderRadius: '4px',
    transition: 'all 0.2s',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
    cursor: 'not-allowed',
    border: '2px solid #ddd',
    boxShadow: 'none',
  },
}
