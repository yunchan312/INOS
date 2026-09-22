# INOS 발제문 생성 규칙·아키텍처·모델 비용

> 작성일: 2026-09-08  
> 범위: TMDB ID 또는 ISBN-13으로 식별된 작품 1편의 조사, 발제문 생성, 검증  
> 상태: 구현 전 설계안. 모델 품질 평가는 별도 eval로 확정한다.

## 1. 결론

INOS의 발제문 생성은 한 번의 자유 형식 프롬프트가 아니라 다음 두 모델 세션으로 구성한다.

1. **생성 세션**: 외부 ID로 작품을 확정하고, 웹 검색으로 근거를 수집한 뒤 BrainClone 규격의 발제문을 구조화해 생성한다.
2. **검증 세션**: 생성 세션이 수집한 근거와 발제문만 받아 사실성·토론성·규칙 준수를 검사하고, 실패한 질문만 수정한다. 검증 세션은 웹 검색을 다시 하지 않는다.

초기 기본안은 **Claude Sonnet 5 생성 + Claude Sonnet 5 검증**이다. 현재 Anthropic 기반 구현을 가장 적게 바꾸면서도 모델을 Sonnet 4.6보다 개선할 수 있다. 작품 1편당 기준 비용은 약 **$0.114, 153원**이며, Sonnet 5의 토크나이저 차이를 보수적으로 반영하면 약 **188원**까지 본다.

비용 최적화가 필요해지면 실제 eval을 통과한다는 조건으로 다음 조합을 검토한다.

- **Claude Sonnet 5 생성 + GPT-5.4 Mini 검증**: 약 132원
- **GPT-5.6 Terra 생성 + GPT-5.4 Mini 검증**: 약 137원

모델 이름만 보고 품질을 확정하지 않는다. 이 문서의 평가 세트와 합격 기준을 통과한 조합만 운영 모델로 채택한다.

---

## 2. 확정된 제품·데이터 제약

### 2.1 영구 저장하는 작품 식별자

- 영화: `tmdbId`
- 책: `isbn13`

작품 기본정보, 웹 검색 원문, Research Pack은 작품 마스터 데이터로 영구 저장하지 않는다. 발제문 생성 시점에 매번 조회한다.

다만 다음 데이터는 작품 정보가 아니라 **생성 결과와 감사 정보**이므로 `Discussion` 또는 생성 로그에 저장할 수 있다.

- 최종 발제 질문
- 질문별 출처 URL
- 생성·검증 모델
- 프롬프트 버전
- 토큰·웹 검색 사용량과 비용
- 검증 결과와 재시도 횟수

이 정보까지 저장하지 않으면 나중에 질문의 근거, 비용, 실패 원인을 확인할 수 없다. 정말로 ID와 최종 질문 외에는 아무것도 저장하지 않는다면 출처와 사용량은 애플리케이션 로그에서만 관측해야 한다.

### 2.2 외부 ID의 역할

외부 ID는 발제문에 직접적인 통찰을 주는 데이터가 아니라 다음 역할을 한다.

- 동명 작품·동명이인 혼동 방지
- 검색 대상의 제목, 원제, 감독·저자, 개봉·출간 정보를 확정
- 인터넷 검색 쿼리의 정확도 향상

영화는 TMDB의 권장 흐름대로 검색 결과의 ID로 상세 정보를 조회한다. 상세 조회는 `append_to_response`로 credits, release dates 등의 하위 응답을 합칠 수 있다.

