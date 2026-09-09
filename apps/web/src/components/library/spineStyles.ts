/**
 * 책등 스타일 30벌 — 랜딩 미리보기와 실제 서재가 같은 것을 쓴다.
 *
 * 실제 책등 사진은 어떤 API에서도 구할 수 없다 — 출판사가 유통사에 넘기는 건
 * 앞표지뿐이고 책등은 애초에 디지털화되지 않는다. 그래서 이미지를 붙이는 대신
 * 진짜 책등이 가진 요소(장정 띠, 제목 판, 바닥 출판사 마크, 천·종이 질감)를
 * CSS로 짜서 30벌을 만든다. 서체는 30벌 모두 다르다.
 *
 * 색은 무채색만 쓴다("색은 작품에만" 규칙). 대신 명도 폭을 흰색부터 먹색까지
 * 넓게 잡고, 어두운 책등에는 밝은 글자를 얹어 대비를 만든다.
 */

export type SpineRule = 'none' | 'single' | 'double' | 'top' | 'panel' | 'band';
export type SpineTexture = 'none' | 'linen' | 'paper' | 'gloss';

export interface SpineStyle {
  /** CSS font-family 값 — 30벌 전부 다른 서체 */
  font: string;
  weight: number;
  /** 세로쓰기 글자 크기(px) */
  size: number;
  tracking: string;
  /** 책등 바탕 (무채색) */
  bg: string;
  /** 글자색 — 바탕 명도에 맞춘다 */
  ink: string;
  rule: SpineRule;
  texture: SpineTexture;
  /** 바닥의 출판사 마크 자리 */
  foot: string;
  /** 위쪽 모서리를 둥글게 (양장본 느낌) */
  round: boolean;
}

const DARK = '#141414';
const LIGHT = '#f4f4f4';

