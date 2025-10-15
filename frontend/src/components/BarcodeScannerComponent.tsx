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
      <div style={styles.videoContainer}>
        <video ref={ref} style={styles.video} />
        {!isScanning && (
          <div style={styles.overlay}>
            <p style={styles.overlayText}>スキャン待機中...</p>
          </div>
        )}
      </div>
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
    position: 'relative',
    width: '100%',
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
  },
  overlayText: {
    fontSize: '1.2rem',
    color: 'white',
    fontWeight: 'bold',
  },
}

