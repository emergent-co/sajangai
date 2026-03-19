'use client'

import { useState } from 'react'

const PROGRAMS = ['예비창업패키지', '초기창업패키지', '창업도약패키지', 'TIPS', '일반 정부지원사업']
const INDUSTRIES = ['기술/IT·AI', '헬스케어·바이오', '교육·에듀테크', '커머스·유통', '금융·핀테크', '제조·하드웨어', '기타']

const STAGES = [
  '아이디어 분석 중...',
  '시장 현황 조사 중...',
  '비즈니스 모델 구성 중...',
  '성장 전략 수립 중...',
  'Word 파일 생성 중...',
]

export default function Home() {
  const [ideaCore, setIdeaCore] = useState('')
  const [ideaProblem, setIdeaProblem] = useState('')
  const [ideaTeam, setIdeaTeam] = useState('')
  const [program, setProgram] = useState('예비창업패키지')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [stageIdx, setStageIdx] = useState(0)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ideaCore.trim()) { setError('창업 아이디어를 입력해주세요.'); return }
    setError('')
    setLoading(true)
    setStageIdx(0)

    const interval = setInterval(() => {
      setStageIdx(i => (i < STAGES.length - 1 ? i + 1 : i))
    }, 3500)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaCore, ideaProblem, ideaTeam, program, industry }),
      })

      clearInterval(interval)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '서버 오류가 발생했습니다.')
      }

      const blob = await res.blob()
      const cd = res.headers.get('Content-Disposition') ?? ''
      const match = cd.match(/filename\*=UTF-8''(.+)/)
      const filename = match ? decodeURIComponent(match[1]) : '사업계획서.docx'

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      clearInterval(interval)
      setLoading(false)
      setStageIdx(0)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            예비창업패키지 공식 양식 기준
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">사장AI</h1>
          <p className="text-slate-500 text-base">
            아이디어 입력 → AI 작성 → Word 파일 즉시 다운로드
          </p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 입력 3개 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  1. 창업 아이디어 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={ideaCore}
                  onChange={e => setIdeaCore(e.target.value)}
                  rows={3}
                  placeholder="어떤 제품 또는 서비스인가요? 핵심을 자유롭게 설명해주세요.&#10;예: 소규모 사업자를 위한 AI 통합 업무 비서 — 견적서, 세금계산서, 블로그, 고객 응대 등을 자동화"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    2. 문제 인식 및 시장 현황
                  </label>
                  <textarea
                    value={ideaProblem}
                    onChange={e => setIdeaProblem(e.target.value)}
                    rows={4}
                    placeholder="고객이 겪는 문제, 국내외 시장 현황을 적어주세요."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    3. 팀 구성 및 대표자 역량
                  </label>
                  <textarea
                    value={ideaTeam}
                    onChange={e => setIdeaTeam(e.target.value)}
                    rows={4}
                    placeholder="대표자와 팀원의 역할·경력을 간략히 알려주세요."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 지원사업 유형 */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">지원 사업 유형</label>
              <div className="flex flex-wrap gap-2">
                {PROGRAMS.map(p => (
                  <button key={p} type="button" onClick={() => setProgram(p)}
                    className={`px-3.5 py-1.5 rounded-full text-sm border transition-all ${
                      program === p
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 산업 분야 */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">산업 분야</label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => (
                  <button key={ind} type="button" onClick={() => setIndustry(industry === ind ? '' : ind)}
                    className={`px-3.5 py-1.5 rounded-full text-sm border transition-all ${
                      industry === ind
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* 에러 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 로딩 상태 */}
            {loading && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-700">{STAGES[stageIdx]}</span>
                </div>
                <div className="flex gap-1">
                  {STAGES.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i <= stageIdx ? 'bg-blue-400' : 'bg-blue-100'
                    }`} />
                  ))}
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-colors text-sm">
              {loading ? 'AI가 작성 중입니다...' : '사업계획서 생성 및 다운로드 →'}
            </button>

          </form>
        </div>

        {/* 안내 */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            ['📋', '정부 공식 양식', '예비창업패키지 등\n공통 양식 기준'],
            ['🤖', 'AI 자동 작성', 'Claude AI가\n15장 내외로 작성'],
            ['📥', 'Word 즉시 다운로드', '편집 가능한\n.docx 파일 제공'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-xs font-medium text-slate-700 mb-1">{title}</div>
              <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{desc}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          AI가 초안을 작성합니다. 실제 제출 전 내용을 검토·보완하세요.
        </p>
      </div>
    </main>
  )
}
