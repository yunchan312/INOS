// 책등/포스터 색상 팔레트 — 클로드 디자인 시안의 뮤트 톤 팔레트.
// 해시 기반으로 고르기 때문에 리렌더되어도 같은 작품은 항상 같은 색/크기가 나온다.
const SPINE_COLORS = [
  '#a4b5c4', // 더스티 블루
  '#b7c4b1', // 세이지
  '#c98d6b', // 테라코타
  '#c2b280', // 카키 샌드
  '#d9b8ac', // 로즈 베이지
  '#7d8a8f', // 슬레이트
  '#d9c8a0', // 페일 골드
  '#8a8f78', // 올리브 그레이
  '#e5e0d4', // 아이보리
];

const SPINE_WIDTHS = [46, 56, 48, 62, 44, 52, 58, 50];
const SPINE_HEIGHTS = [252, 274, 258, 288, 244, 266, 292, 262, 248, 280];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickSpineColor(seed: string): string {
  return SPINE_COLORS[hashString(seed) % SPINE_COLORS.length];
}

export function pickSpineWidth(seed: string): number {
  return SPINE_WIDTHS[hashString(`${seed}:w`) % SPINE_WIDTHS.length];
}

export function pickSpineHeight(seed: string): number {
  return SPINE_HEIGHTS[hashString(`${seed}:h`) % SPINE_HEIGHTS.length];
}
