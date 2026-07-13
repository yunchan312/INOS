import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

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

const styles = {
  body: {
    backgroundColor: '#FAFAF8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '32px 0',
  } as const,
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    margin: '0 auto',
    padding: '32px',
    maxWidth: '480px',
  } as const,
  heading: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#111111',
    margin: '0 0 8px',
  } as const,
  text: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#333333',
    margin: '0 0 16px',
  } as const,
  contentRow: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#111111',
    margin: '0 0 8px',
  } as const,
  muted: {
    fontSize: '13px',
    color: '#888888',
    margin: '24px 0 0',
  } as const,
  greeting: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#555555',
    fontStyle: 'italic',
    borderLeft: '3px solid #FFDF05',
    paddingLeft: '12px',
    margin: '0 0 24px',
  } as const,
  contentBox: {
    backgroundColor: '#FAFAF8',
    borderRadius: '10px',
    padding: '16px 20px',
    margin: '16px 0',
  } as const,
  button: {
    backgroundColor: '#FFDF05',
    color: '#111111',
    padding: '12px 24px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '15px',
    textDecoration: 'none',
    display: 'inline-block',
  } as const,
  buttonSection: {
    margin: '24px 0',
    textAlign: 'center',
  } as const,
};

function formatKoreanDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
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
  return (
    <Html>
      <Head />
      <Preview>{`${groupName} — 다음 모임 날짜를 선택해주세요`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>다음 모임이 열려요</Heading>

          {greeting && <Text style={styles.greeting}>{greeting}</Text>}

          <Text style={styles.text}>
            <strong>{toName}</strong>님, 「{groupName}」의 다음 모임이 열려요.
          </Text>

          <Section style={styles.contentBox}>
            {bookTitle && (
              <Text style={styles.contentRow}>
                📖 {bookTitle}
                {bookAuthor ? ` — ${bookAuthor}` : ''}
              </Text>
            )}
            {movieTitle && (
              <Text style={styles.contentRow}>
                🎬 {movieTitle}
                {movieDirector ? ` — ${movieDirector} 감독` : ''}
              </Text>
            )}
          </Section>

          <Text style={styles.text}>
            {formatKoreanDate(candidateFrom)} ~ {formatKoreanDate(candidateTo)}{' '}
            사이 가능한 날짜를 선택해주세요.
          </Text>

          <Section style={styles.buttonSection}>
            <Button href={availabilityUrl} style={styles.button}>
              가능한 날짜 선택
            </Button>
          </Section>

          <Text style={styles.muted}>
            모든 멤버가 응답하면 모임 날짜가 자동으로 확정돼요.
            <br />— INOS
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MeetingInvite;
