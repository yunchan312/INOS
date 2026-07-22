import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/Footer";
import mascotFace from "@/assets/character-mascot.png";

const MARQUEE_WORDS = [
  "독서 모임",
  "영화 모임",
  "자동 일정 조율",
  "AI 발제 질문",
  "초대제",
  "광고 없음",
  "조용한 아카이브",
  "있어빌리티",
];

const PAINS = [
  {
    num: "①",
    title: "단톡방 20분, 날짜 못 정함",
    body: '"저는 화요일 빼고 다 돼요"가 12명. 결국 아무도 안 되는 날로 정해져요.',
  },
  {
    num: "②",
    title: "발제 준비는 늘 한 사람 몫",
    body: "매번 같은 사람이 밤새 질문을 만들어요. 그 사람이 지치면 모임이 끝나요.",
  },
  {
    num: "③",
    title: "지난 모임은 휘발",
    body: "함께 읽은 책과 나눈 말들이 채팅 스크롤 속으로 사라져요.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "작품을 정해요",
    body: "이번엔 책, 다음엔 영화. 제목만 올리면 준비 끝.",
  },
  {
    num: "2",
    title: "날짜가 조율돼요",
    body: "멤버 전원이 가능한 날을 고르면 자동으로 확정. 안 겹치면 알려드려요.",
  },
  {
    num: "3",
    title: "발제 질문이 도착해요",
    body: "AI가 작품에 맞는 발제 질문 초안을 만들어요. 다듬기만 하면 돼요.",
  },
  {
    num: "4",
    title: "기록이 쌓여요",
    body: "별점·한줄평과 함께 우리만의 서가가 만들어져요.",
  },
];

const FEATURES = [
  {
    tag: "Schedule",
    title: "일정 자동 조율",
    body: "when2meet식 선택, 전원 응답 시 자동 확정. 단톡방 투표는 이제 그만.",
  },
  {
    tag: "AI Discussion",
    title: "AI 발제문",
    body: "작품이 정해지면 발제 질문 초안이 자동 생성. 수정하고 공개 시점도 조절해요.",
  },
  {
    tag: "Private",
    title: "초대제 · 폐쇄형",
    body: "검색도 광고도 없어요. 초대장을 받은 사람만 조용히 들어와요.",
  },
  {
    tag: "Archive",
    title: "모임 노트 · 라이브러리",
    body: "각자의 생각과 별점·한줄평이 모임의 서가로 남아요.",
  },
];

const DEMO_PEOPLE = [
  { name: "김서연", width: 100 },
  { name: "박지훈", width: 80 },
  { name: "이수민", width: 90 },
  { name: "정도윤", width: 70 },
];

// 스크롤 진입 시 살짝 떠오르는 리빌 래퍼
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
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
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}

