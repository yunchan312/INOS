---
name: INOS — 인문학의 OS
description: 인문학 모임 플랫폼. 무채색 100%, 색은 작품에만. 읽기를 방해하지 않는 UI.
version: 2안 "모던 미니멀 · 흑백"
source: apps/web/src/index.css (이 문서는 코드에서 역추출해 정리한 것이다)
colors:
  # UI는 전부 무채색이다. 아래에 채도를 가진 값은 하나도 없다.
  point: "#0a0a0a"
  point-hover: "#232323"
  ink: "#141414"
  paper: "#fafafa"
  surface: "#ffffff"
  surface-2: "#f2f2f2"
  muted: "#6e6e6e"
  muted-2: "#4a4a4a"
  line: "#e4e4e4"
  danger: "#141414"
  danger-2: "#0a0a0a"
  on-accent: "#ffffff"
  on-art: "#141414"
  shelf: "#141414"
  shelf-shadow: "#e4e4e4"
colorsDark:
  point: "#fafafa"
  point-hover: "#e4e4e4"
  ink: "#f2f2f2"
  paper: "#0f0f0f"
  surface: "#171717"
  surface-2: "#1f1f1f"
  muted: "#8f8f8f"
  muted-2: "#b5b5b5"
  line: "#2e2e2e"
  danger: "#f2f2f2"
  danger-2: "#ffffff"
  on-accent: "#0a0a0a"
  on-art: "#141414"   # 의도적으로 반전하지 않는다 — 아래 §2.4
  shelf: "#f2f2f2"
  shelf-shadow: "#2e2e2e"
typography:
  fontFamily: "'Archivo', 'Pretendard Variable', Pretendard, sans-serif"
  weights: [400, 500, 600, 700, 800]
  bodyWeight: 400
  letterSpacing: "-0.005em"
rounded:
  hair: "6px"
  ui: "10px"
  card: "14px"
  full: "9999px"   # 아바타·토글에만
shadow:
  default: "none"
  popover: "0 1px 2px rgb(0 0 0 / 0.05), 0 8px 20px -6px rgb(0 0 0 / 0.14), 0 20px 44px -12px rgb(0 0 0 / 0.12)"
---

# Design System: INOS — 2안 "모던 미니멀 · 흑백"

> 이 문서는 `apps/web/src/index.css`의 실제 토큰에서 역추출했다.
> 1안(양피지 · 인디고 · 앰버)은 `157d123` 이전 커밋에 남아 있다 — `git show 157d123^:DESIGN.md`.

## 1. 왜 흑백인가

INOS에서 화면의 주인공은 **글**이다. 발제 질문, 멤버가 남긴 감상, 한줄평. 이 서비스를 쓰는 시간의 대부분은 읽는 시간이다.

그래서 **글 이외의 것이 시선을 가져가면 안 된다**는 것이 이 시스템의 유일한 출발점이다. 색은 그 자체로 시선을 끌기 때문에, UI에서 색을 전부 걷어냈다.

대신 **작품에는 색을 남겼다.** 영화 포스터와 책 표지, 그리고 마스코트. 화면에서 색을 갖는 자리는 여기뿐이고, 그래서 그 자리가 눈에 띈다. "이런 걸 읽고 봤다"를 보여주고 싶은 마음 — 이 서비스가 자극하려는 지점이 정확히 거기다.

### 네 가지 규칙

1. **UI는 무채색 100%.** 색은 작품(표지·포스터)과 마스코트에만.
2. **경계는 1px 헤어라인.** 그림자 없음 (예외 하나, §5.1).
3. **위계는 크기와 굵기로만.** 색으로 강조하지 않는다.
4. **랜딩까지 같은 팔레트.** 예외 스코프 없음.

---

## 2. 색

### 2.1 `point` — 흑백에서의 강조

```
--color-point: #0a0a0a;         /* 다크: #fafafa */
--color-point-hover: #232323;   /* 다크: #e4e4e4 */
```

다른 시스템에서 `point`는 브랜드 색이지만, 여기서 `point`는 **"가장 강한 채움"**이다. 흑백에서 가장 강한 것은 색이 아니라 검정이고, 다크 모드에서는 흰색이다. 이름은 그대로 두되 의미가 뒤집혔다.

### 2.2 면과 글자

| 토큰 | 라이트 | 다크 | 쓰임 |
|---|---|---|---|
| `paper` | `#fafafa` | `#0f0f0f` | 앱 바탕 |
| `surface` | `#ffffff` | `#171717` | 카드·패널 |
| `surface-2` | `#f2f2f2` | `#1f1f1f` | 한 단계 안쪽 면, 비활성 입력 |
| `ink` | `#141414` | `#f2f2f2` | 본문·제목 |
| `muted-2` | `#4a4a4a` | `#b5b5b5` | 본문 다음 위계 |
| `muted` | `#6e6e6e` | `#8f8f8f` | 메타데이터, 플레이스홀더 |
| `line` | `#e4e4e4` | `#2e2e2e` | 1px 경계 전부 |

