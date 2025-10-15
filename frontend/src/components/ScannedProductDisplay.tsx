'use client'

interface Product {
  PRD_ID: number
  CODE: string
  NAME: string
  PRICE: number
}

interface ScannedProductDisplayProps {
  product: Product | null
  onAddToCart: (product: Product) => void
  error: string
  isLoading: boolean
}

export default function ScannedProductDisplay({ 
  product, 
  onAddToCart, 
  error, 
  isLoading 
}: ScannedProductDisplayProps) {
  
  if (isLoading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>🔍 検索中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ ...styles.container, ...styles.errorContainer }}>
        <p style={styles.errorText}>❌ エラー: {error}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyField}>
          <p style={styles.label}>② コード表示エリア</p>
          <p style={styles.emptyValue}>---</p>
        </div>
        <div style={styles.emptyField}>
          <p style={styles.label}>③ 名称表示エリア</p>
          <p style={styles.emptyValue}>---</p>
        </div>
        <div style={styles.emptyField}>
          <p style={styles.label}>④ 単価表示エリア</p>
          <p style={styles.emptyValue}>---</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.field}>
        <p style={styles.label}>② コード表示エリア</p>
        <p style={styles.value}>{product.CODE}</p>
      </div>
      <div style={styles.field}>
        <p style={styles.label}>③ 名称表示エリア</p>
        <p style={styles.value}>{product.NAME}</p>
      </div>
      <div style={styles.field}>
        <p style={styles.label}>④ 単価表示エリア</p>
        <p style={styles.priceValue}>¥{product.PRICE.toLocaleString()}</p>
      </div>
      <button
        onClick={() => onAddToCart(product)}
        style={styles.addButton}
      >
        ⑤ 追加
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    border: '2px solid #000',
    padding: '20px',
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '4px',
    minHeight: '250px',
  },
  field: {
    marginBottom: '15px',
    padding: '14px',
    backgroundColor: '#fafafa',
    borderRadius: '4px',
    border: '2px solid #e0e0e0',
  },
  emptyField: {
    marginBottom: '15px',
    padding: '14px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    border: '2px dashed #ccc',
  },
  label: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '6px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '1.4rem',
    color: '#000',
    fontWeight: 'bold',
    margin: 0,
  },
  emptyValue: {
    fontSize: '1.4rem',
    color: '#ccc',
    fontWeight: 'bold',
    margin: 0,
  },
  priceValue: {
    fontSize: '1.6rem',
    color: '#000',
    fontWeight: 'bold',
    margin: 0,
  },
  addButton: {
    width: '100%',
    padding: '16px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#000',
    color: '#fff',
    border: '2px solid #000',
    borderRadius: '4px',
    marginTop: '12px',
    transition: 'all 0.2s',
    boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#000',
    padding: '50px 0',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderColor: '#000',
    border: '3px solid #000',
  },
  errorText: {
    textAlign: 'center',
    fontSize: '1rem',
    color: '#000',
    padding: '30px 0',
    fontWeight: '600',
  },
}
