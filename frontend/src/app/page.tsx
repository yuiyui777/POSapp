'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [apiStatus, setApiStatus] = useState<string>('確認中...')
  const [apiMessage, setApiMessage] = useState<string>('')

  useEffect(() => {
    // APIヘルスチェック
    const checkApi = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/health`)
        if (response.ok) {
          const data = await response.json()
          setApiStatus('✅ 接続成功')
          setApiMessage(JSON.stringify(data, null, 2))
        } else {
          setApiStatus('❌ 接続エラー')
          setApiMessage(`ステータスコード: ${response.status}`)
        }
      } catch (error) {
        setApiStatus('❌ 接続失敗')
        setApiMessage(error instanceof Error ? error.message : '不明なエラー')
      }
    }

    checkApi()
  }, [])

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>POSシステム</h1>
        <p style={styles.subtitle}>Tech0向けPOSアプリケーション</p>
        
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🚀 開発環境セットアップ完了</h2>
          <p style={styles.text}>
            フロントエンドとバックエンドの基本構成が完了しました。
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔌 API接続状態</h2>
          <p style={styles.statusText}>{apiStatus}</p>
          {apiMessage && (
            <pre style={styles.pre}>{apiMessage}</pre>
          )}
        </div>

        <div style={styles.links}>
          <a 
            href="/scanner"
            style={styles.link}
          >
            📷 バーコードスキャナー
          </a>
          <a 
            href="http://localhost:8000/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            style={styles.link}
          >
            📚 API ドキュメント
          </a>
          <a 
            href="https://github.com/yuiyui777/POSapp" 
            target="_blank" 
            rel="noopener noreferrer"
            style={styles.link}
          >
            💻 GitHub リポジトリ
          </a>
        </div>
      </div>
    </main>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  container: {
    maxWidth: '800px',
    width: '100%',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '1.2rem',
    textAlign: 'center',
    color: '#666',
    marginBottom: '40px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#333',
  },
  text: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.6',
  },
  statusText: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '12px',
  },
  pre: {
    backgroundColor: '#f4f4f4',
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '0.9rem',
  },
  links: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '30px',
  },
  link: {
    padding: '12px 24px',
    backgroundColor: '#0070f3',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
}

