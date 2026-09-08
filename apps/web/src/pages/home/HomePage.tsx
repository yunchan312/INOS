import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/Footer';
import { ShelfShowcase } from './ShelfShowcase';
import mascotFace from '@/assets/character-mascot.png';
import inoHero from '@/assets/ino-hero.webp';

const MARQUEE_WORDS = [
  '성찰하지 않는 삶은 살 가치가 없다 — 소크라테스',
  '인간은 생각하는 갈대다 — 파스칼',
  '책 없는 방은 영혼 없는 육체와 같다 — 키케로',
  '내 언어의 한계는 내 세계의 한계다 — 비트겐슈타인',
  '아는 것을 안다 하고 모르는 것을 모른다 하는 것, 그것이 앎이다 — 공자',
];

const PAINS = [
  {
    num: '01',
    title: '단톡방 20분, 날짜 못 정함',
    body: '"저는 화요일 빼고 다 돼요"가 12명. 결국 아무도 안 되는 날로 정해져요.',
  },
  {
    num: '02',
    title: '발제 준비는 늘 한 사람 몫',
    body: '매번 같은 사람이 밤새 질문을 만들어요. 그 사람이 지치면 모임이 끝나요.',
  },
  {
    num: '03',
    title: '지난 모임은 휘발',
    body: '함께 읽은 책과 나눈 말들이 채팅 스크롤 속으로 사라져요.',
  },
];

const STEPS = [
  {
    num: '1',
    title: '작품을 정해요',
    body: '이번엔 책, 다음엔 영화. 제목만 올리면 준비 끝.',
  },
  {
    num: '2',
    title: '날짜가 조율돼요',
    body: '멤버 전원이 가능한 날을 고르면 자동으로 확정. 안 겹치면 알려드려요.',
  },
  {
    num: '3',
    title: '발제 질문이 도착해요',
    body: 'AI가 작품에 맞는 발제 질문 초안을 만들어요. 다듬기만 하면 돼요.',
  },
  {
    num: '4',
    title: '기록이 쌓여요',
    body: '별점·한줄평과 함께 우리만의 서가가 만들어져요.',
  },
];

const FEATURES = [
  {
    tag: 'Schedule',
    title: '일정 자동 조율',
    body: '각자 시간 선택, 전원 응답 시 자동 확정. 단톡방 투표는 이제 그만.',
  },
  {
    tag: 'AI Discussion',
    title: 'AI 발제문',
    body: '작품이 정해지면 발제 질문 초안이 자동 생성. 수정하고 공개 시점도 조절해요.',
  },
  {
    tag: 'Private',
    title: '초대제 · 폐쇄형',
    body: '편한 사람들과 깊은 대화. 초대장을 받은 사람만 조용히 들어와요.',
  },
  {
    tag: 'Archive',
    title: '모임 노트 · 라이브러리',
    body: '각자의 생각과 별점·한줄평이 모임의 서가로 남아요.',
  },
];

const DEMO_PEOPLE = [
  { name: '김서연', width: 95 },
  { name: '박지훈', width: 80 },
  { name: '이수민', width: 90 },
  { name: '정도윤', width: 70 },
];

// 스크롤 진입 시 살짝 떠오르는 리빌 래퍼
function Reveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {children}
    </div>
  );
}

