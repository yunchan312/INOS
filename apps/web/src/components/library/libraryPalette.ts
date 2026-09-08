// 책등/포스터 색상 팔레트 — 2안 "색은 작품에만" 규칙에 따라 무채색 램프.
// 해시로 뽑는 색은 UI지 작품의 색이 아니다. 실제 표지·포스터 이미지만 색을 갖는다.
// 전부 어두운 글자(--color-on-art)가 읽히는 밝기로 제한한다.
// 해시 기반으로 고르기 때문에 리렌더되어도 같은 작품은 항상 같은 색/크기가 나온다.
const SPINE_COLORS = [
  '#f2f2f2',
  '#e6e6e6',
  '#dadada',
  '#cecece',
  '#c2c2c2',
  '#eaeaea',
  '#d4d4d4',
  '#bebebe',
  '#e0e0e0',
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
