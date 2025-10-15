'use client'

interface Product {
  PRD_ID: number
  CODE: string
  NAME: string
  PRICE: number
}

interface CartItem extends Product {
  quantity: number
  subtotal: number
}

interface PurchaseListProps {
  cart: Product[]
  totalAmount: number
  onRemoveItem?: (index: number) => void
}

export default function PurchaseList({ cart, totalAmount, onRemoveItem }: PurchaseListProps) {
  // 商品をグループ化して数量をカウント
  const groupedCart: CartItem[] = cart.reduce((acc: CartItem[], product: Product) => {
    const existingItem = acc.find(item => item.PRD_ID === product.PRD_ID)
    if (existingItem) {
      existingItem.quantity += 1
      existingItem.subtotal += product.PRICE
    } else {
      acc.push({
        ...product,
        quantity: 1,
        subtotal: product.PRICE
      })
    }
    return acc
  }, [])

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⑥ 購入品目リスト</h2>
      <div style={styles.listContainer}>
        {cart.length === 0 ? (
          <p style={styles.emptyMessage}>商品がありません</p>
        ) : (
          <div>
            <div style={styles.listHeader}>
              <span style={styles.headerCell}>名称</span>
              <span style={styles.headerCellSmall}>数量</span>
              <span style={styles.headerCellSmall}>単価</span>
              <span style={styles.headerCellSmall}>単品合計</span>
            </div>
            {groupedCart.map((item, index) => (
              <div key={`${item.PRD_ID}-${index}`} style={styles.listItem}>
                <span style={styles.itemName}>{item.NAME}</span>
                <span style={styles.itemQuantity}>x{item.quantity}</span>
                <span style={styles.itemPrice}>¥{item.PRICE.toLocaleString()}</span>
                <span style={styles.itemSubtotal}>¥{item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={styles.totalContainer}>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>商品点数:</span>
          <span style={styles.totalValue}>{cart.length} 点</span>
        </div>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>合計金額:</span>
          <span style={styles.totalAmount}>¥{totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginTop: '30px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#000',
  },
  listContainer: {
    border: '2px solid #000',
    borderRadius: '4px',
    padding: '15px',
    minHeight: '200px',
    maxHeight: '400px',
    overflowY: 'auto',
    backgroundColor: '#fff',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 0',
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: '4px',
    marginBottom: '12px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  headerCell: {
    textAlign: 'left',
  },
  headerCellSmall: {
    textAlign: 'right',
  },
  listItem: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '10px',
    padding: '12px',
    borderBottom: '2px solid #eee',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  },
  itemName: {
    fontSize: '1rem',
    color: '#000',
    textAlign: 'left',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: '1rem',
    color: '#000',
    textAlign: 'right',
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: '1rem',
    color: '#666',
    textAlign: 'right',
  },
  itemSubtotal: {
    fontSize: '1.05rem',
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  totalContainer: {
    marginTop: '15px',
    padding: '18px',
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: '4px',
    border: '2px solid #000',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '1.1rem',
  },
  totalLabel: {
    color: '#fff',
    fontWeight: '500',
  },
  totalValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalAmount: {
    color: '#fff',
    fontSize: '1.6rem',
    fontWeight: 'bold',
  },
}

