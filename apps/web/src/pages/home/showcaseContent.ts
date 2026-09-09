import type { ShowcaseBookDto, ShowcaseMovieDto } from '@inos/types';

/**
 * 랜딩 서가에 꽂히는 책 10권. 폴백이 아니라 이게 정식 출처다 —
 * 무료로 쓸 수 있는 국내 도서 랭킹 API가 없고, SEOJI는 서지 검색이라
 * 랭킹도 없고 제목 매칭도 헐거워서 자동으로 채우면 엉뚱한 책이 꽂힌다.
 *
 * 표지 URL은 일부러 비워둔다 — 남의 이미지 주소를 하드코딩해두면
 * 언젠가 깨진 이미지가 되고, 서가는 책등만으로도 충분히 읽힌다.
 */
export const SHELF_BOOKS: ShowcaseBookDto[] = [
  { title: '데미안', author: '헤르만 헤세', coverUrl: null },
  { title: '이방인', author: '알베르 카뮈', coverUrl: null },
  { title: '자기만의 방', author: '버지니아 울프', coverUrl: null },
  { title: '토지', author: '박경리', coverUrl: null },
  { title: '멋진 신세계', author: '올더스 헉슬리', coverUrl: null },
  { title: '사피엔스', author: '유발 하라리', coverUrl: null },
  { title: '죽음의 수용소에서', author: '빅터 프랭클', coverUrl: null },
  { title: '침묵의 봄', author: '레이첼 카슨', coverUrl: null },
  { title: '슬픔이여 안녕', author: '프랑수아즈 사강', coverUrl: null },
  { title: '아침 그리고 저녁', author: '욘 포세', coverUrl: null },
];

/** TMDB가 없거나 죽었을 때 세우는 영화 폴백. tmdbId는 음수로 둬서 실제 작품과 섞이지 않게 한다 */
export const FALLBACK_MOVIES: ShowcaseMovieDto[] = [
  { tmdbId: -1, title: '화양연화', releaseYear: 2000, posterPath: null },
  { tmdbId: -2, title: '패터슨', releaseYear: 2016, posterPath: null },
  { tmdbId: -3, title: '기생충', releaseYear: 2019, posterPath: null },
  { tmdbId: -4, title: '드라이브 마이 카', releaseYear: 2021, posterPath: null },
  { tmdbId: -5, title: '리틀 포레스트', releaseYear: 2018, posterPath: null },
];
