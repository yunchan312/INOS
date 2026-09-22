import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { InviteLinkPreviewDto } from '@inos/types';
import { groupApi } from '@/api/endpoints/group';
import { useAuth } from '@/hooks/useAuth';
import { useShelfFonts } from '@/hooks/useShelfFonts';
import { SHELF_BOOKS } from '@/pages/home/showcaseContent';
import { ShelfBoard, ShowcaseSpine } from '@/pages/home/ShelfShowcase';

const RETURN_TO_KEY = 'inos.auth.returnTo';
/** 서가에 꽂는 책 수 — 좁은 화면(375px)은 한 줄에 들어가는 만큼, 넓어지면 더 */
const SHELF_MOBILE = 7;
const SHELF_DESKTOP = 16;

type SlideKind = 'intro' | 'greeting' | 'description' | 'poem' | 'shelf' | 'members' | 'enter';

/** 먹색으로 뒤집는 장 — 문구 두 장이 흰 장들 사이에서 쉼표가 된다 */
const INVERTED: ReadonlySet<SlideKind> = new Set(['poem', 'enter']);

/** 초대의 말·설명은 소유자가 비워둘 수 있다 — 빈 장을 보이지 않게 건너뛴다 */
function slidesFor(preview: InviteLinkPreviewDto): SlideKind[] {
  const slides: SlideKind[] = ['intro'];
  if (preview.greeting) slides.push('greeting');
  if (preview.description) slides.push('description');
  slides.push('poem', 'shelf', 'members', 'enter');
  return slides;
}

const heading =
  'text-[30px] font-semibold leading-[1.42] tracking-[-0.035em] break-keep lg:text-[52px] lg:leading-[1.38] lg:tracking-[-0.04em]';
const poem =
  'text-[22px] font-light leading-[1.95] tracking-[-0.025em] break-keep lg:text-[40px] lg:leading-[1.8]';
const eyebrow =
  'text-[10.5px] font-semibold tracking-[0.16em] text-muted lg:text-xs lg:tracking-[0.2em]';
// 소유자가 직접 쓴 글 — 띄어쓰기 없는 긴 문장도 화면 밖으로 넘치지 않게
const userText = 'whitespace-pre-line break-keep [overflow-wrap:anywhere]';

/**
 * 초대장 — 이메일 초대와 링크 초대가 모두 이 페이지로 온다.
 * 스크롤하면 한 장씩 넘어가고, 로그인하지 않아도 끝까지 볼 수 있다.
 */
