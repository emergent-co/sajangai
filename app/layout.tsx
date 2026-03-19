import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '사장AI — 창업 사업계획서 자동 생성',
  description: '소규모 사업자를 위한 AI 기반 예비창업패키지 사업계획서 자동 생성 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