// when2meet식 조율 데모 — 1.4초마다 한 명씩 응답, 전원 응답 시 확정
function LiveDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 6), 1400);
    return () => clearInterval(id);
  }, []);

  const allDone = tick >= 4;

  return (
    <div>
      <div className="flex flex-col gap-2">
        {DEMO_PEOPLE.map((p, i) => {
          const done = tick > i;
          return (
            <div key={p.name} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[13px] font-semibold whitespace-nowrap">
                {p.name}
              </span>
              <div className="relative h-[26px] flex-1 overflow-hidden border-2 border-ink bg-paper">
                <div
                  className="absolute inset-y-0 left-0 bg-point transition-[width] duration-500"
                  style={{
                    width: done ? `${p.width}%` : "0%",
                    borderRight: done ? "2px solid var(--color-ink)" : undefined,
                  }}
                />
              </div>
              {done ? (
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center border-2 border-ink bg-point text-xs font-extrabold text-on-accent animate-[tick-pop_400ms_ease-out]">
                  ✓
                </span>
              ) : (
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center border-2 border-dashed border-line text-xs text-muted">
                  ·
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-right text-xs font-bold">
        {allDone ? "✓ 2026.07.29 수요일로 확정!" : `${Math.min(tick, 4)}/4명 응답 중…`}
      </p>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/orgs", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL ?? "/api";
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      {/* 네비 */}
      <header className="sticky top-0 z-40 bg-paper border-b-2 border-ink pt-safe">
        <div className="mx-auto flex h-[60px] max-w-[1080px] items-center justify-between px-6">
          <span className="flex items-baseline gap-2.5">
            <span className="text-xl font-extrabold tracking-tight">INOS</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted whitespace-nowrap">
              인문학의 OS
            </span>
          </span>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex min-h-10 items-center px-4 bg-ink text-paper text-[13px] font-semibold whitespace-nowrap cursor-pointer hover:bg-muted-2 transition-colors"
          >
            Google 로 계속하기
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* 히어로 */}
        <section className="border-b-2 border-ink">
          <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-end gap-8 px-6 pt-16 md:grid-cols-2">
            <div className="pb-16 page-enter">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted whitespace-nowrap">
                초대받은 사람들만의 공간
              </p>
              <h1 className="mt-4 text-[clamp(38px,6vw,64px)] font-black leading-[1.06] tracking-tight break-keep">
                조용한
                <br />
                인문학 모임의
                <br />
                <span className="bg-point px-2 text-on-accent box-decoration-clone">
                  운영체제
                </span>
              </h1>
              <p className="mt-5 max-w-[42ch] text-base leading-[1.7] text-muted-2 break-keep">
                일정 조율과 발제문 준비는 자동으로. 모임에서는 대화에만 집중하도록.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex min-h-13 items-center gap-3.5 border-2 border-ink bg-point px-[22px] text-[15px] font-bold text-on-accent whitespace-nowrap cursor-pointer hover:bg-point-hover transition-colors"
                >
                  Google 로 시작하기 →
                </button>
                <a
                  href="#how"
                  className="flex min-h-13 items-center border-2 border-ink px-[22px] text-[15px] font-semibold whitespace-nowrap hover:bg-ink/5 transition-colors"
                >
                  어떻게 동작하나요
                </a>
              </div>
              <p className="mt-4 text-xs text-muted">
                회원가입 없음 · 초대장이 있어야 모임에 들어갈 수 있어요
              </p>
            </div>

            {/* 마스코트 이노 */}
            <div className="flex items-end justify-center pt-6">
              <div className="relative w-[min(320px,80%)]">
                <img
                  src={mascotFace}
                  alt="빨간 안경에 노란 베레모를 쓴 이노"
                  className="block w-full"
                />
                <span className="absolute -left-2 top-0 inline-block -rotate-4 border-2 border-ink bg-surface px-3 py-2 text-xs font-bold whitespace-nowrap">
                  안녕! 나는 이노 <span aria-hidden="true">✱</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 마퀴 */}
        <div className="overflow-hidden border-b-2 border-ink bg-point">
          <div className="flex w-max animate-[marquee_22s_linear_infinite] py-3 motion-reduce:animate-none">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
              <span
                key={`${w}-${i}`}
                className="border-r-2 border-ink px-5 text-[13px] font-bold uppercase tracking-[0.12em] text-on-accent whitespace-nowrap"
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* 01 · 왜 만들었나 */}
        <section className="border-b-2 border-ink">
          <Reveal className="mx-auto max-w-[1080px] px-6 py-[72px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em]">01 · 왜 만들었나</p>
            <h2 className="mt-4 max-w-[24ch] text-[clamp(26px,4vw,40px)] font-extrabold leading-[1.2] tracking-tight break-keep">
              모임은 좋은데, 모임{" "}
              <span className="border-b-6 border-point">준비</span>가 싫었어요
            </h2>
            <div className="mt-9 grid grid-cols-1 gap-[2px] border-2 border-ink bg-ink sm:grid-cols-3">
              {PAINS.map((p) => (
                <div key={p.num} className="bg-paper px-6 py-7">
                  <p className="text-[28px] font-black text-muted">{p.num}</p>
                  <p className="mt-3 text-[17px] font-bold break-keep">{p.title}</p>
                  <p className="mt-2 text-sm leading-[1.7] text-muted break-keep">{p.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 02 · 어떻게 동작하나 */}
        <section id="how" className="border-b-2 border-ink bg-surface">
          <Reveal className="mx-auto max-w-[1080px] px-6 py-[72px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em]">
              02 · 어떻게 동작하나
            </p>
            <h2 className="mt-4 text-[clamp(26px,4vw,40px)] font-extrabold leading-[1.2] tracking-tight break-keep">
              작품만 정하면, 나머지는 이노가
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((st) => (
                <div key={st.num}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-ink bg-point text-[15px] font-extrabold text-on-accent">
                      {st.num}
                    </span>
                    <div className="h-0.5 flex-1 bg-ink" />
                  </div>
                  <p className="mt-4 text-[17px] font-bold break-keep">{st.title}</p>
                  <p className="mt-2 text-sm leading-[1.7] text-muted break-keep">{st.body}</p>
                </div>
              ))}
            </div>

            {/* 조율 라이브 데모 */}
            <div className="mt-12 grid grid-cols-1 items-center gap-7 border-2 border-ink bg-paper p-7 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                  라이브 데모
                </p>
                <p className="mt-2.5 text-xl font-extrabold break-keep">
                  전원이 응답하면 날짜가 저절로 확정돼요
                </p>
                <p className="mt-2 text-sm leading-[1.7] text-muted break-keep">
                  when2meet 스타일 조율. 겹치는 날이 없으면 소유자에게 알려드려요.
                </p>
              </div>
              <LiveDemo />
            </div>
          </Reveal>
        </section>

        {/* 03 · 안에 있는 것 */}
        <section className="border-b-2 border-ink">
          <Reveal className="mx-auto max-w-[1080px] px-6 py-[72px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em]">03 · 안에 있는 것</p>
            <div className="mt-8 grid grid-cols-1 gap-[2px] border-2 border-ink bg-ink md:grid-cols-2">
              {FEATURES.map((f) => (
                <div
                  key={f.tag}
                  className="bg-paper px-6 py-7 transition-colors hover:bg-surface"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted whitespace-nowrap">
                    {f.tag}
                  </p>
                  <p className="mt-3 text-[19px] font-extrabold break-keep">{f.title}</p>
                  <p className="mt-2 text-sm leading-[1.7] text-muted-2 break-keep">{f.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 04 · 시작하기 */}
        <section className="bg-ink text-paper">
          <Reveal className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-10 px-6 py-[88px] md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                04 · 시작하기
              </p>
              <h2 className="mt-4 text-[clamp(30px,5vw,52px)] font-black leading-[1.1] tracking-tight break-keep">
                준비는 이노에게,
                <br />
                당신은 <span className="text-point">대화</span>에
              </h2>
              <div className="mt-8 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex min-h-13 items-center gap-3.5 border-2 border-paper bg-point px-[22px] text-[15px] font-bold text-on-accent whitespace-nowrap cursor-pointer hover:bg-point-hover transition-colors"
                >
                  Google 로 시작하기 →
                </button>
              </div>
              <p className="mt-4 text-xs text-muted break-keep">
                초대장이 없다면 — 모임을 직접 만들고 싶은 분은 로그인 후 생성 신청을
                남겨주세요.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex aspect-square w-[min(260px,70%)] items-center justify-center border-2 border-paper bg-point">
                <img src={mascotFace} alt="이노 얼굴" className="block w-[78%]" />
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer wide />
    </div>
  );
}
