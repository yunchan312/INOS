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

export interface MembershipInviteProps {
  groupName: string;
  inviterName: string;
  inviteeEmail: string;
  acceptUrl: string;
  greeting?: string | null;
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

export function MembershipInvite({
  groupName,
  inviterName,
  inviteeEmail,
  acceptUrl,
  greeting,
}: MembershipInviteProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${inviterName}님이 「${groupName}」에 초대했어요`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>INOS 초대장</Heading>

          {greeting && <Text style={styles.greeting}>{greeting}</Text>}

          <Text style={styles.text}>
            안녕하세요, <strong>{inviteeEmail}</strong>님
          </Text>
          <Text style={styles.text}>
            <strong>{inviterName}</strong>님이 인문학 모임{' '}
            <strong>「{groupName}」</strong>에 초대했어요.
          </Text>

          <Section style={styles.buttonSection}>
            <Button href={acceptUrl} style={styles.button}>
              모임 참여하기
            </Button>
          </Section>

          <Text style={styles.muted}>
            이 링크는 7일간 유효해요. 요청한 적이 없다면 무시하셔도 좋아요.
            <br />— INOS
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MembershipInvite;
