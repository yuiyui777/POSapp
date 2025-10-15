'use client'

import { useState } from 'react'
import { useZxing } from 'react-zxing'

// 商品情報の型定義
interface Product {
  PRD_ID: number
  CODE: string
  NAME: string
  PRICE: number
}

export default function ScannerPage() {
  // スキャンしたバーコードデータを保持するState
  const [scannedCode, setScannedCode] = useState('')
  // APIから取得した商品情報を保持するState
  const [product, setProduct] = useState<Product | null>(null)
  // ローディング状態を管理するState
  const [isLoading, setIsLoading] = useState(false)
  // エラーメッセージを保持するState
  const [error, setError] = useState('')
  // スキャナーの有効/無効を管理
  const [isScannerActive, setIsScannerActive] = useState(true)

  // バーコードがスキャンされたときに呼ばれる関数
  const handleScan = async (result: string) => {
    if (result && result !== scannedCode) {
      console.log('Scanned code:', result)
      setScannedCode(result)
      setIsLoading(true)
      setError('')
      setProduct(null)
      setIsScannerActive(false) // 一時的にスキャナーを停止

      try {
        // バックエンドAPIを呼び出す
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/products/code/${result}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`商品が見つかりません (コード: ${result})`)
          }
          throw new Error(`APIリクエストに失敗しました (ステータス: ${response.status})`)
        }

        const data = await response.json()
        setProduct(data)

      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : '不明なエラー')
      } finally {
        setIsLoading(false)
        // 3秒後にスキャナーを再度有効化
        setTimeout(() => {
          setIsScannerActive(true)
        }, 3000)
      }
    }
  }

  // react-zxingのフック
  const { ref } = useZxing({
    onDecodeResult(result) {
      if (isScannerActive) {
        handleScan(result.getText())
      }
    },
    onError(error) {
      console.error('Scanner error:', error)
    }
  })

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>📷 バーコードスキャナー</h1>
        <p style={styles.subtitle}>商品バーコードをカメラにかざしてください</p>

        {/* バーコードスキャナー */}
        <div style={styles.scannerContainer}>
          <video ref={ref} style={styles.video} />
          <div style={styles.scannerOverlay}>
            {!isScannerActive && (
              <div style={styles.pausedMessage}>
                スキャン中...
              </div>
            )}
          </div>
        </div>

        {/* スキャン結果表示エリア */}
        <div style={styles.resultContainer}>
          <h2 style={styles.sectionTitle}>📊 スキャン結果</h2>
          
          {/* 最後にスキャンしたコード */}
          <div style={styles.infoCard}>
            <p style={styles.label}>最後にスキャンしたコード:</p>
            <p style={styles.value}>{scannedCode || '---'}</p>
          </div>

          {/* ローディング表示 */}
          {isLoading && (
            <div style={styles.loadingCard}>
              <p>🔍 商品情報を検索中...</p>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div style={styles.errorCard}>
              <h3 style={styles.errorTitle}>❌ エラー</h3>
              <p>{error}</p>
            </div>
          )}

          {/* 商品情報表示 */}
          {product && (
            <div style={styles.productCard}>
              <h3 style={styles.productTitle}>✅ 商品情報</h3>
              <div style={styles.productInfo}>
                <div style={styles.productRow}>
                  <span style={styles.productLabel}>商品名:</span>
                  <span style={styles.productValue}>{product.NAME}</span>
                </div>
                <div style={styles.productRow}>
                  <span style={styles.productLabel}>価格:</span>
                  <span style={styles.productPrice}>¥{product.PRICE.toLocaleString()}</span>
                </div>
                <div style={styles.productRow}>
                  <span style={styles.productLabel}>商品コード:</span>
                  <span style={styles.productValue}>{product.CODE}</span>
                </div>
                <div style={styles.productRow}>
                  <span style={styles.productLabel}>商品ID:</span>
                  <span style={styles.productValue}>{product.PRD_ID}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ナビゲーションボタン */}
        <div style={styles.navigation}>
          <a href="/" style={styles.backButton}>
            ← ホームに戻る
          </a>
        </div>
      </div>
    </main>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    minHeight: '100vh',
    backgroundColor: '#f8f8f8',
    padding: '20px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#000',
  },
  subtitle: {
    fontSize: '1.1rem',
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
    fontWeight: '500',
  },
  scannerContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto 30px',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '3px solid #000',
    boxShadow: '5px 5px 0px rgba(0,0,0,0.3)',
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  pausedMessage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#000',
    color: '#fff',
    padding: '16px 32px',
    borderRadius: '4px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    border: '2px solid #fff',
  },
  resultContainer: {
    marginTop: '30px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#000',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '15px',
    border: '2px solid #000',
    boxShadow: '3px 3px 0px rgba(0,0,0,0.5)',
  },
  label: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '600',
  },
  value: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#000',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#000',
    border: '2px solid #000',
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '15px',
    border: '3px solid #000',
  },
  errorTitle: {
    fontSize: '1.3rem',
    marginBottom: '10px',
    color: '#000',
    fontWeight: 'bold',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '15px',
    border: '3px solid #000',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.5)',
  },
  productTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px',
    color: '#000',
    fontWeight: 'bold',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  productRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
    border: '2px solid #e0e0e0',
  },
  productLabel: {
    fontSize: '1rem',
    color: '#666',
    fontWeight: '600',
  },
  productValue: {
    fontSize: '1.1rem',
    color: '#000',
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: '1.5rem',
    color: '#000',
    fontWeight: 'bold',
  },
  navigation: {
    marginTop: '30px',
    textAlign: 'center',
  },
  backButton: {
    display: 'inline-block',
    padding: '14px 32px',
    backgroundColor: '#000',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    border: '2px solid #000',
  },
}