export const SPINE_STYLES: SpineStyle[] = [
  // ── 명조·세리프 계열: 고전 문학 양장본 ──────────────────────────
  { font: "'Noto Serif KR', serif",      weight: 500, size: 13, tracking: '0.02em',  bg: '#f4f2ef', ink: DARK,  rule: 'double', texture: 'paper', foot: '—',  round: true },
  { font: "'Nanum Myeongjo', serif",     weight: 400, size: 14, tracking: '0.04em',  bg: '#2a2a2a', ink: LIGHT, rule: 'single', texture: 'none',  foot: '◆',  round: true },
  { font: "'Song Myung', serif",         weight: 400, size: 13, tracking: '0.08em',  bg: '#e9e6e1', ink: DARK,  rule: 'panel',  texture: 'paper', foot: '',   round: false },
  { font: "'Gowun Batang', serif",       weight: 400, size: 14, tracking: '0.01em',  bg: '#fafafa', ink: DARK,  rule: 'top',    texture: 'linen', foot: '·',  round: true },
  { font: "'Hahmlet', serif",            weight: 500, size: 13, tracking: '0em',     bg: '#1e1e1e', ink: LIGHT, rule: 'double', texture: 'none',  foot: '□',  round: false },
  { font: "'Diphylleia', serif",         weight: 400, size: 14, tracking: '0.05em',  bg: '#dedbd6', ink: DARK,  rule: 'none',   texture: 'paper', foot: '—',  round: true },

  // ── 고딕·산세리프 계열: 인문 교양·비문학 ────────────────────────
  { font: "'Noto Sans KR', sans-serif",  weight: 700, size: 13, tracking: '-0.01em', bg: '#3a3a3a', ink: LIGHT, rule: 'band',   texture: 'none',  foot: '▪',  round: false },
  { font: "'Nanum Gothic', sans-serif",  weight: 700, size: 12, tracking: '0.02em',  bg: '#efefef', ink: DARK,  rule: 'single', texture: 'none',  foot: '—',  round: false },
  { font: "'IBM Plex Sans KR', sans-serif", weight: 500, size: 13, tracking: '0em',  bg: '#c9c9c9', ink: DARK,  rule: 'panel',  texture: 'none',  foot: '·',  round: false },
  { font: "'Gothic A1', sans-serif",     weight: 800, size: 12, tracking: '-0.02em', bg: '#f7f7f7', ink: DARK,  rule: 'top',    texture: 'gloss', foot: '▪',  round: true },
  { font: "'Sunflower', sans-serif",     weight: 500, size: 13, tracking: '0.03em',  bg: '#242424', ink: LIGHT, rule: 'none',   texture: 'linen', foot: '○',  round: true },
  { font: "'Gowun Dodum', sans-serif",   weight: 400, size: 14, tracking: '0.02em',  bg: '#e4e4e4', ink: DARK,  rule: 'double', texture: 'paper', foot: '',   round: true },
  { font: "'Stylish', sans-serif",       weight: 400, size: 14, tracking: '0.06em',  bg: '#fbfbfb', ink: DARK,  rule: 'single', texture: 'none',  foot: '◆',  round: false },

  // ── 굵은 제목용: 사회과학·에세이 ────────────────────────────────
  { font: "'Black Han Sans', sans-serif", weight: 400, size: 16, tracking: '-0.03em', bg: '#171717', ink: LIGHT, rule: 'none',   texture: 'none',  foot: '',   round: false },
  { font: "'Do Hyeon', sans-serif",      weight: 400, size: 15, tracking: '-0.01em', bg: '#d6d6d6', ink: DARK,  rule: 'band',   texture: 'none',  foot: '—',  round: false },
  { font: "'Jua', sans-serif",           weight: 400, size: 15, tracking: '0em',     bg: '#f2f2f2', ink: DARK,  rule: 'top',    texture: 'paper', foot: '·',  round: true },
  { font: "'Gugi', cursive",             weight: 400, size: 15, tracking: '0.02em',  bg: '#2f2f2f', ink: LIGHT, rule: 'single', texture: 'none',  foot: '◆',  round: true },
  { font: "'Orbit', sans-serif",         weight: 400, size: 14, tracking: '0.06em',  bg: '#ededed', ink: DARK,  rule: 'panel',  texture: 'gloss', foot: '▪',  round: false },
  { font: "'Bagel Fat One', system-ui",  weight: 400, size: 15, tracking: '0em',     bg: '#c2c2c2', ink: DARK,  rule: 'none',   texture: 'none',  foot: '○',  round: true },
  { font: "'Moirai One', system-ui",     weight: 400, size: 15, tracking: '0.01em',  bg: '#fafafa', ink: DARK,  rule: 'double', texture: 'linen', foot: '',   round: false },

  // ── 손글씨·붓글씨 계열: 시집·산문집 ─────────────────────────────
  { font: "'Nanum Pen Script', cursive", weight: 400, size: 17, tracking: '0.02em',  bg: '#f6f4f0', ink: DARK,  rule: 'none',   texture: 'paper', foot: '·',  round: true },
  { font: "'Nanum Brush Script', cursive", weight: 400, size: 18, tracking: '0em',   bg: '#1c1c1c', ink: LIGHT, rule: 'none',   texture: 'none',  foot: '',   round: true },
  { font: "'Gaegu', cursive",            weight: 700, size: 15, tracking: '0.02em',  bg: '#efece7', ink: DARK,  rule: 'single', texture: 'paper', foot: '—',  round: false },
  { font: "'Kirang Haerang', cursive",   weight: 400, size: 15, tracking: '0.03em',  bg: '#dcdcdc', ink: DARK,  rule: 'top',    texture: 'none',  foot: '◆',  round: true },
  { font: "'Yeon Sung', cursive",        weight: 400, size: 15, tracking: '0.02em',  bg: '#333333', ink: LIGHT, rule: 'double', texture: 'linen', foot: '·',  round: false },
  { font: "'Dongle', sans-serif",        weight: 700, size: 18, tracking: '0.02em',  bg: '#f9f9f9', ink: DARK,  rule: 'panel',  texture: 'none',  foot: '□',  round: true },
  { font: "'Single Day', cursive",       weight: 400, size: 16, tracking: '0.01em',  bg: '#e8e8e8', ink: DARK,  rule: 'none',   texture: 'paper', foot: '',   round: false },
  { font: "'East Sea Dokdo', cursive",   weight: 400, size: 17, tracking: '0em',     bg: '#282828', ink: LIGHT, rule: 'top',    texture: 'none',  foot: '—',  round: true },
  { font: "'Gamja Flower', cursive",     weight: 400, size: 16, tracking: '0.02em',  bg: '#f4f4f4', ink: DARK,  rule: 'band',   texture: 'linen', foot: '·',  round: false },

  // ── 타자기: 자료집·연구서 ───────────────────────────────────────
  { font: "'Nanum Gothic Coding', monospace", weight: 700, size: 12, tracking: '-0.04em', bg: '#cfcfcf', ink: DARK, rule: 'double', texture: 'none', foot: '▪', round: false },
];