// 시간 조율 데모 — 1초마다 한 명씩 응답, 전원 응답 시 확정
function LiveDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 6), 1000);
    return () => clearInterval(id);
  }, []);

  const allDone = tick >= 4;

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        {DEMO_PEOPLE.map((p, i) => {
          const done = tick > i;
          return (
            <div key={p.name} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[13px] font-medium whitespace-nowrap">
                {p.name}
              </span>
              <div className="relative h-[22px] flex-1 overflow-hidden rounded-hair border border-line bg-paper">
                <div
                  className="absolute inset-y-0 left-0 bg-point transition-[width] duration-500"
                  style={{ width: done ? `${p.width}%` : '0%' }}
                />
              </div>
              {done ? (
                <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-hair bg-point text-[11px] font-bold text-on-accent animate-[tick-pop_400ms_ease-out]">
                  ✓
                </span>
              ) : (
                <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-hair border border-dashed border-line text-[11px] text-muted">
                  ·
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-right text-xs font-medium tabular-nums text-muted">
        {allDone ? '2026.07.29 수요일로 확정' : `${Math.min(tick, 4)}/4명 응답 중…`}
      </p>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/orgs', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      {/* 네비 */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm pt-safe">
        <div className="mx-auto flex h-[60px] max-w-[1080px] items-center justify-between px-6">
          <span className="flex items-baseline gap-2.5">
            <span className="text-xl font-extrabold tracking-[-0.045em]">
              INOS
            </span>
            <span className="text-[11px] font-medium tracking-[0.14em] text-muted whitespace-nowrap">
              인문학의 OS
            </span>
          </span>
          <Link
            to="/login"
            className="flex min-h-10 items-center rounded-ui bg-point px-4 text-[13px] font-semibold text-on-accent whitespace-nowrap transition-colors hover:bg-point-hover"
          >
            로그인하기
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* 히어로 */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-end gap-8 px-6 pt-16 md:grid-cols-2">
            <div className="pb-16 page-enter">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted whitespace-nowrap">
                초대받은 사람들만의 공간
              </p>
              <h1 className="mt-5 text-[clamp(38px,6vw,64px)] font-bold leading-[1.08] tracking-[-0.045em] break-keep">
                조용한
                <br />
                인문학 모임의
                <br />
                <span className="box-decoration-clone rounded-hair bg-point px-2.5 text-on-accent">
                  운영체제
                </span>
              </h1>
              <p className="mt-6 max-w-[42ch] text-[15px] leading-[1.75] font-light text-muted-2 break-keep">
                일정 조율과 발제문 준비는 자동으로. 모임에서는 대화에만
                집중하도록.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                <Link
                  to="/login"
                  className="flex min-h-13 items-center gap-3 rounded-ui bg-point px-6 text-[15px] font-semibold text-on-accent whitespace-nowrap transition-colors hover:bg-point-hover"
                >
                  로그인하기
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href="#how"
                  className="flex min-h-13 items-center rounded-ui border border-line px-6 text-[15px] font-medium whitespace-nowrap transition-colors hover:border-ink hover:bg-surface-2"
                >
                  어떻게 동작하나요
                </a>
              </div>
              <p className="mt-5 text-xs font-light leading-relaxed text-muted break-keep">
                구글 계정 또는 이메일로 시작할 수 있어요 · 초대장이나 초대 링크가
                있어야 모임에 들어갈 수 있어요
              </p>
            </div>

            {/* 마스코트 INOS */}
            <div className="flex items-end justify-center pt-6">
              <div className="relative w-[min(420px,96%)]">
                <img
                  src={inoHero}
                  alt="빨간 안경을 쓰고 쇼파에서 TV를 틀어놓고 책을 읽는 INOS"
                  className="block w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 마퀴 */}
        <div className="overflow-hidden border-b border-line bg-point">
          <div className="flex w-max animate-[marquee_22s_linear_infinite] py-3 motion-reduce:animate-none">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
              <span
                key={`${w}-${i}`}
                className="flex items-center px-5 text-[12px] font-medium tracking-[0.02em] text-on-accent whitespace-nowrap after:ml-5 after:h-3 after:w-px after:bg-on-accent/25 after:content-['']"
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* 01 · 왜 만들었나 */}
        <section className="border-b border-line">
          <Reveal className="mx-auto max-w-[1080px] px-6 py-[72px]">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">
              01 · 왜 만들었나
            </p>
            <h2 className="mt-4 max-w-[24ch] text-[clamp(26px,4vw,40px)] font-bold leading-[1.18] tracking-[-0.035em] break-keep">
              모임은 좋은데, 모임{' '}
              <span className="underline decoration-2 underline-offset-[6px]">
                준비
              </span>
              가 싫었어요
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PAINS.map((p) => (
                <div
                  key={p.num}
                  className="rounded-card border border-line bg-surface px-6 py-7"
                >
                  <p className="text-[11px] font-semibold tabular-nums tracking-[0.16em] text-muted">
                    {p.num}
                  </p>
                  <p className="mt-4 text-[17px] font-bold tracking-[-0.02em] break-keep">
                    {p.title}
                  </p>
                  <p className="mt-2.5 text-sm leading-[1.75] font-light text-muted break-keep">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 02 · 어떻게 동작하나 */}
        <section id="how" className="border-b border-line bg-surface">
          <Reveal className="mx-auto max-w-[1080px] px-6 py-[72px]">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">
              02 · 어떻게 동작하나
            </p>
            <h2 className="mt-4 text-[clamp(26px,4vw,40px)] font-bold leading-[1.18] tracking-[-0.035em] break-keep">
              작품만 정하면, 나머지는 INOS가
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((st) => (
                <div key={st.num}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui bg-point text-[14px] font-bold text-on-accent">
                      {st.num}
                    </span>
                    <div className="h-px flex-1 bg-line" />
                  </div>
                  <p className="mt-5 text-[17px] font-bold tracking-[-0.02em] break-keep">
                    {st.title}
                  </p>
                  <p className="mt-2.5 text-sm leading-[1.75] font-light text-muted break-keep">
                    {st.body}
                  </p>
                </div>
              ))}
            </div>

            {/* 조율 라이브 데모 */}
            <div className="mt-12 grid grid-cols-1 items-center gap-8 rounded-card border border-line bg-paper p-7 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted">
                  라이브 데모
                </p>
                <p className="mt-3 text-xl font-bold tracking-[-0.03em] break-keep">
                  전원이 응답하면 날짜가 저절로 확정돼요
                </p>
                <p className="mt-2.5 text-sm leading-[1.75] font-light text-muted break-keep">
                  when2meet 스타일 조율. 겹치는 날이 없으면 소유자에게
                  알려드려요.
                </p>
              </div>
              <LiveDemo />
            </div>
          </Reveal>
        </section>

        {/* 03 · 서가 */}
        <section className="border-b border-line">
          <Reveal className="mx-auto max-w-[1080px] px-6 py-[72px]">
            <ShelfShowcase />
          </Reveal>
        </section>

        {/* 04 · 안에 있는 것 */}
        <section className="border-b border-line bg-surface">
          <Reveal className="mx-auto max-w-[1080px] px-6 py-[72px]">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">
              04 · 안에 있는 것
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {FEATURES.map((f) => (
                <div
                  key={f.tag}
                  className="rounded-card border border-line bg-paper px-6 py-7 transition-colors hover:border-muted-2"
                >
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-muted whitespace-nowrap">
                    {f.tag.toUpperCase()}
                  </p>
                  <p className="mt-4 text-[19px] font-bold tracking-[-0.025em] break-keep">
                    {f.title}
                  </p>
                  <p className="mt-2.5 text-sm leading-[1.75] font-light text-muted-2 break-keep">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 05 · 시작하기 */}
        <section className="bg-ink text-paper">
          <Reveal className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-10 px-6 py-[88px] md:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-paper/55">
                05 · 시작하기
              </p>
              <h2 className="mt-4 text-[clamp(30px,5vw,52px)] font-bold leading-[1.1] tracking-[-0.045em] break-keep">
                준비는 INOS에게,
                <br />
                당신은{' '}
                <span className="underline decoration-2 underline-offset-[8px]">
                  대화
                </span>
                에
              </h2>
              <div className="mt-9 flex flex-wrap gap-2.5">
                <Link
                  to="/login"
                  className="flex min-h-13 items-center gap-3 rounded-ui bg-paper px-6 text-[15px] font-semibold text-ink whitespace-nowrap transition-opacity hover:opacity-85"
                >
                  로그인하기
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
              <p className="mt-5 text-xs font-light leading-relaxed text-paper/55 break-keep">
                초대장이 없다면 — 모임을 직접 만들고 싶은 분은 로그인 후 생성
                신청을 남겨주세요.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex aspect-square w-[min(260px,70%)] items-center justify-center rounded-card bg-paper">
                <img src={mascotFace} alt="INOS 얼굴" className="block w-[70%]" />
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer wide />
    </div>
  );
}