export default function InviteLinkPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const deckRef = useRef<HTMLElement>(null);
  const autoEntered = useRef(false);

  const preview = useQuery({
    queryKey: ['invite-link-preview', token],
    queryFn: () => groupApi.getInviteLinkPreview(token as string),
    enabled: !!token,
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () => groupApi.acceptInviteLink(token as string),
    onSuccess: (data) => navigate(`/orgs/${data.groupId}`, { replace: true }),
  });

  const enter = () => {
    if (!isAuthenticated) {
      // 로그인하고 돌아오면 다시 스크롤할 필요 없이 바로 입장한다
      window.sessionStorage.setItem(RETURN_TO_KEY, `/invite/${token}?enter=1`);
      navigate('/login');
      return;
    }
    accept.mutate();
  };

  // 로그인 후 복귀 — 입장하기를 이미 눌렀던 사람이니 곧장 들여보낸다
  useEffect(() => {
    if (autoEntered.current || !isAuthenticated) return;
    if (searchParams.get('enter') !== '1') return;
    if (!preview.data || preview.data.expired) return;
    autoEntered.current = true;
    accept.mutate();
  }, [isAuthenticated, searchParams, preview.data, accept]);

  // 방향키·스페이스로도 넘길 수 있게 스크롤 영역에 포커스를 준다
  useEffect(() => {
    deckRef.current?.focus({ preventScroll: true });
  }, [preview.data]);

  if (preview.isLoading) {
    return (
      <StatusScreen>
        <span className="loading loading-dots loading-md text-muted" />
      </StatusScreen>
    );
  }

  if (preview.isError || !preview.data) {
    return (
      <StatusScreen>
        <p className={heading}>초대장을 찾을 수 없어요.</p>
        <p className="mt-4 text-[15px] font-light text-muted break-keep">
          주소가 잘못됐거나 더는 쓰지 않는 초대예요.
        </p>
        <HomeLink isAuthenticated={isAuthenticated} />
      </StatusScreen>
    );
  }

  const data = preview.data;

  if (data.expired) {
    return (
      <StatusScreen>
        <p className={eyebrow}>{data.groupName}</p>
        <p className={`mt-7 ${heading}`}>초대 기간이 지났어요.</p>
        <p className="mt-4 text-[15px] font-light text-muted break-keep">
          {data.inviterName}님에게 새 초대를 요청해주세요.
        </p>
        <HomeLink isAuthenticated={isAuthenticated} />
      </StatusScreen>
    );
  }

  const slides = slidesFor(data);
  const name = <strong className="font-bold">{data.groupName}</strong>;
  const hiddenMembers = data.memberCount - data.memberNames.length;

  const body = (kind: SlideKind): ReactNode => {
    switch (kind) {
      case 'intro':
        return (
          <h1 className={`invite-rise ${heading}`}>
            안녕하세요,
            <br />
            {name}에서 <br className="lg:hidden" />
            당신을 초대해요.
          </h1>
        );
      case 'greeting':
        return (
          <>
            <p className={`invite-rise ${eyebrow}`}>초대의 말</p>
            <span
              aria-hidden="true"
              className="invite-rise mt-7 block text-[44px] leading-[0.9] text-line lg:mt-11 lg:text-[72px]"
            >
              &ldquo;
            </span>
            <blockquote
              className={`invite-rise max-w-[22em] text-[21px] leading-[1.78] tracking-[-0.025em] lg:text-[32px] lg:leading-[1.7] ${userText}`}
            >
              {data.greeting}
            </blockquote>
            <p className="invite-rise mt-5 text-[11px] tracking-[0.1em] text-muted lg:mt-7 lg:text-[13px]">
              {data.inviterName} · 모임을 여는 사람
            </p>
          </>
        );
      case 'description':
        return (
          <>
            <span aria-hidden="true" className="invite-rise mb-[22px] block h-px w-[26px] bg-ink lg:mb-7 lg:w-9" />
            <p className={`invite-rise ${eyebrow}`}>모임 소개</p>
            <p
              className={`invite-rise mt-7 max-w-[30em] text-[16.5px] font-light leading-[1.9] text-muted-2 lg:mt-11 lg:text-[22px] ${userText}`}
            >
              {data.description}
            </p>
          </>
        );
      case 'poem':
        return (
          <p className={`invite-rise ${poem}`}>
            혼자 읽으면 <strong className="font-medium">밑줄</strong>로 남고,
            <br />
            함께 읽으면 <strong className="font-medium">이야기</strong>로 남아요.
          </p>
        );
      case 'shelf':
        return (
          <h2 className={`invite-rise ${heading}`}>
            {name}에서는
            <br />
            다양한 작품들을 <br className="lg:hidden" />
            함께 나누고 있어요.
          </h2>
        );
      case 'members':
        return (
          <>
            <h2 className={`invite-rise ${heading}`}>
              여러 멤버들이
              <br />
              당신을 기다리고 있어요.
            </h2>
            <ul className="invite-rise mt-7 flex max-w-[760px] flex-wrap justify-center gap-[7px] lg:mt-11 lg:gap-3">
              {data.memberNames.map((member, i) => (
                <li key={`${member}-${i}`} className={chip}>
                  {member}
                </li>
              ))}
              {hiddenMembers > 0 && (
                <li className={`${chip} text-muted`}>외 {hiddenMembers}명</li>
              )}
            </ul>
          </>
        );
      case 'enter':
        return (
          <>
            <p className={`invite-rise ${poem}`}>
              당신의 문장이
              <br />
              여기 한 줄 비어 있어요.
            </p>
            <button
              type="button"
              onClick={enter}
              disabled={accept.isPending}
              className="invite-rise mt-7 inline-flex h-[52px] items-center justify-center rounded-ui bg-surface px-[34px] text-[15px] font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-accent disabled:opacity-60 lg:mt-11 lg:h-[62px] lg:px-[52px] lg:text-[17px]"
            >
              {accept.isPending ? '입장하는 중…' : '입장하기'}
            </button>
            {accept.isError ? (
              <p className="mt-4 text-xs opacity-70">입장하지 못했어요. 초대가 만료됐을 수 있어요.</p>
            ) : (
              !isAuthenticated && (
                <p className="mt-4 text-xs opacity-60">로그인하면 바로 입장돼요.</p>
              )
            )}
          </>
        );
    }
  };

  return (
    <main
      ref={deckRef}
      tabIndex={-1}
      className="h-dvh snap-y snap-mandatory overflow-y-auto overscroll-none outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {slides.map((kind, i) => (
        <Slide
          key={kind}
          index={i}
          total={slides.length}
          inverted={INVERTED.has(kind)}
          footer={
            kind === 'shelf' ? (
              <InviteShelf />
            ) : i === 0 ? (
              <ScrollHint />
            ) : undefined
          }
        >
          {body(kind)}
        </Slide>
      ))}
    </main>
  );
}

