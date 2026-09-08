import type { TmdbBackdropSize, TmdbPosterSize } from '@inos/types';

/** TMDB 이미지 베이스 URL — 경로 조각 앞에 크기와 함께 붙인다 */
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/** TMDB API 이용 조건상 노출이 의무인 출처 문구 */
export const TMDB_ATTRIBUTION =
  '이 서비스는 TMDB API를 사용하지만 TMDB의 보증이나 인증을 받지 않았습니다.';

/**
 * DB에 저장된 경로 조각("/abc.jpg")을 표시용 URL로 변환.
 * 전체 URL을 저장하지 않는 이유는 베이스 URL과 크기가 바뀔 수 있기 때문.
 */
export function tmdbImageUrl(
  path: string | null | undefined,
  size: TmdbPosterSize | TmdbBackdropSize = 'w342',
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
