import { LegalLayout, LegalSection } from './LegalLayout';

const CONTACT_EMAIL = 'yunchan0339@gmail.com';

export default function PrivacyPage() {
  return (
    <LegalLayout label="Legal" title="개인정보처리방침" updatedAt="2026.07.14">
      <LegalSection num="01" title="수집하는 개인정보">
        <p>
          INOS는 Google 계정으로 로그인할 때 다음 정보를 수집합니다: 이메일
          주소, 이름(닉네임), 프로필 이미지. 비밀번호는 수집하지 않으며 Google
          OAuth 인증만 사용합니다.
        </p>
        <p>
          서비스 이용 과정에서 모임 참여 기록, 일정 응답, 발제 노트 등 이용자가
          직접 작성한 콘텐츠가 저장됩니다.
        </p>
      </LegalSection>

      <LegalSection num="02" title="이용 목적">
        <p>
          수집한 정보는 다음 목적으로만 사용합니다: 회원 식별 및 로그인, 모임
          초대·일정 조율 메일 발송, 오가니제이션 멤버 간 프로필 표시, 발제문
          생성 및 노트 공유 기능 제공.
        </p>
      </LegalSection>

      <LegalSection num="03" title="AI 처리 위탁">
        <p>
          발제문 생성 기능은 Anthropic의 Claude API를 사용합니다. 이 과정에서
          모임에 등록된 책·영화 제목과 작가·감독 정보가 Anthropic 서버로
          전송됩니다. 이용자의 개인 식별 정보(이메일, 이름)는 전송되지
          않습니다.
        </p>
      </LegalSection>

      <LegalSection num="04" title="보관 및 파기">
        <p>
          개인정보는 회원 탈퇴 또는 관리자에 의한 계정 삭제 시 지체 없이
          파기됩니다. 계정 삭제 시 멤버십, 일정 응답, 발제 노트가 함께
          삭제됩니다.
        </p>
      </LegalSection>

      <LegalSection num="05" title="제3자 제공">
        <p>
          법령에 근거한 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.
          작성한 발제 노트는 이용자가 직접 &lsquo;멤버에게 공개&rsquo;를 선택한
          경우에만 같은 오가니제이션 멤버에게 공개됩니다.
        </p>
      </LegalSection>

      <LegalSection num="06" title="이용자의 권리 및 문의">
        <p>
          이용자는 언제든지 자신의 개인정보 열람·정정·삭제를 요청할 수
          있습니다. 개인정보 관련 문의는 아래 연락처로 보내주세요.
        </p>
        <p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-ink border-b border-ink hover:text-muted-2 hover:border-muted-2"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
