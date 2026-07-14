import { Section, Text } from '@react-email/components';
import {
  bodyText,
  Cta,
  EmailShell,
  InfoBox,
  withSubjectParticle,
  YellowHero,
} from './email-shell';

export interface OrgCreatedProps {
  toName: string;
  orgName: string;
  orgUrl: string;
}

export function OrgCreated({ toName, orgName, orgUrl }: OrgCreatedProps) {
  return (
    <EmailShell
      preview={`「${orgName}」 오가니제이션이 생성됐어요`}
      headerLabel="New organization"
    >
      <YellowHero
        label="생성 완료"
        title={
          <>
            {withSubjectParticle(orgName)}
            <br />
            만들어졌어요
          </>
        }
      />
      <Section style={{ padding: '28px' }}>
        <Text style={{ ...bodyText, margin: '0 0 16px' }}>
          {toName}님, 「<strong>{orgName}</strong>」 오가니제이션이 생성됐고,{' '}
          {toName}님이 <strong>소유자</strong>로 지정됐어요.
        </Text>
        <InfoBox
          style={{ marginBottom: '24px' }}
          rows={[
            {
              label: '01',
              value: (
                <>
                  설정에서 <strong>멤버를 이메일로 초대</strong>하고
                </>
              ),
            },
            {
              label: '02',
              value: (
                <>
                  책이나 영화를 정해 <strong>첫 모임</strong>을 만들면
                </>
              ),
            },
            {
              label: '03',
              value: (
                <>
                  일정 조율부터 발제 질문까지 <strong>자동으로</strong> 준비돼요
                </>
              ),
            },
          ]}
        />
        <Cta href={orgUrl}>오가니제이션 바로가기</Cta>
      </Section>
    </EmailShell>
  );
}

export default OrgCreated;
