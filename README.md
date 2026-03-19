# 사장AI — 창업 사업계획서 자동 생성 서비스

AI 기반 예비창업패키지 사업계획서 자동 생성 → Word(.docx) 다운로드

## 기술 스택

- **Next.js 14** (App Router)
- **Claude API** (Anthropic) — 사업계획서 내용 생성
- **docx** — 서버에서 Word 파일 생성
- **Tailwind CSS** — UI 스타일링
- **Vercel** — 배포

---

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 ANTHROPIC_API_KEY 입력

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## Vercel 배포 (5분 완성)

### 방법 1 — GitHub 연동 (권장)

1. 이 프로젝트를 GitHub에 Push
   ```bash
   git init
   git add .
   git commit -m "init: 사장AI 초기 셋업"
   git remote add origin https://github.com/YOUR_ID/sajangai.git
   git push -u origin main
   ```

2. [vercel.com](https://vercel.com) 접속 → **Add New Project** → GitHub 저장소 선택

3. **Environment Variables** 항목에 추가:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (Anthropic Console에서 발급)

4. **Deploy** 클릭 → 완료! (약 1~2분)

### 방법 2 — Vercel CLI

```bash
npm i -g vercel
vercel
# 안내에 따라 설정 후 자동 배포
```

---

## 환경변수

| 변수명 | 설명 | 발급처 |
|--------|------|--------|
| `ANTHROPIC_API_KEY` | Claude API 키 | [console.anthropic.com](https://console.anthropic.com/) |

---

## 프로젝트 구조

```
sajangai/
├── app/
│   ├── api/generate/route.ts   # Claude API 호출 + docx 생성 엔드포인트
│   ├── page.tsx                # 메인 UI
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   └── docxBuilder.ts          # Word 파일 빌더
├── .env.example
└── README.md
```

---

## 주의사항

- Claude API 사용 비용이 발생합니다 (요청 1건당 약 $0.05~0.15)
- 생성된 사업계획서는 AI 초안입니다. 실제 제출 전 반드시 검토·보완하세요.
- Vercel 무료 플랜의 함수 실행 시간 제한은 60초입니다.
