'use client'

import { useZxing } from 'react-zxing'

interface BarcodeScannerComponentProps {
  onScan: (code: string) => void
  isScanning: boolean
}

export default function BarcodeScannerComponent({ onScan, isScanning }: BarcodeScannerComponentProps) {
  const { ref } = useZxing({
    onDecodeResult(result) {
      if (isScanning) {
        onScan(result.getText())
      }
    },
    onError(error) {
      console.error('Scanner error:', error)
    }
  })

  return (
    <div style={styles.container}>
      {isScanning ? (
        <div style={styles.videoContainer}>
          <video ref={ref} style={styles.video} />
        </div>
      ) : (
        <div style={styles.placeholder}>
          <p style={styles.placeholderText}>スキャン待機中...</p>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    width: '100%',
    border: '2px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  videoContainer: {
    width: '100%',
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  placeholder: {
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    fontSize: '1.2rem',
    color: '#666',
  },
}

