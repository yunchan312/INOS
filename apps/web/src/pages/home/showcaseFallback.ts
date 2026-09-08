import type { ShowcaseDto } from '@inos/types';

/**
 * 외부 API(알라딘·TMDB)가 없거나 죽었을 때 랜딩 서가를 채우는 큐레이션 목록.
 * 표지·포스터 URL은 일부러 비워둔다 — 남의 이미지 주소를 하드코딩해두면
 * 언젠가 깨진 이미지가 되고, 서가는 책등만으로도 충분히 읽힌다.
 */
export const FALLBACK_SHOWCASE: ShowcaseDto = {
  books: [
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
  ],
  movies: [
    { tmdbId: -1, title: '화양연화', releaseYear: 2000, posterPath: null },
    { tmdbId: -2, title: '패터슨', releaseYear: 2016, posterPath: null },
    { tmdbId: -3, title: '기생충', releaseYear: 2019, posterPath: null },
    { tmdbId: -4, title: '드라이브 마이 카', releaseYear: 2021, posterPath: null },
    { tmdbId: -5, title: '리틀 포레스트', releaseYear: 2018, posterPath: null },
  ],
};
