import { Section, Text } from '@react-email/components';
import {
  bodyText,
  Cta,
  EmailShell,
  footnote,
  GreetingQuote,
  withSubjectParticle,
  YellowHero,
} from './email-shell';

export interface MembershipInviteProps {
  groupName: string;
  inviterName: string;
  inviteeEmail: string;
  acceptUrl: string;
  greeting?: string | null;
}

export function MembershipInvite({
  groupName,
  inviterName,
  inviteeEmail,
  acceptUrl,
  greeting,
}: MembershipInviteProps) {
  return (
    <EmailShell
      preview={`${inviterName}님이 「${groupName}」에 초대했어요`}
      headerLabel="Invitation"
    >
      <YellowHero
        label="초대장"
        title={
          <>
            {withSubjectParticle(groupName)}
            <br />
            당신을 초대해요
          </>
        }
      />
      <Section style={{ padding: '28px' }}>
        {greeting && <GreetingQuote>&ldquo;{greeting}&rdquo;</GreetingQuote>}
        <Text style={{ ...bodyText, margin: '0 0 8px' }}>
          안녕하세요, <strong>{inviteeEmail}</strong>님
        </Text>
        <Text style={{ ...bodyText, margin: '0 0 24px' }}>
          <strong>{inviterName}</strong>님이 인문학 모임{' '}
          <strong>「{groupName}」</strong>에 초대했어요.
        </Text>
        <Cta href={acceptUrl}>모임 참여하기</Cta>
        <Text style={footnote}>
          이 링크는 7일간 유효해요. 요청한 적이 없다면 무시하셔도 좋아요.
        </Text>
      </Section>
    </EmailShell>
  );
}

export default MembershipInvite;
