import { Section, Text } from '@react-email/components';
import {
  bodyText,
  Cta,
  EmailShell,
  formatKoreanDate,
  GreetingQuote,
  InfoBox,
  INK,
  MUTED,
} from './email-shell';

export interface MeetingInviteProps {
  toName: string;
  groupName: string;
  greeting?: string | null;
  bookTitle?: string | null;
  bookAuthor?: string | null;
  movieTitle?: string | null;
  movieDirector?: string | null;
  candidateFrom: Date;
  candidateTo: Date;
  availabilityUrl: string;
}

export function MeetingInvite({
  toName,
  groupName,
  greeting,
  bookTitle,
  bookAuthor,
  movieTitle,
  movieDirector,
  candidateFrom,
  candidateTo,
  availabilityUrl,
}: MeetingInviteProps) {
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (bookTitle) {
    rows.push({
      label: '책',
      value: (
        <>
          <strong>{bookTitle}</strong>
          {bookAuthor && <span style={{ color: MUTED }}> — {bookAuthor}</span>}
        </>
      ),
    });
  }
  if (movieTitle) {
    rows.push({
      label: '영화',
      value: (
        <>
          <strong>{movieTitle}</strong>
          {movieDirector && (
            <span style={{ color: MUTED }}> — {movieDirector} 감독</span>
          )}
        </>
      ),
    });
  }
  rows.push({
    label: '기간',
    value: (
      <>
        {formatKoreanDate(candidateFrom)} – {formatKoreanDate(candidateTo)}{' '}
        <span style={{ color: MUTED }}>중 선택</span>
      </>
    ),
  });

  return (
    <EmailShell
      preview={`${groupName} — 다음 모임 날짜를 선택해주세요`}
      headerLabel={groupName}
    >
      <Section style={{ padding: '28px 28px 0' }}>
        <Text
          style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: MUTED,
          }}
        >
          다음 모임
        </Text>
        <Text
          style={{
            margin: '10px 0 0',
            fontSize: '24px',
            fontWeight: 800,
            lineHeight: '1.25',
            letterSpacing: '-0.01em',
            color: INK,
          }}
        >
          {toName}님,
          <br />
          다음 모임이 열려요
        </Text>
        {greeting && (
          <Section style={{ marginTop: '20px' }}>
            <GreetingQuote>&ldquo;{greeting}&rdquo;</GreetingQuote>
          </Section>
        )}
      </Section>

      <Section style={{ padding: '4px 28px 0' }}>
        <InfoBox rows={rows} />
      </Section>

      <Section style={{ padding: '24px 28px 28px' }}>
        <Text style={{ ...bodyText, margin: '0 0 20px' }}>
          위 기간 중 가능한 날짜를 선택해주세요. 모든 멤버가 응답하면 날짜가
          자동으로 확정돼요.
        </Text>
        <Cta href={availabilityUrl}>가능한 날짜 선택</Cta>
      </Section>
    </EmailShell>
  );
}

export default MeetingInvite;