const chip =
  'rounded-full border border-line px-[15px] py-[7px] text-[13.5px] font-medium lg:px-[26px] lg:py-3 lg:text-lg';

function Slide({
  index,
  total,
  inverted,
  footer,
  children,
}: {
  index: number;
  total: number;
  inverted: boolean;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={`relative flex h-dvh snap-start snap-always flex-col items-center px-[34px] text-center lg:px-[120px] ${
        inverted ? 'bg-point text-on-accent' : 'bg-paper text-ink'
      }`}
    >
      {/* 흰 장에만 진행 막대와 번호 — 반전된 장은 비워 둔다 */}
      {!inverted && (
        <>
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-line lg:h-[3px]" />
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-0.5 bg-ink lg:h-[3px]"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
          <p
            aria-hidden="true"
            className="absolute inset-x-0 top-[30px] font-mono text-[11px] font-semibold tracking-[0.1em] lg:top-10 lg:text-xs"
          >
            {String(index + 1).padStart(2, '0')}
          </p>
        </>
      )}
      <div className="flex w-full flex-1 flex-col items-center justify-center">{children}</div>
      {footer}
    </section>
  );
}

function ScrollHint() {
  return (
    <p className="absolute inset-x-0 bottom-[30px] text-[10.5px] tracking-[0.1em] text-muted lg:bottom-12 lg:text-xs">
      <span aria-hidden="true" className="mx-auto mb-2 block h-5 w-px bg-line lg:mb-2.5 lg:h-7" />
      스크롤
    </p>
  );
}

/** 랜딩 서가와 같은 책등·선반. 좁은 화면에서는 한 줄에 들어가는 만큼만 꽂는다 */
function InviteShelf() {
  const books = SHELF_BOOKS.slice(0, SHELF_DESKTOP);
  const shelfRef = useShelfFonts(books.map((b) => b.title));

  // 모바일에선 슬라이드 좌우 여백을 넘어 화면 폭을 쓴다 — 책 7권이 한 줄에 들어가도록
  return (
    <div
      ref={shelfRef}
      className="invite-rise -mx-[34px] w-[calc(100%+68px)] px-4 pb-10 lg:mx-0 lg:w-full lg:max-w-[1100px] lg:px-0 lg:pb-[72px]"
    >
      <div className="flex items-end justify-center gap-1.5 overflow-hidden">
        {books.map((book, i) => (
          <div
            key={book.title}
            className={i >= SHELF_MOBILE ? 'hidden shrink-0 lg:block' : 'shrink-0'}
          >
            <ShowcaseSpine book={book} index={i} />
          </div>
        ))}
      </div>
      <ShelfBoard />
    </div>
  );
}

function StatusScreen({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-[34px] text-center text-ink">
      {children}
    </main>
  );
}

function HomeLink({ isAuthenticated }: { isAuthenticated: boolean }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(isAuthenticated ? '/orgs' : '/')}
      className="mt-8 text-sm font-medium text-ink underline underline-offset-4"
    >
      {isAuthenticated ? '내 오가니제이션으로' : 'INOS 둘러보기'}
    </button>
  );
}
