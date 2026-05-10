---
name: INOS — 인문학의 OS
description: 인문학 모임 플랫폼. 지적이고 따뜻하며 여백이 있는 모바일 우선 UI.
colors:
  parchment: "#FAFAF8"
  surface: "#FFFFFF"
  indigo-deep: "#2D3561"
  indigo-mid: "#3D4880"
  amber: "#C4872A"
  amber-light: "#F5E6CC"
  text-primary: "#1A1A1A"
  text-secondary: "#6B6B6B"
  text-disabled: "#ADADAD"
  border: "#E8E7E3"
  dark-base: "#1A1A18"
  dark-surface: "#242420"
  dark-text: "#E8E6E0"
  error: "#C0392B"
  success: "#2E7D32"
typography:
  display:
    fontFamily: "'Noto Serif KR', Georgia, serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Noto Serif KR', Georgia, serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  title:
    fontFamily: "'Pretendard', -apple-system, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Pretendard', -apple-system, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "'Pretendard', -apple-system, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.005em"
  caption:
    fontFamily: "'Pretendard', -apple-system, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.01em"
rounded:
  none: "0px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
components:
  button-primary:
    backgroundColor: "{colors.indigo-deep}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.indigo-mid}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.indigo-deep}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-amber:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input-base:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: "8px 0px"
---

# Design System: INOS — 인문학의 OS

## 1. Overview

**Creative North Star: "작은 책방의 큐레이터"**

INOS는 판교 직장인이 인문학 모임을 운영하는 도구다. 인터페이스는 조용하고 넉넉하다. 좋은 책방이 책을 느끼게 두듯, 이 앱은 콘텐츠와 텍스트가 숨쉴 공간을 먼저 확보한다. AI가 발제문을 쓰고 콘텐츠를 추천하지만, "AI" 레이블은 어디에도 보이지 않는다. 결과물의 품질이 스스로를 증명한다.

