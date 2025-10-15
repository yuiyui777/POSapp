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
    border: '2px solid #ddd',
    padding: '20px',
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    minHeight: '250px',
  },
  field: {
    marginBottom: '15px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  emptyField: {
    marginBottom: '15px',
    padding: '12px',
    backgroundColor: '#fafafa',
    borderRadius: '6px',
    border: '1px dashed #ccc',
  },
  label: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '5px',
    fontWeight: '500',
  },
  value: {
    fontSize: '1.3rem',
    color: '#333',
    fontWeight: 'bold',
    margin: 0,
  },
  emptyValue: {
    fontSize: '1.3rem',
    color: '#ccc',
    fontWeight: 'bold',
    margin: 0,
  },
  priceValue: {
    fontSize: '1.5rem',
    color: '#2e7d32',
    fontWeight: 'bold',
    margin: 0,
  },
  addButton: {
    width: '100%',
    padding: '15px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#1976d2',
    padding: '50px 0',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  errorText: {
    textAlign: 'center',
    fontSize: '1rem',
    color: '#d32f2f',
    padding: '30px 0',
  },
}
