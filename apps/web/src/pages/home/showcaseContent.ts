import type { ShowcaseBookDto, ShowcaseMovieDto } from '@inos/types';

/**
 * 랜딩 서가에 꽂히는 책. 폴백이 아니라 이게 정식 출처다 —
 * 무료로 쓸 수 있는 국내 도서 랭킹 API가 없고, SEOJI는 서지 검색이라
 * 랭킹도 없고 제목 매칭도 헐거워서 자동으로 채우면 엉뚱한 책이 꽂힌다.
 *
 * 선반이 가로로 넘치도록 넉넉히 둔다 — 몇 권만 꽂힌 선반은 서가로 안 읽힌다.
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
  { title: '노인과 바다', author: '어니스트 헤밍웨이', coverUrl: null },
  { title: '어린 왕자', author: '생텍쥐페리', coverUrl: null },
  { title: '변신', author: '프란츠 카프카', coverUrl: null },
  { title: '위대한 개츠비', author: '스콧 피츠제럴드', coverUrl: null },
  { title: '1984', author: '조지 오웰', coverUrl: null },
  { title: '동물농장', author: '조지 오웰', coverUrl: null },
  { title: '수레바퀴 아래서', author: '헤르만 헤세', coverUrl: null },
  { title: '인간 실격', author: '다자이 오사무', coverUrl: null },
  { title: '설국', author: '가와바타 야스나리', coverUrl: null },
  { title: '상실의 시대', author: '무라카미 하루키', coverUrl: null },
  { title: '광장', author: '최인훈', coverUrl: null },
  { title: '난쟁이가 쏘아올린 작은 공', author: '조세희', coverUrl: null },
  { title: '소년이 온다', author: '한강', coverUrl: null },
  { title: '채식주의자', author: '한강', coverUrl: null },
  { title: '82년생 김지영', author: '조남주', coverUrl: null },
  { title: '아무튼, 계속', author: '김교석', coverUrl: null },
  { title: '총 균 쇠', author: '재레드 다이아몬드', coverUrl: null },
  { title: '코스모스', author: '칼 세이건', coverUrl: null },
  { title: '이기적 유전자', author: '리처드 도킨스', coverUrl: null },
  { title: '정의란 무엇인가', author: '마이클 샌델', coverUrl: null },
  { title: '나는 왜 쓰는가', author: '조지 오웰', coverUrl: null },
  { title: '월든', author: '헨리 데이비드 소로', coverUrl: null },
];

/**
 * TMDB가 없거나 죽었을 때 세우는 영화 폴백.
 * tmdbId는 음수로 둬서 실제 작품과 섞이지 않게 한다.
 */
export const FALLBACK_MOVIES: ShowcaseMovieDto[] = [
  { tmdbId: -1, title: '화양연화', releaseYear: 2000, posterPath: null },
  { tmdbId: -2, title: '패터슨', releaseYear: 2016, posterPath: null },
  { tmdbId: -3, title: '기생충', releaseYear: 2019, posterPath: null },
  { tmdbId: -4, title: '드라이브 마이 카', releaseYear: 2021, posterPath: null },
  { tmdbId: -5, title: '리틀 포레스트', releaseYear: 2018, posterPath: null },
  { tmdbId: -6, title: '버드맨', releaseYear: 2014, posterPath: null },
  { tmdbId: -7, title: '그랜드 부다페스트 호텔', releaseYear: 2014, posterPath: null },
  { tmdbId: -8, title: '이터널 션샤인', releaseYear: 2004, posterPath: null },
  { tmdbId: -9, title: '사랑도 통역이 되나요', releaseYear: 2003, posterPath: null },
  { tmdbId: -10, title: '문라이트', releaseYear: 2016, posterPath: null },
  { tmdbId: -11, title: '노매드랜드', releaseYear: 2020, posterPath: null },
  { tmdbId: -12, title: '어느 가족', releaseYear: 2018, posterPath: null },
  { tmdbId: -13, title: '해피 아워', releaseYear: 2015, posterPath: null },
  { tmdbId: -14, title: '벌새', releaseYear: 2018, posterPath: null },
  { tmdbId: -15, title: '헤어질 결심', releaseYear: 2022, posterPath: null },
  { tmdbId: -16, title: '존 오브 인터레스트', releaseYear: 2023, posterPath: null },
  { tmdbId: -17, title: '가여운 것들', releaseYear: 2023, posterPath: null },
  { tmdbId: -18, title: '서브스턴스', releaseYear: 2024, posterPath: null },
  { tmdbId: -19, title: '괴물', releaseYear: 2023, posterPath: null },
  { tmdbId: -20, title: '추락의 해부', releaseYear: 2023, posterPath: null },
];