라이트에서 `muted-2`가 `muted`보다 **어둡고**, 다크에서는 **밝다.** 두 모드 모두에서 `muted-2`가 "더 잘 읽히는 쪽"이라는 뜻이다. 밝기 값이 아니라 **역할**로 이름을 지었기 때문에 반전이 자동으로 맞는다.

### 2.3 경고색이 없다

```
--color-danger: #141414;    /* ink와 같다 */
--color-danger-2: #0a0a0a;
```

무채색 시스템에는 빨강을 둘 자리가 없다. **파괴적 액션은 색이 아니라 문장과 확인 단계로 알린다** — 버튼 라벨을 명확히 쓰고, 필요하면 한 단계를 더 둔다. 색으로 겁주는 대신 말로 설명하는 쪽이다.

### 2.4 `on-art` — 유일하게 반전하지 않는 토큰

```
--color-on-art: #141414;    /* 다크에서도 그대로 */
```

책등이나 색칠된 면 **위에 얹는 글자색**이다. 이 면들은 테마와 무관하게 자기 밝기를 갖기 때문에, 글자색이 테마를 따라 반전하면 다크 모드에서 밝은 책등 위에 흰 글자가 올라가 사라진다.

**"무엇 위에 있는가"가 "어떤 테마인가"보다 우선하는 유일한 경우**다.

> 다만 책등 30벌 시스템(`spineStyles.ts`)은 프리셋마다 자기 `ink`를 들고 있어 이 토큰을 쓰지 않는다. 어두운 책등에는 밝은 글자를 얹는다 — 실측 대비 최저 10.34:1.

### 2.5 서가 선반

```
--color-shelf: #141414;          /* 다크: #f2f2f2 */
--color-shelf-shadow: #e4e4e4;   /* 다크: #2e2e2e */
```

선반은 두 줄이다. 위는 판(`shelf`), 아래는 그림자(`shelf-shadow`). 그림자를 안 쓰는 시스템에서 **입체감을 색으로 그린** 자리다.

---

## 3. 타이포그래피

```
--font-sans: "Archivo", "Pretendard Variable", Pretendard, sans-serif;
```

- **Archivo** — Google Fonts로 로드 (400/500/600/700/800). 라틴 글자를 담당한다.
- **Pretendard** — **웹폰트로 받지 않는다.** 사용자 기기에 설치돼 있으면 쓰고, 없으면 시스템 산세리프로 떨어진다. 한글 웹폰트를 통째로 받는 비용을 피한 선택이다.

세리프를 쓰지 않는다. 1안은 Noto Serif KR과 Pretendard의 대비로 "읽는 경험"을 만들려 했는데, 2안은 그 대비를 **굵기 차이**로 대체했다.

### 3.1 굵기가 위계를 전담한다

```css
body { font-weight: 400; letter-spacing: -0.005em; }
```

색으로 강조할 수 없으니 굵기 폭을 넓게 쓴다. 실사용 분포:

| 굵기 | 사용 | 쓰임 |
|---|---:|---|
| `font-bold` (700) | 133 | 제목, 강조 |
| `font-semibold` (600) | 123 | 소제목, 라벨 |
| `font-medium` (500) | 71 | 버튼, 링크 |
| `font-light` (300) | 17 | 긴 설명문 — 제목과 벌리기 위해 아래로 |
| `font-normal` (400) | 9 | 본문 기본 |

`font-light`가 17번 쓰인 게 이 시스템의 특징이다. **위로 굵게 하는 대신 아래로 얇게 해서** 간격을 벌린다.

### 3.2 크기

Tailwind 기본 스케일 대신 **px 임의값**을 쓴다. 실사용 상위:

| 크기 | 사용 | 쓰임 |
|---|---:|---|
| 11px | 88 | 섹션 라벨(대문자 + 자간), 메타 |
| 13px | 44 | 보조 본문, 목록 항목 |
| 10px | 24 | 최소 라벨, 배지 |
| 15px | 23 | 본문 |
| 17 / 19 / 21px | 9 | 소제목 |
| 28 / 32px | 4 | 큰 제목(고정) |

제목은 대부분 `clamp()`로 반응한다:

```
text-[clamp(28px,5vw,44px)]   /* 페이지 제목 */
text-[clamp(26px,4vw,40px)]   /* 섹션 제목 */
text-[clamp(38px,6vw,64px)]   /* 랜딩 히어로 */
```

한글 제목에는 `tracking-[-0.035em]`와 `break-keep`을 함께 쓴다 — 다만 **본문에는 `break-keep` 단독 사용 금지**(§6).

---

## 4. 형태

```
--radius-hair: 6px;   /* 배지, 작은 태그, 책등 아랫단 */
--radius-ui: 10px;    /* 버튼, 입력, 드롭다운 */
--radius-card: 14px;  /* 카드, 패널 */
```

