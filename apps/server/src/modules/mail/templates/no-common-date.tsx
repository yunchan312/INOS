import { Section, Text } from '@react-email/components';
import { bodyText, Cta, EmailShell, INK, mutedText } from './email-shell';

export interface NoCommonDateProps {
  toName: string;
  groupName: string;
  orgUrl: string;
}

export function NoCommonDate({ toName, groupName, orgUrl }: NoCommonDateProps) {
  return (
    <EmailShell
      preview={`「${groupName}」 모임 날짜를 직접 정해주세요`}
      headerLabel={groupName}
    >
      <Section style={{ padding: '28px' }}>
        <Text style={{ margin: 0 }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border: `2px solid ${INK}`,
              padding: '4px 8px',
              color: INK,
              whiteSpace: 'nowrap',
            }}
          >
            전원 응답 완료
          </span>
        </Text>
        <Text
          style={{
            margin: '14px 0 0',
            fontSize: '24px',
            fontWeight: 800,
            lineHeight: '1.25',
            letterSpacing: '-0.01em',
            color: INK,
          }}
        >
          모두 가능한 날짜가
          <br />
          없어요
        </Text>
        <Text style={{ ...bodyText, margin: '16px 0 0' }}>
          {toName}님, 「<strong>{groupName}</strong>」의 새 모임에 멤버 전원이
          응답했지만 <strong>모두가 가능한 날짜가 없어요.</strong>
        </Text>
        <Text style={{ ...mutedText, margin: '12px 0 24px' }}>
          오가니제이션 홈의 모임 카드에서 날짜별 가능 인원을 확인하고 직접
          확정해주세요.
        </Text>
        <Cta href={orgUrl} dark>
          오가니제이션 홈으로 가기
        </Cta>
      </Section>
    </EmailShell>
  );
}

export default NoCommonDate;
