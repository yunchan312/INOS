import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'yunchan0339@gmail.com';
const VERSION = 'v0.0.1';

interface FooterProps {
  /** 로그인 페이지처럼 넓은(1080px) 레이아웃에 맞출 때 */
  wide?: boolean;
}

export function Footer({ wide }: FooterProps) {
  return (
    <footer className="mt-16 border-t-2 border-ink pb-safe">
      <div
        className={`mx-auto ${
          wide ? 'max-w-[1080px]' : 'max-w-3xl'
        } px-6 py-6 flex flex-col gap-4`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <p className="flex items-baseline gap-2.5">
            <span className="text-base font-extrabold tracking-tight">INOS</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted whitespace-nowrap">
              인문학의 OS
            </span>
          </p>
          <nav className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[11px] font-medium">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-muted hover:text-ink"
            >
              Contact: {CONTACT_EMAIL}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                '[INOS] 오가니제이션 생성 신청',
              )}`}
              className="text-muted hover:text-ink uppercase tracking-[0.1em] whitespace-nowrap"
            >
              오가니제이션 생성 신청
            </a>
            <Link
              to="/privacy"
              className="text-muted hover:text-ink uppercase tracking-[0.1em] whitespace-nowrap"
            >
              개인정보처리방침
            </Link>
            <Link
              to="/terms"
              className="text-muted hover:text-ink uppercase tracking-[0.1em] whitespace-nowrap"
            >
              이용약관
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[11px] text-muted">
          <span className="uppercase tracking-[0.14em]">
            © 2026 INOS · {VERSION}
          </span>
          <span>함께 읽고, 보고, 생각합니다.</span>
        </div>
      </div>
    </footer>
  );
}
