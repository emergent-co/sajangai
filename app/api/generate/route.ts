import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildDocx, AiContent } from '@/lib/docxBuilder'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ideaCore, ideaProblem, ideaTeam, program, industry } = body

    if (!ideaCore?.trim()) {
      return NextResponse.json({ error: '창업 아이디어를 입력해주세요.' }, { status: 400 })
    }

    const prompt = `당신은 중소벤처기업부 창업지원사업 전문 컨설턴트입니다.
아래 정보를 바탕으로 "${program}" 지원을 위한 사업계획서를 작성하세요.

[입력 정보]
창업 아이디어: ${ideaCore}
${ideaProblem ? `문제 인식/시장 현황: ${ideaProblem}` : ''}
${ideaTeam ? `팀 구성: ${ideaTeam}` : ''}
산업 분야: ${industry || '일반'}

[작성 기준]
- 심사위원이 읽는 수준의 논리적·구체적 서술
- 시장 규모(TAM/SAM/SOM), 수치, 예시 최대한 포함
- 격식체(~입니다, ~합니다) 사용
- 각 섹션 충분한 분량 (전체 15장 내외)
- content 내 줄바꿈은 \\n 사용, 불릿은 줄 앞에 • 사용

다음 JSON 형식으로만 응답하세요. JSON 외 텍스트 없이:

{
  "item_name": "창업 아이템명",
  "tagline": "한 줄 핵심 가치 제안",
  "general": {
    "item_name": "창업 아이템명 (산출물 포함)",
    "output": "주요 산출물",
    "team_summary": "팀 구성 요약",
    "support_amount": "신청 지원금 규모",
    "business_overview": "사업 개요 2~3문장"
  },
  "summary": {
    "item_intro": "창업 아이템 소개 3~4문장",
    "problem": "문제 인식 요약 2~3문장",
    "feasibility": "실현 가능성 요약 2~3문장",
    "growth": "성장 전략 요약 2~3문장",
    "team": "팀 구성 요약 2~3문장"
  },
  "chapters": [
    {
      "id": "problem",
      "title": "1. 창업 아이템의 필요성",
      "sections": [
        {
          "title": "가. 국내·외 시장 현황 및 문제점",
          "content": "700자 이상 상세 서술. 구체적 수치 포함."
        },
        {
          "title": "나. 개발 필요성",
          "content": "500자 이상 서술."
        }
      ]
    },
    {
      "id": "solution",
      "title": "2. 창업 아이템의 개발 계획",
      "sections": [
        {
          "title": "가. 아이디어 구체화 및 단계별 개발 계획",
          "content": "단계별 계획 700자 이상."
        },
        {
          "title": "나. 차별성 및 경쟁력 확보 전략",
          "content": "500자 이상."
        },
        {
          "title": "다. 정부지원사업비 집행 계획",
          "content": "항목별 금액·비율 포함 500자 이상."
        }
      ]
    },
    {
      "id": "scale",
      "title": "3. 사업화 추진 전략",
      "sections": [
        {
          "title": "가. 경쟁사 분석 및 목표 시장 진입 전략",
          "content": "경쟁사 3곳 이상 비교, TAM/SAM/SOM 포함 700자 이상."
        },
        {
          "title": "나. 비즈니스 모델(수익화 모델)",
          "content": "구독 플랜·가격 등 수익 모델 상세 서술 500자 이상."
        },
        {
          "title": "다. 투자유치 전략 및 사업 로드맵",
          "content": "연도별 목표·투자유치 계획·사회적 가치 700자 이상."
        }
      ]
    },
    {
      "id": "team",
      "title": "4. 대표자 및 팀원 구성 계획",
      "sections": [
        {
          "title": "가. 대표자 보유 역량",
          "content": "대표자 경력·기술·수상 이력 500자 이상."
        },
        {
          "title": "나. 팀원 역량 및 업무파트너 현황",
          "content": "팀원 역할·역량, 외부 파트너 현황 및 활용 방안 500자 이상."
        }
      ]
    }
  ]
}`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content.map(b => ('text' in b ? b.text : '')).join('')
    const clean = raw.replace(/```json|```/g, '').trim()
    const aiContent: AiContent = JSON.parse(clean)

    const docBuffer = await buildDocx({ ideaCore, ideaProblem, ideaTeam, program, industry, aiContent })

    const filename = encodeURIComponent(`${aiContent.item_name}_${program}_사업계획서.docx`)

    return new NextResponse(docBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