- [TMDB Search & Query for Details](https://developer.themoviedb.org/docs/search-and-query-for-details)
- [TMDB Movie Details](https://developer.themoviedb.org/reference/movie-details)

책은 국립중앙도서관 ISBN 서지정보 API에서 ISBN으로 제목, 저자, 출판사, 발행일, 주제, 책소개·목차 링크 등을 확인한다.

- [국립중앙도서관 ISBN 서지정보 API](https://www.nl.go.kr/NL/contents/N31101030500.do)

---

## 3. 발제문 생성 규칙

### 3.1 공통 전제

- 멤버는 작품을 끝까지 읽거나 본 뒤 모인다.
- 발제문은 모임 자리에서 처음 공개된다. 사전 배포하지 않는다.
- 멤버는 약 4명의 평범한 독자·관객이다.
- 다시 장면을 재생하거나 책을 펼쳐야 답할 수 있는 질문을 만들지 않는다.
- 세기, 찾아보기, 페이지 확인 등 준비가 필요한 행동을 요구하지 않는다.
- 작품을 일부만 본 사람은 별도로 배려하지 않는다.
- 질문 안에서 모범 답안이나 특정 해석을 미리 제시하지 않는다.
- 사실과 비평가의 해석, 감독·저자의 직접 발언을 구분한다.
- 검색 출처에 없는 구체적인 장면, 구절, 창작 의도를 모델 기억으로 만들어내지 않는다.

### 3.2 질문 슬롯

영화와 소설은 동일한 여섯 슬롯을 사용한다.

| 순서 | 슬롯 | 목적 | 필수 조건 |
| --- | --- | --- | --- |
| 1 | `warmup` | 누구나 말문을 열 수 있는 진입 질문 | 정답·재확인 불필요 |
| 2 | `technique` | 작품의 형식적 선택을 알아차리는 질문 | `element`, `observation`, 근거 필요 |
| 3 | `thematic` | 작품의 주제·해석을 여는 질문 | 첫 번째 `angle` |
| 4 | `thematic` | 다른 방향의 주제·해석 | 3번과 다른 `angle` |
| 5 | `stance` | 감독·저자의 세계관이나 작품의 입장 | `evidence`, `source`; 근거 없으면 `thematic`으로 대체 |
| 6 | `private_experience` | 작품과 참가자의 삶을 연결 | 교훈 강요 금지 |

`application`처럼 “앞으로 무엇을 바꿀 것인가”, “무엇을 배웠는가”를 묻는 슬롯은 사용하지 않는다.

### 3.3 영화 `technique` 규칙

다음 여섯 요소 중 검색 근거가 가장 강한 하나를 모델이 선택한다.

1. 미장센
2. 편집
3. 카메라 움직임
4. 사운드 디자인
5. 배우 연출
6. 서사 구조

주의사항:

- 사운드 디자인을 음악으로 축소하지 않는다. 침묵과 일상음도 포함한다.
- 서사 구조는 줄거리의 내용이 아니라 정보가 전달되는 순서와 방식이다.
- `observation`은 인물·장소·행동 중 최소 두 요소로 장면을 특정한다.
- 기억 편차를 고려해 한 프레임보다 반복되는 순간의 범주를 우선한다.
- 장면 근거가 검색 자료에 없으면 구체적인 장면을 창작하지 않는다.

### 3.4 책 `technique` 규칙

소설·문학은 다음 다섯 요소 중 하나를 선택한다.

1. 목소리와 시점
2. 순서
3. 요약과 장면
4. 디테일의 선택
5. 대화와 침묵

번역서에서 원저자의 문체와 번역자의 선택을 구분하기 어려우므로 “문장·문체”를 독립 요소로 사용하지 않는다.

책의 `technique` 질문에 실제 `passage`를 넣을 경우 다음을 지킨다.

- 공개가 허용된 미리보기, 출판사 제공 자료 또는 사용자가 입력한 구절만 사용한다.
- 페이지 번호는 사용하지 않는다.
- 원문을 확보하지 못하면 모델 기억으로 인용문을 만들지 않는다.
- 인용문이 필수인 생성 모드에서 원문을 확보하지 못하면 `NEEDS_INPUT`을 반환한다.

### 3.5 `thematic`과 `stance` 규칙

- 두 `thematic` 질문은 `인물의 선택`, `작품의 입장`, `제목과 상징`, `구조의 효과`, `관계의 변화`, `사회적 맥락` 등의 서로 다른 각도를 사용한다.
- 같은 질문을 표현만 바꿔 반복하지 않는다.
- `stance`는 작품 내부 증거, 공식 인터뷰 또는 검증된 비평 자료가 있을 때만 만든다.
- 특정 비평가의 해석을 감독·저자의 직접 의도로 바꾸지 않는다.
- 작품에 분명한 입장이 없거나 근거가 약하면 `stance`는 `null`로 두고 세 번째 `thematic` 질문으로 대체한다.
- `stance`는 토론 전체를 먼저 프레이밍하지 않도록 다섯 번째에 둔다.

### 3.6 논픽션 분기

논픽션은 문학의 다섯 기법을 그대로 적용하지 않는다. 다음 논증 축을 사용한다.

- 핵심 주장
- 증거의 유형
- 가장 약한 논리 고리
- 다루지 않은 반론
- 저자의 이해관계와 전제

논픽션에서 `stance`는 nullable이 아니라 필수다.

---

## 4. 생성 아키텍처

### 4.1 전체 흐름

```text
POST /discussions/:meetingId/generate
  ↓
DB에서 tmdbId / isbn13 조회
  ↓
TMDB / 국립중앙도서관 API 실시간 조회
  ↓
GENERATOR 세션: 웹 조사 + 근거 카드 + 6슬롯 초안
  ↓
VALIDATOR 세션: 근거·규칙·토론성 검사 + 필요한 슬롯만 수정
  ↓
코드 기반 최종 스키마 검증
  ↓
GENERATED / NEEDS_INPUT / FAILED
```

### 4.2 세션 A — Generator

Generator만 웹 검색 도구를 사용한다.

입력:

- 작품 종류
- `tmdbId` 또는 `isbn13`
- 외부 API에서 방금 조회한 메타데이터
- 영화·문학·논픽션별 발제문 규칙
- 좋은 질문과 나쁜 질문의 대조 예시

처리:

1. 작품 원제와 감독·저자를 기준으로 작품을 확정한다.
2. 3~6회의 웹 검색으로 작품 맥락, 기법, 창작자 인터뷰, 신뢰할 수 있는 비평을 찾는다.
3. 사실, 창작자의 직접 발언, 비평가의 해석을 분리한다.
4. 사용할 수 있는 근거를 `EvidenceCard`로 만든다.
5. 근거가 강한 요소를 선택해 여섯 슬롯을 생성한다.

출력 예시:

```ts
interface EvidenceCard {
  id: string;
  category:
    | 'SCENE'
    | 'PASSAGE'
    | 'TECHNIQUE'
    | 'THEME'
    | 'CREATOR_INTENT'
    | 'CONTEXT';
  claim: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: 'PRIMARY' | 'INSTITUTION' | 'CRITICISM' | 'REVIEW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  isFact: boolean;
  isInterpretation: boolean;
}

interface GeneratedQuestion {
  slot: 'warmup' | 'technique' | 'thematic' | 'stance' | 'private_experience';
  question: string;
  evidenceRefs: string[];
  element?: string;
  observation?: string;
  angle?: string;
  evidence?: string;
  source?: string;
}

interface GeneratorResult {
  work: {
    type: 'MOVIE' | 'FICTION' | 'NONFICTION';
    externalId: string;
    title: string;
    creator: string;
  };
  evidence: EvidenceCard[];
  questions: GeneratedQuestion[];
  missingEvidence: string[];
}
```

Anthropic와 OpenAI의 웹 검색은 모두 검색 호출 비용 외에 검색 결과가 입력 컨텍스트에 포함되면서 토큰 비용이 발생한다. 검색 횟수 상한을 두고 출처 URL을 반드시 보존한다.

- [Claude 웹 검색 도구](https://platform.claude.com/docs/zh-CN/agents-and-tools/tool-use/web-search-tool)
- [OpenAI 웹 검색 도구 및 가격](https://developers.openai.com/api/docs/pricing)

### 4.3 세션 B — Validator

Validator에는 웹 검색 도구를 제공하지 않는다. Generator가 만든 `EvidenceCard[]`와 질문만 검사한다.

검증 항목:

- 정확히 여섯 슬롯인지
- 슬롯 순서와 타입이 맞는지
- 질문이 근거보다 강한 사실을 단정하지 않는지
- `evidenceRefs`가 실제 카드에 존재하는지
- `technique`의 관찰이 구체적이고 재확인을 요구하지 않는지
- 두 `thematic.angle`이 다른지
- `stance`가 창작자 의도를 오귀속하지 않는지
- 질문 안에서 답을 흘리지 않는지
- 약 4명의 평범한 참가자가 이해할 수 있는지
- “무엇을 배웠나요?” 유형의 교훈형 질문이 아닌지

Validator 출력:

```ts
interface ValidationIssue {
  slotIndex: number;
  code:
    | 'SCHEMA_VIOLATION'
    | 'UNSUPPORTED_CLAIM'
    | 'MISATTRIBUTED_INTENT'
    | 'ANSWER_LEAKAGE'
    | 'REQUIRES_LOOKUP'
    | 'DUPLICATE_ANGLE'
    | 'TOO_ABSTRACT';
  reason: string;
}

interface ValidatorResult {
  passed: boolean;
  issues: ValidationIssue[];
  questions: GeneratedQuestion[];
}
```

전체를 다시 쓰지 않고 문제가 있는 슬롯만 수정한다. 한 번의 Validator 호출 안에서 수정까지 끝낸다. 최종 JSON Schema 검증을 통과하지 못하면 모델을 다시 부르기 전에 코드로 복구 가능한지 먼저 판단한다.

### 4.4 모델 검증과 코드 검증의 경계

코드가 검증할 것:

- 질문 개수와 슬롯 순서
- enum 값
- 필수 필드
- `evidenceRefs` 존재 여부
- 질문 길이
- 두 thematic angle의 값 중복
- 책 인용문과 입력 원문의 문자 일치

모델이 검증할 것:

- 답 유출
- 토론 가능성
- 질문 간 의미 중복
- 지나친 추상성
- 창작자 의도 오귀속
- 일반 참가자에게 필요한 인지 부담

### 4.5 상태와 SSE

생성 중 모델 토큰을 그대로 사용자에게 노출하지 않는다. 검증 전 초안이 화면에 나타났다가 바뀌는 문제를 막기 위해 진행 상태를 SSE로 보낸다.

```text
IDENTIFYING  작품 정보를 확인하고 있어요
RESEARCHING  신뢰할 만한 자료를 찾고 있어요
DRAFTING     토론 질문을 구성하고 있어요
VALIDATING   근거와 질문 품질을 검토하고 있어요
GENERATED    발제문이 준비됐어요
NEEDS_INPUT  인용문 등 사용자 자료가 필요해요
FAILED       생성에 실패했어요
```

### 4.6 실패와 재시도

- 외부 API 실패: 짧은 지수 백오프 후 최대 2회
- 웹 검색 실패: 확보한 근거로 생성 가능 여부 판단
- 근거 부족: 구체적 사실을 창작하지 않고 `NEEDS_INPUT` 또는 안전한 질문으로 대체
- Validator 실패: 실패 슬롯만 한 번 수정
- JSON 파싱 실패: structured output 재요청 1회
- 총 재시도 상한 초과: `FAILED`

---

## 5. 모델 후보와 공식 가격

가격은 2026-09-08 기준 각 제공사의 직접 API 표준 요금이며, 1M 토큰당 달러다. 지역 처리, Batch, 장문 컨텍스트, 캐시 할인은 제외한다.

| 모델 | 입력 | 출력 | 웹 검색 | INOS에서의 후보 역할 |
| --- | ---: | ---: | ---: | --- |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.01/회 | 현재 기준선, 신규 기본값으로는 비추천 |
| Claude Sonnet 5 | $2.00 | $10.00 | $0.01/회 | 생성·검증 기본 후보 |
| GPT-5.4 Mini | $0.75 | $4.50 | $0.01/회 | 검증 비용 최적화 후보 |
| GPT-5.4 | $2.50 | $15.00 | $0.01/회 | 생성 후보, 출력비가 상대적으로 높음 |
| GPT-5.6 Luna | $0.20 | $1.20 | $0.01/회 | 정형 검증 후보, 생성은 eval 전 보류 |
| GPT-5.6 Terra | $2.00 | $12.00 | $0.01/회 | OpenAI 계열 생성 기본 후보 |
| GPT-5.6 Sol | $4.00 | $20.00 | $0.01/회 | 품질 상한 비교 후보 |

공식 근거:

- Claude Sonnet 5는 입력 $2/MTok, 출력 $10/MTok이며, 같은 텍스트가 Sonnet 4.6 대비 약 1.0~1.35배 토큰으로 계산될 수 있다: [Anthropic Sonnet 5](https://www.anthropic.com/research/claude-sonnet-5)
- Claude Sonnet 4.6은 입력 $3/MTok, 출력 $15/MTok이다: [Anthropic 모델 가격표](https://www-cdn.anthropic.com/files/4zrzovbb/website/5678bc2f5978e5bcd4f1fe7c14b2c72284dcf9f8.pdf)
- GPT-5.6 Sol/Terra/Luna의 가격과 역할 구분: [OpenAI 모델 목록](https://developers.openai.com/api/docs/models)
- GPT-5.4 Mini는 입력 $0.75/MTok, 출력 $4.50/MTok이며 structured outputs와 웹 검색을 지원한다: [GPT-5.4 Mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini)
- OpenAI 웹 검색은 모든 모델에서 $10/1,000회이고 검색 콘텐츠 토큰은 모델 입력 요금으로 과금된다: [OpenAI API 가격](https://developers.openai.com/api/docs/pricing)
- Claude 웹 검색도 $10/1,000회이며 검색 결과는 입력 토큰으로 과금된다: [Claude 웹 검색 가격](https://platform.claude.com/docs/zh-CN/agents-and-tools/tool-use/web-search-tool)

---

## 6. 작품 1편당 예상 비용

### 6.1 공통 가정

| 세션 | 입력 토큰 | 출력 토큰 | 웹 검색 |
| --- | ---: | ---: | ---: |
| Generator | 14,000 | 2,000 | 4회 |
| Validator | 8,000 | 1,000 | 0회 |
| 합계 | 22,000 | 3,000 | 4회 |

- 환율: 1달러 = 1,340원 가정
- 캐시 미적용
- 재시도 없음
- 추론 모델의 reasoning token을 포함해 청구 출력 3,000토큰이라고 가정
- TMDB·국립중앙도서관 API 비용과 서버 인프라 비용 제외
- 책과 영화를 함께 생성하면 작품 2편으로 계산

동일 모델을 두 세션에 사용할 때의 공식은 다음과 같다.

```text
비용 = 22,000 × 입력 단가 / 1,000,000
     + 3,000 × 출력 단가 / 1,000,000
     + 4 × $0.01
```

### 6.2 같은 모델로 생성·검증

| Generator | Validator | 예상 달러 | 예상 원화 | 판단 |
| --- | --- | ---: | ---: | --- |
| Claude Sonnet 4.6 | Claude Sonnet 4.6 | $0.151 | 약 202원 | 현재 기준선 |
| Claude Sonnet 5 | Claude Sonnet 5 | $0.114 | 약 153원 | **초기 권장** |
| GPT-5.4 Mini | GPT-5.4 Mini | $0.070 | 약 94원 | 저비용 실험 후보 |
| GPT-5.4 | GPT-5.4 | $0.140 | 약 188원 | 생성 품질 비교 후보 |
| GPT-5.6 Luna | GPT-5.6 Luna | $0.048 | 약 64원 | 최저비용, 생성 품질 검증 필요 |
| GPT-5.6 Terra | GPT-5.6 Terra | $0.120 | 약 161원 | **OpenAI 단일모델 권장** |
| GPT-5.6 Sol | GPT-5.6 Sol | $0.188 | 약 252원 | 품질 상한 실험 후보 |

Sonnet 5는 토크나이저가 달라 같은 입력이 Sonnet 4.6 대비 최대 약 1.35배 토큰이 될 수 있다. 토큰 부분만 1.35배로 계산하면 Sonnet 5 + Sonnet 5는 약 **$0.140, 188원**이다.

### 6.3 생성 모델과 검증 모델 분리

| Generator | Validator | 예상 달러 | 예상 원화 | 판단 |
| --- | --- | ---: | ---: | --- |
| Claude Sonnet 5 | GPT-5.4 Mini | $0.099 | 약 132원 | **교차 제공사 비용 최적화 후보** |
| Claude Sonnet 5 | GPT-5.6 Luna | $0.091 | 약 122원 | Validator 품질 eval 필수 |
| GPT-5.6 Terra | GPT-5.4 Mini | $0.103 | 약 137원 | **OpenAI 비용·품질 균형 후보** |
| GPT-5.6 Sol | GPT-5.4 Mini | $0.147 | 약 196원 | 생성 품질 우선 후보 |
| GPT-5.4 | GPT-5.4 Mini | $0.116 | 약 155원 | 5.4 계열 단일 SDK 후보 |

검증 모델이 웹 검색을 다시 하면 검색 4회 기준 최소 $0.04와 검색 콘텐츠 입력 토큰 비용이 추가된다. 검증의 독립성을 위해 검색을 반복하기보다 Generator가 수집한 근거를 그대로 전달한다.

### 6.4 운영 예산

- 작품 1편: 약 130~250원
- 책과 영화 2편을 함께 생성: 약 260~500원
- 생성 또는 검증 재시도 1회: 해당 세션 비용만 추가
- 보수적인 예산 상한: 작품 1편당 300원

실제 비용은 검색 결과 길이, reasoning token, 실패 재시도에 따라 달라진다. 모든 응답의 usage를 기록하고 최초 30건 이후 추정치를 실제 평균으로 교체한다.

---

## 7. 모델 선택 전략

### 7.1 1차 출시

**Claude Sonnet 5 → Claude Sonnet 5**

- 현재 Anthropic SDK와 웹 검색 구현을 유지할 수 있다.
- 생성과 검증의 JSON Schema, usage, citation 처리부터 안정화한다.
- Sonnet 4.6은 회귀 비교용으로만 남긴다.

### 7.2 비용 최적화

다음 순서로 검증 모델만 교체한다.

1. Claude Sonnet 5
2. GPT-5.4 Mini
3. GPT-5.6 Luna

동일한 Generator 결과를 각 Validator에 입력해 오류 탐지율과 잘못된 수정률을 비교한다. 작은 모델이 코드 검증으로 이미 걸러지는 오류만 반복 지적한다면 비용 절감 효과가 작으므로, 의미 중복·답 유출·오귀속 탐지 성능을 중심으로 평가한다.

### 7.3 OpenAI 대안

**GPT-5.6 Terra → GPT-5.4 Mini**를 기본 비교군으로 둔다.

OpenAI 공식 모델 가이드는 GPT-5.6 Terra를 지능과 비용의 균형 모델, GPT-5.6 Luna를 비용 민감형 고처리량 모델, GPT-5.6 Sol을 복잡한 전문 작업용 flagship으로 구분한다. 모두 Responses API에서 웹 검색과 structured outputs를 지원한다.

- [OpenAI 최신 모델 가이드](https://developers.openai.com/api/docs/guides/latest-model)
- [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol)

### 7.4 피해야 할 선택

- 가격만 보고 GPT-5.6 Luna를 Generator 기본값으로 바로 채택하지 않는다.
- Generator와 Validator가 각각 웹 검색하게 하지 않는다.
- 모델별로 다른 출력 형식을 만들지 않는다. 공통 JSON Schema를 사용한다.
- 운영 중 alias가 자동으로 바뀌지 않도록 평가 완료 후 가능하면 snapshot 또는 고정 모델 ID를 사용한다.
- 같은 모델의 자기검증을 완전한 독립 검증으로 간주하지 않는다. 코드 검증과 실제 사용자 eval을 병행한다.

---

## 8. 품질 평가 계획

### 8.1 평가 세트

최소 12개 작품을 사용한다.

- 영화 6편: 대중영화, 예술영화, 한국영화, 고전영화, 정보가 적은 영화 포함
- 소설 4편: 한국소설, 번역소설, 고전, 신간 포함
- 논픽션 2편

기존에 사람이 직접 만든 좋은 발제문을 정답이 아니라 품질 기준 예시로 포함한다.

### 8.2 평가 항목

| 항목 | 배점 |
| --- | ---: |
| 근거 정확성·오귀속 방지 | 30 |
| 실제 토론을 여는 힘 | 25 |
| 작품에 대한 구체성 | 20 |
| 슬롯 간 다양성 | 15 |
| 일반 참가자의 접근성 | 10 |

추가 실패 조건:

- 존재하지 않는 장면·구절 생성
- 감독·저자의 발언 오귀속
- 책 인용문 조작
- 작품을 다시 확인해야만 답할 수 있는 질문
- 답을 질문 안에서 사실상 확정

실패 조건이 한 건이라도 발생하면 평균 점수와 무관하게 해당 모델 조합은 운영 후보에서 제외한다.

### 8.3 운영 지표

- 운영자가 수정 없이 채택한 질문 비율
- 수정·삭제된 슬롯 비율
- 실제 모임에서 사용된 질문 비율
- 질문별 사용자 메모 발생률
- 작품당 평균 검색 횟수
- 작품당 입력·출력·reasoning 토큰
- 작품당 실제 비용
- Validator가 발견한 오류와 잘못 수정한 비율
- 생성 실패 후 복구 성공률

---

## 9. 구현 순서

### M1 — 계약 고정

- 현재 5개 문자열 출력을 6슬롯 공통 JSON Schema로 변경
- 영화·문학·논픽션 규칙을 타입으로 분리
- 코드 기반 검증기 구현
- `promptVersion`, 모델, usage 로깅

### M2 — 두 세션 분리

- `generateWithResearch()` 구현: 외부 API 조회, 웹 검색, 근거 카드, 질문 생성
- `validateAndRevise()` 구현: 웹 검색 없이 근거와 질문 검증
- citation과 검색 결과 이벤트를 텍스트 스트림에서 버리지 않고 수집
- 실패 슬롯만 수정

### M3 — 상태와 복구

- SSE를 토큰 스트림에서 단계별 진행 상태로 변경
- `NEEDS_INPUT` 추가
- 책 인용문 입력 경로 추가
- API·검색·스키마 실패별 재시도 상한 설정

### M4 — 모델 eval

- Claude Sonnet 5, GPT-5.6 Terra, GPT-5.6 Sol로 Generator 비교
- Claude Sonnet 5, GPT-5.4 Mini, GPT-5.6 Luna로 Validator 비교
- 12개 작품 평가 세트 실행
- 품질 합격 조합 중 가장 저렴한 구성을 운영 모델로 확정

---

## 10. 최종 권고

첫 구현은 다음 구성으로 시작한다.

```text
Generator: Claude Sonnet 5 + 웹 검색 3~6회
Validator: Claude Sonnet 5 + 웹 검색 없음
출력: 공통 JSON Schema
영구 작품 데이터: tmdbId 또는 isbn13만
저장: 최종 질문 + 출처 URL + 모델/프롬프트/usage 감사 정보
예산: 작품 1편당 200원, 상한 300원
```

이 구조가 안정화된 뒤 Validator를 GPT-5.4 Mini로 교체하는 것이 첫 비용 최적화 지점이다. Generator는 발제문의 작품성·구체성에 직접 영향을 주므로 작은 모델로 내리기 전에 반드시 실제 모임 기준 eval을 통과해야 한다.