세 단계뿐이고 이름이 **크기가 아니라 용도**다(`sm/md/lg`가 아니다). `rounded-full`은 아바타와 토글에만 쓴다.

---

## 5. 그림자와 상태

### 5.1 그림자를 쓰지 않는다 — 예외 하나

경계는 전부 1px `line`이다. 단 하나의 예외:

```
--shadow-popover: 0 1px 2px …, 0 8px 20px -6px …, 0 20px 44px -12px …;
```

**자동완성 목록처럼 본문 위에 떠 있는 레이어**다. 아래 내용을 가리고 있다는 사실은 헤어라인만으로 전달되지 않는다. 겹침은 색이나 선이 아니라 깊이의 문제라서, 여기서만 그림자를 허용한다.

다크 모드에서는 같은 그림자를 훨씬 진하게(0.5~0.6) 쓴다 — 어두운 바탕에서 옅은 그림자는 보이지 않는다.

### 5.2 포커스와 선택

```css
:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
::selection    { background: var(--color-ink); color: var(--color-surface); }
```

포커스 링도 무채색이다. 접근성상 색이 아니라 **두께와 오프셋**으로 눈에 띄게 한다.

### 5.3 입력

```css
.input-underline {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-ui);
  background: var(--color-surface);
  padding: 10px 12px;
}
.input-underline:focus { border-color: var(--color-ink); }
```

> **이름이 실제와 다르다.** 1안에서 밑줄 입력이었던 클래스가 2안에서 헤어라인 상자로 바뀌었는데 이름은 남았다. 포커스는 **테두리 색만** 잉크로 바뀐다 — 링도, 그림자도 없다.

---

## 6. 한글 처리

```
whitespace-pre-wrap  break-keep  break-words
```

`break-keep`(=`word-break: keep-all`)만 쓰면 **공백 없는 한국어가 줄바꿈 없이 넘친다.** keep-all은 "공백만이 줄바꿈 기회"라는 뜻이고, 띄어쓰기 없이 입력된 문장은 끊을 곳이 없다. 실측: 600px 컬럼에서 `scrollWidth 3,578`.

- `pre-wrap` — 사용자가 입력한 줄바꿈 보존
- `keep-all` — 가급적 어절에서 끊기
- `break-word` — 그래도 안 들어가면 어쨌든 끊기

사용자 입력을 렌더링하는 모든 곳에 셋을 함께 건다.

---

## 7. 모션

| 유틸 | 값 | 쓰임 |
|---|---|---|
| `.card-hover:active` | `scale(0.985)`, 150ms | 카드 누름 반응 |
| `.page-enter` | 220ms `cubic-bezier(.22,1,.36,1)`, `translateY(8px)` | 페이지 진입 |
| `.skeleton-shimmer` | 1.6s 무한 | 로딩 |
| `@keyframes marquee` | — | 랜딩 인용구 흐름 |
| `@keyframes tick-pop` | scale 0 → 1.25 → 1 | 체크 표시 |

모두 짧고 작다. **움직임도 시선을 가져가는 요소**라 §1의 원칙이 그대로 적용된다.

---

## 8. 모바일

```css
.pt-safe / .pb-safe / .pl-safe / .pr-safe   /* env(safe-area-inset-*) */
.min-h-dvh / .h-dvh                          /* iOS Safari 크롬 겹침 회피 */
.pb-nav-safe                                 /* calc(3.5rem + safe-area) */
html { -webkit-tap-highlight-color: transparent; overscroll-behavior: none; }
```

모바일 웹뷰 우선. 하단 네비 높이(56px)와 홈 인디케이터를 합친 여백을 유틸 하나로 둔다.

---

## 9. daisyUI

`@plugin "daisyui"`로 로드돼 있지만 **테마를 설정하지 않았고, 컴포넌트 클래스도 거의 쓰지 않는다.** 색·형태·타이포는 전부 위의 커스텀 토큰이 결정한다. 사실상 미사용에 가까우므로, 정리할 때 걷어낼 후보다.

---

## 10. 이 문서와 코드의 관계

토큰의 단일 출처는 **`apps/web/src/index.css`**다. 이 문서는 그것을 읽고 정리한 것이므로, 값이 바뀌면 코드가 먼저고 문서가 나중이다.

> **경위**: 이 문서는 1안(양피지·인디고·앰버) 시절에 작성된 뒤 갱신되지 않았다. 코드는 브루탈리스트 → Claude Design → 흑백 2안으로 두 번 더 바뀌었지만 문서는 첫 팔레트에 멈춰 있었고, 2026-09-09에 코드에서 역추출해 다시 썼다.

## 변경 이력

- 2026-09-09: 2안 "모던 미니멀 · 흑백"을 `index.css`에서 역추출해 전면 재작성. 1안 팔레트는 `157d123^`에 보존
- (이전) 1안 "양피지" — 크림 바탕 + 인디고 + 앰버, Noto Serif KR / Pretendard 이중 스케일
