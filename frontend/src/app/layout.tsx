import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'POSシステム',
  description: 'Tech0向けPOSアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}

