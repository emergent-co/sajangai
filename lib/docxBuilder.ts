import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  PageBreak, LevelFormat,
} from 'docx'

const PAGE_W = 11906
const MARGIN = 1000
const CONTENT_W = PAGE_W - MARGIN * 2

const solidBorder = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const thinBorder  = { style: BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }
const allBorders  = { top: solidBorder, bottom: solidBorder, left: solidBorder, right: solidBorder }
const thinAll     = { top: thinBorder,  bottom: thinBorder,  left: thinBorder,  right: thinBorder  }

function run(text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) {
  return new TextRun({ text, font: '맑은 고딕', size: opts.size ?? 20, bold: opts.bold ?? false, color: opts.color ?? '000000' })
}

function para(children: TextRun[], opts: { align?: typeof AlignmentType[keyof typeof AlignmentType]; before?: number; after?: number; line?: number } = {}) {
  return new Paragraph({
    children,
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: { before: opts.before ?? 60, after: opts.after ?? 60, line: opts.line ?? 280 },
  })
}

function bodyPara(text: string) {
  return para([run(text)], { before: 60, after: 60, line: 300 })
}

function sectionHeader(text: string) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 22, color: 'FFFFFF' })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 100 },
    shading: { fill: '2E4057', type: ShadingType.CLEAR },
    indent: { left: 120 },
  })
}

function subHeader(text: string) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 21, color: '1F3864' })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '2E4057' } },
  })
}

function boldLabel(text: string) {
  return new Paragraph({
    children: [run(text, { bold: true, size: 20 })],
    spacing: { before: 120, after: 60 },
  })
}

function bulletPara(text: string) {
  return new Paragraph({
    children: [run(text)],
    numbering: { reference: 'bullets', level: 0 },
    spacing: { before: 40, after: 40, line: 280 },
  })
}

function cell(
  content: string | Paragraph[],
  opts: {
    width?: number
    bold?: boolean
    fill?: string
    align?: typeof AlignmentType[keyof typeof AlignmentType]
    colSpan?: number
    size?: number
    useThinBorder?: boolean
  } = {}
) {
  const children: Paragraph[] = Array.isArray(content)
    ? content
    : [new Paragraph({
        children: [run(content, { bold: opts.bold ?? false, size: opts.size ?? 18 })],
        alignment: opts.align ?? AlignmentType.LEFT,
        spacing: { before: 40, after: 40, line: 260 },
      })]

  const borders = opts.useThinBorder === false ? allBorders : thinAll

  return new TableCell({
    children,
    borders: borders as any,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: opts.colSpan,
  })
}

function hcell(text: string, width: number) {
  return new TableCell({
    children: [new Paragraph({
      children: [run(text, { bold: true, size: 18 })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 40, after: 40, line: 260 },
    })],
    borders: allBorders as any,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: 'D6E4F0', type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
  })
}

function table(rows: TableCell[][], colWidths: number[]) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map(r => new TableRow({ children: r })),
    borders: allBorders as any,
  })
}

export interface BpInput {
  ideaCore: string
  ideaProblem: string
  ideaTeam: string
  program: string
  industry: string
  aiContent: AiContent
}

export interface AiContent {
  item_name: string
  tagline: string
  general: { item_name: string; output: string; team_summary: string; support_amount: string; business_overview: string }
  summary: { item_intro: string; problem: string; feasibility: string; growth: string; team: string }
  chapters: Array<{ id: string; title: string; sections: Array<{ title: string; content: string }> }>
}

export async function buildDocx(input: BpInput): Promise<Buffer> {
  const { aiContent: c, program } = input

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { run: { font: '맑은 고딕', size: 20 }, paragraph: { indent: { left: 440, hanging: 220 } } },
        }],
      }],
    },
    styles: {
      default: { document: { run: { font: '맑은 고딕', size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W, height: 16838 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      children: [
        // 표지
        para([run('', {})], { before: 400 }),
        para([run(`${program} 사업계획서`, { bold: true, size: 36, color: '1F3864' })], { align: AlignmentType.CENTER, before: 200 }),
        para([run(c.item_name, { bold: true, size: 28 })], { align: AlignmentType.CENTER, before: 160 }),
        para([run(`"${c.tagline}"`, { size: 22, color: '444444' })], { align: AlignmentType.CENTER, before: 80, after: 600 }),

        // 일반현황
        sectionHeader('□  일반현황'),
        para([]),
        table([
          [hcell('창업아이템명', 2200), cell(c.general.item_name,        { width: 7706 })],
          [hcell('산출물',       2200), cell(c.general.output,           { width: 7706 })],
          [hcell('팀 구성 현황', 2200), cell(c.general.team_summary,     { width: 7706 })],
          [hcell('신청 지원금',  2200), cell(c.general.support_amount,   { width: 7706 })],
          [hcell('사업 개요',    2200), cell(c.general.business_overview, { width: 7706 })],
        ], [2200, 7706]),

        para([]),
        new Paragraph({ children: [new PageBreak()] }),

        // 개요(요약)
        sectionHeader('□  창업 아이템 개요(요약)'),
        para([]),
        table([
          [hcell('아이템 소개',  2400), cell(c.summary.item_intro,  { width: 7506 })],
          [hcell('문제 인식',    2400), cell(c.summary.problem,     { width: 7506 })],
          [hcell('실현 가능성',  2400), cell(c.summary.feasibility, { width: 7506 })],
          [hcell('성장 전략',    2400), cell(c.summary.growth,      { width: 7506 })],
          [hcell('팀 구성',      2400), cell(c.summary.team,        { width: 7506 })],
        ], [2400, 7506]),

        para([]),
        new Paragraph({ children: [new PageBreak()] }),

        // 4개 챕터
        ...c.chapters.flatMap((ch, ci) => {
          const labelMap: Record<string, string> = {
            problem:  '1. 문제 인식  (Problem)',
            solution: '2. 실현 가능성  (Solution)',
            scale:    '3. 성장 전략  (Scale-up)',
            team:     '4. 팀 구성  (Team)',
          }
          const label = labelMap[ch.id] ?? ch.title
          const items: (Paragraph | Table)[] = [
            sectionHeader(label),
            para([]),
            subHeader(ch.title.replace(/^\d+\.\s*/, '')),
            para([]),
          ]
          ch.sections.forEach(sec => {
            items.push(boldLabel(sec.title))
            sec.content.split('\n').filter((l: string) => l.trim()).forEach((line: string) => {
              if (line.startsWith('•') || line.startsWith('-')) {
                items.push(bulletPara(line.replace(/^[•\-]\s*/, '')))
              } else {
                items.push(bodyPara(line))
              }
            })
            items.push(para([]))
          })
          if (ci < c.chapters.length - 1) {
            items.push(new Paragraph({ children: [new PageBreak()] }))
          }
          return items
        }),

        para([]),
        new Paragraph({
          children: [run('※ 본 사업계획서는 AI가 초안 작성한 문서입니다. 실제 제출 전 대표자 성명·학력 등 개인정보 항목을 보완하고, 주관기관 요구 양식에 맞게 최종 편집하시기 바랍니다.', 16)],
          spacing: { before: 300, after: 60 },
        }),
      ],
    }],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
