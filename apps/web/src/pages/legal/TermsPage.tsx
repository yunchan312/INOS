import { LegalLayout, LegalSection } from './LegalLayout';

const CONTACT_EMAIL = 'yunchan0339@gmail.com';

export default function TermsPage() {
  return (
    <LegalLayout label="Legal" title="이용약관" updatedAt="2026.07.14">
      <LegalSection num="01" title="서비스 개요">
        <p>
          INOS는 초대받은 사람들만 참여할 수 있는 폐쇄형 인문학 모임
          플랫폼입니다. 오가니제이션 단위로 책·영화 모임의 일정 조율, 발제문
          생성, 노트 공유 기능을 제공합니다.
        </p>
      </LegalSection>

      <LegalSection num="02" title="계정과 참여">
        <p>
          로그인에는 Google 계정이 필요합니다. 오가니제이션에는 초대장을 받은
          이메일 계정으로만 참여할 수 있으며, 초대장은 발송 후 일정 기간이
          지나면 만료됩니다.
        </p>
        <p>
          오가니제이션 소유자는 멤버 초대·퇴장, 모임 생성·수정·삭제, 일정 확정
          권한을 가집니다.
        </p>
      </LegalSection>

      <LegalSection num="03" title="콘텐츠">
        <p>
          이용자가 작성한 발제 노트의 저작권은 작성자에게 있습니다. 노트는
          기본적으로 비공개이며, 작성자가 공개를 선택한 경우에만 같은
          오가니제이션 멤버에게 공유됩니다.
        </p>
        <p>
          AI가 생성한 발제 질문은 모임 진행을 돕기 위한 참고 자료이며, 그
          정확성을 보증하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection num="04" title="금지 행위">
        <p>
          타인의 계정 도용, 다른 멤버의 비공개 콘텐츠 무단 유출, 서비스의
          정상적인 운영을 방해하는 행위를 금지합니다. 위반 시 관리자는 계정
          이용을 제한할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection num="05" title="서비스 변경 및 책임">
        <p>
          서비스 내용은 사전 공지 후 변경될 수 있습니다. 무료로 제공되는
          서비스의 특성상, 천재지변·시스템 장애 등 불가피한 사유로 발생한
          손해에 대해서는 책임을 지지 않습니다.
        </p>
      </LegalSection>

      <LegalSection num="06" title="문의">
        <p>
          약관에 대한 문의는 아래 연락처로 보내주세요.
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