/** Google Fonts에 한 번에 요청할 서체 목록 — 위 30벌에서 뽑아 쓴다 */
const FAMILY_QUERY = [
  'Noto+Serif+KR:wght@400;500;700',
  'Nanum+Myeongjo',
  'Song+Myung',
  'Gowun+Batang',
  'Hahmlet:wght@400;500',
  'Diphylleia',
  'Noto+Sans+KR:wght@400;700',
  'Nanum+Gothic:wght@400;700',
  'IBM+Plex+Sans+KR:wght@400;500',
  'Gothic+A1:wght@400;800',
  'Sunflower:wght@500',
  'Gowun+Dodum',
  'Stylish',
  'Black+Han+Sans',
  'Do+Hyeon',
  'Jua',
  'Gugi',
  'Orbit',
  'Bagel+Fat+One',
  'Moirai+One',
  'Nanum+Pen+Script',
  'Nanum+Brush+Script',
  'Gaegu:wght@400;700',
  'Kirang+Haerang',
  'Yeon+Sung',
  'Dongle:wght@400;700',
  'Single+Day',
  'East+Sea+Dokdo',
  'Gamja+Flower',
  'Nanum+Gothic+Coding:wght@400;700',
];

/** 바닥 마크로 쓰는 글자들 — 서브셋에 빠지면 네모로 나온다 */
const FOOT_MARKS = '—·◆▪○□';

/**
 * 한글 웹폰트는 무겁다. 30벌을 그냥 부르면 CSS만 2.4MB(@font-face 3,843조각)다.
 * 대신 서가에 실제로 쓰인 글자만 담아 달라고 text= 로 요청하면 89KB로 줄고
 * 폰트 파일 30개를 합쳐도 676KB다(실측).
 *
 * 글자 목록은 제목에서 그때그때 뽑는다 — 책을 추가해도 손으로 맞출 필요가 없다.
 */
export function spineFontChars(titles: string[]): string[] {
  return [...new Set((titles.join('') + FOOT_MARKS).split(''))]
    .filter((c) => c.trim())
    .sort();
}

/** 넘긴 글자만 담은 30벌 스타일시트 주소. 글자가 비면 요청할 것이 없다. */
export function buildSpineFontsHref(chars: string[]): string | null {
  if (chars.length === 0) return null;
  const families = FAMILY_QUERY.join('&family=');
  return (
    `https://fonts.googleapis.com/css2?family=${families}` +
    `&text=${encodeURIComponent(chars.join(''))}&display=swap`
  );
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 한 선반에 늘어놓을 책등 스타일을 정한다.
 *
 * 실제 서재는 책이 지워지거나 더 열리면서 순서가 밀리는데, 자리 순서로 고르면
 * 그때마다 내 책의 생김새가 통째로 바뀐다. 그래서 seed(모임 id)로 고정하되,
 * 앞 권과 같은 벌이 나오면 한 칸 밀어 이웃끼리 겹치는 것만 푼다.
 */
export function assignSpineStyles(seeds: string[]): SpineStyle[] {
  let prev = -1;
  return seeds.map((seed) => {
    let i = hashString(`${seed}:style`) % SPINE_STYLES.length;
    if (i === prev) i = (i + 1) % SPINE_STYLES.length;
    prev = i;
    return SPINE_STYLES[i];
  });
}

/**
 * 고정된 목록을 한 줄로 늘어놓을 때 쓴다. 제목 해시로 고르면 이웃한 두 권이
 * 같은 스타일로 겹치는 일이 생겨서, 여기서는 자리 순서로 돌린다.
 * 7과 30은 서로소라 30권까지 한 벌도 겹치지 않고, 순서대로 나열되지도 않는다.
 */
export function spineStyleAt(index: number): SpineStyle {
  return SPINE_STYLES[(index * 7 + 3) % SPINE_STYLES.length];
}

/** 질감을 CSS background-image 값으로 바꾼다 */
export function textureLayer(texture: SpineTexture): string | undefined {
  switch (texture) {
    case 'linen':
      return 'repeating-linear-gradient(90deg, rgba(0,0,0,.055) 0 1px, rgba(0,0,0,0) 1px 3px)';
    case 'paper':
      return 'repeating-linear-gradient(0deg, rgba(0,0,0,.035) 0 1px, rgba(0,0,0,0) 1px 2px)';
    case 'gloss':
      return 'linear-gradient(90deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,.07) 100%)';
    default:
      return undefined;
  }
}
