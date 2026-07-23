// 알림 메일 본문에 쓰는 작품명/날짜 표기 헬퍼

export function meetingWorkLabel(meeting: {
  bookTitle: string | null;
  movieTitle: string | null;
}): string {
  if (meeting.bookTitle && meeting.movieTitle) {
    return `${meeting.bookTitle} · ${meeting.movieTitle}`;
  }
  return meeting.bookTitle ?? meeting.movieTitle ?? '모임';
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function formatDateLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}