색상은 크림빛 양피지(#FAFAF8)를 바탕으로 깊은 인디고(#2D3561)와 따뜻한 앰버(#C4872A)가 포인트를 잡는다. 인디고는 지성과 AI 기능에, 앰버는 선택과 투표 행위에 배분된다. 두 강조색이 같은 화면에 동시에 등장하는 일은 없다.

타이포그래피는 Noto Serif KR과 Pretendard의 대비를 통해 "읽는 경험"을 만든다. 발제문과 헤드라인은 세리프로, 버튼과 레이블과 데이터는 산세리프로 처리한다. 이 대비 자체가 지적 품격을 표현한다.

**Key Characteristics:**
- 8px 그리드 기반 넉넉한 여백
- 세리프(콘텐츠) + 산세리프(UI) 이중 타입 스케일
- 그림자 없음 — 경계는 1px 연한 선으로만 표현
- 강조색 두 가지(인디고, 앰버)의 맥락 분리 사용
- 모바일 웹뷰 우선, iOS safe-area 완전 대응
- AI는 레이블이 아닌 결과물로 존재

## 2. Colors: The Parchment Palette

따뜻한 오프화이트 바탕 위에 인디고와 앰버가 각자의 맥락에서만 등장하는 절제된 팔레트.

### Primary
- **Deep Indigo** (#2D3561 / oklch(30% 0.13 268)): AI 관련 기능, 발제문, 주요 CTA 버튼, 네비게이션 활성 상태. 지성과 집중을 상징한다.
- **Mid Indigo** (#3D4880 / oklch(37% 0.13 268)): 인디고의 호버 상태. Primary 버튼 hover에만 사용.

### Secondary
- **Warm Amber** (#C4872A / oklch(62% 0.13 68)): 투표, 선택, 콘텐츠 채택 관련 액션. 선택의 온기를 표현. 인디고와 같은 화면에 동시 등장 금지.
- **Amber Light** (#F5E6CC / oklch(93% 0.04 68)): 앰버 배경 틴트. 선택된 콘텐츠 카드 하이라이트.

### Neutral
- **Parchment** (#FAFAF8 / oklch(98% 0.002 80)): 앱 전체 배경. 순백이 아닌 따뜻한 크림빛.
- **Surface** (#FFFFFF): 카드 및 컨테이너 배경. 배경 대비 미세한 높이감.
- **Border** (#E8E7E3 / oklch(92% 0.005 80)): 카드 테두리, 구분선. 1px only.
- **Text Primary** (#1A1A1A / oklch(18% 0.003 80)): 본문, 헤딩.
- **Text Secondary** (#6B6B6B / oklch(47% 0.004 80)): 부제, 메타데이터, 안내 텍스트.
- **Text Disabled** (#ADADAD / oklch(70% 0.003 80)): 비활성 UI 요소.

### Dark Mode
- **Dark Base** (#1A1A18 / oklch(18% 0.003 75)): 완전한 검정이 아닌 따뜻한 다크.
- **Dark Surface** (#242420 / oklch(22% 0.004 75)): 다크 모드 카드 배경.
- **Dark Text** (#E8E6E0 / oklch(92% 0.006 80)): 다크 모드 본문 텍스트.

### Named Rules
**The Context Split Rule.** 인디고는 지식/AI 맥락에만, 앰버는 선택/투표 맥락에만 등장한다. 두 강조색이 같은 화면에 공존하면 맥락이 충돌한다. 설계 단계에서 막는다.

**The Off-White Rule.** 배경은 항상 #FAFAF8 (Parchment)이다. 순백(#FFFFFF)은 카드 표면에만 허용된다. "하얗다"는 느낌 자체를 배경에서 제거한다.

## 3. Typography: Noto Serif KR + Pretendard

**Display / Headline Font:** Noto Serif KR (Google Fonts, weight 400/600/700; fallback: Georgia, serif)
**UI / Body / Label Font:** Pretendard (CDN: jsdelivr; fallback: -apple-system, system-ui, sans-serif)

**Character:** 세리프는 읽히기 위해, 산세리프는 조작되기 위해 존재한다. 발제문을 읽는 순간과 버튼을 누르는 순간의 폰트가 다른 것은 의도적 경험 설계다.

### Hierarchy
- **Display** (Noto Serif KR 700, 32px, lh 1.25, ls -0.01em): 발제문 제목, 랜딩 헤드라인. 화면에 하나만 등장.
- **Headline** (Noto Serif KR 600, 24px, lh 1.3, ls -0.005em): 페이지 제목, 섹션 타이틀.
- **Title** (Pretendard 600, 18px, lh 1.4, ls -0.01em): 카드 제목, 그룹명, 콘텐츠명.
- **Body** (Pretendard 400, 16px, lh 1.65): 본문 텍스트, 발제문 내용. 최대 65ch.
- **Label** (Pretendard 500, 14px, lh 1.4, ls 0.005em): 버튼 텍스트, 네비게이션, 메타데이터.
- **Caption** (Pretendard 400, 12px, lh 1.5, ls 0.01em): 날짜, 배지, 보조 정보.

### Named Rules
**The Serif/Sans Split Rule.** 세리프(Noto Serif KR)는 콘텐츠 레이어(제목, 발제문, 책 제목 강조)에만. 산세리프(Pretendard)는 UI 레이어(버튼, 폼, 내비게이션, 데이터)에만. 경계를 흐리면 두 폰트를 모두 쓰는 의미가 없다.

## 4. Elevation

이 시스템은 그림자를 사용하지 않는다. 깊이는 배경색과 테두리의 대비로만 표현된다. Parchment 배경(#FAFAF8) 위의 흰 카드(#FFFFFF)가 1px Border(#E8E7E3) 테두리를 통해 부유하듯 보인다.

다크 모드에서는 Dark Base(#1A1A18) 위의 Dark Surface(#242420)가 동일한 방식으로 레이어를 나타낸다.

### Named Rules
**The Flat-By-Default Rule.** `box-shadow`는 사용 금지. 깊이는 배경색 차이와 1px 테두리로만 표현한다. "그림자 없는 카드가 너무 납작해 보인다"는 느낌이 들면, 여백을 더 늘린다. 그림자를 추가하지 않는다.

## 5. Components

### Buttons
깔끔하고 직접적. 라운드는 부드럽지만 pill 형태는 아니다.
- **Shape:** 10px 라운드 (rounded-md)
- **Primary (인디고):** 배경 #2D3561, 텍스트 #FAFAF8, padding 12px 20px, Pretendard 500 14px. hover: #3D4880, transform 없음.
- **Primary (앰버):** 배경 #C4872A, 텍스트 #FFF. 투표/선택 맥락에서만.
- **Ghost:** 배경 없음, 테두리 1px #2D3561, 텍스트 #2D3561.
- **Danger:** 배경 없음, 텍스트 #C0392B, 테두리 없음.
- **Disabled:** 배경 #E8E7E3, 텍스트 #ADADAD. 투명도 조정 금지.
- **Focus:** 2px offset outline, 인디고 컬러.

### Cards / Containers
- **Corner Style:** 16px 라운드 (rounded-lg)
- **Background:** #FFFFFF (라이트 모드), #242420 (다크 모드)
- **Shadow:** 없음. 절대 추가하지 않는다.
- **Border:** 1px solid #E8E7E3
- **Internal Padding:** 16px (모바일), 24px (≥768px)
- **Hover:** 배경이 미세하게 어두워짐 (#F5F4F0), transition 150ms. transform 없음.

### Inputs / Fields
- **Style:** 언더라인만. 배경 없음, 상하좌우 테두리 없음, 하단 1px solid #E8E7E3만.
- **Focus:** 하단 라인이 #2D3561으로 전환, transition 200ms.
- **Error:** 하단 라인 #C0392B, 라벨 #C0392B.
- **Disabled:** 하단 라인 #E8E7E3, 텍스트 #ADADAD.
- **Placeholder:** #ADADAD.

### Navigation
**Top Navbar:** 배경 #FFFFFF, 하단 1px #E8E7E3. "INOS" 로고는 Noto Serif KR 700. 우측 아바타.
**Bottom Navigation (모바일):** 배경 #FFFFFF, 상단 1px #E8E7E3, iOS safe-area padding 적용. 활성 탭: 인디고 아이콘 + 텍스트. 비활성: #ADADAD.

### Discussion (Signature Component)
발제문 스트리밍은 이 앱의 핵심 경험이다.
- 배경: 흰 카드, 내부 padding 24px 이상
- 타이포그래피: Noto Serif KR 본문 (body 크기), lh 1.9 (인쇄물 수준 행간)
- 토론 질문 번호: Noto Serif KR 700 32px, 인디고
- 스트리밍 커서: 1px wide, 인디고, 1s blink
- 완료 후: 인쇄 버튼, 공유 버튼 등장

### Vote Button
- 투표 전: 5개 원형 ghost 버튼, 앰버 테두리
- 투표 후: 선택한 점수까지 앰버 채움
- 탭 시: 200ms ease-out scale 1.15 → 1.0 스프링 효과

## 6. Do's and Don'ts

### Do:
- **Do** 배경은 항상 #FAFAF8 (Parchment). 순백 배경은 카드에만.
- **Do** 카드 테두리는 1px solid #E8E7E3만. 그림자는 절대 추가 금지.
- **Do** 발제문과 페이지 헤드라인은 Noto Serif KR. UI 레이블, 버튼, 데이터는 Pretendard.
- **Do** 인디고는 AI/지식 맥락에만, 앰버는 투표/선택 맥락에만.
- **Do** 터치 타겟 최소 44×44px. 텍스트 최소 14px.
- **Do** 여백을 먼저 잡고 콘텐츠를 넣는다. 빽빽하면 여백을 두 배로 늘린다.
- **Do** 발제문 본문 lh 1.9, 최대 65ch. 읽기에 최적화된 설정을 지킨다.

### Don't:
- **Don't** 보라색 또는 그라디언트 사용. 특히 파란색-보라색 그라디언트는 AI 서비스 클리셰.
- **Don't** `box-shadow`, `drop-shadow`, glow 효과. Flat-By-Default Rule.
- **Don't** 카드 안에 카드 중첩. 컨테이너 중첩은 항상 구조 재설계로 해결.
- **Don't** Inter 폰트. 이 프로젝트에 Inter는 없다.
- **Don't** 회색 텍스트 + 파란 버튼 + 흰 배경 조합. SaaS 기본값 클리셰.
- **Don't** UI에 "AI", "GPT", "인공지능" 레이블 부착. 기능의 결과물이 스스로 말한다.
- **Don't** 다크 모드에 네온 컬러. 다크 모드도 같은 팔레트를 어둡게 조정한 것.
- **Don't** 네온 컬러, Web3/크립토 느낌의 accent.
- **Don't** Notion 스타일의 과도한 블록 중첩.
- **Don't** `background-clip: text` gradient text. 텍스트는 단색만.
