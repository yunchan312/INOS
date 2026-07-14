import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/Footer";

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
    <div className="min-h-dvh flex flex-col pt-safe">
      <main className="flex-1 w-full max-w-270 mx-auto px-6 grid grid-rows-[auto_1fr]">
        <div className="border-b-2 border-ink py-5 flex justify-between items-baseline">
          <span className="text-xl font-extrabold">INOS</span>
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted whitespace-nowrap">
            Invitation only
          </span>
        </div>

        <div className="flex flex-col justify-center py-12 page-enter">
          <div className="bg-point px-[clamp(24px,5vw,56px)] py-[clamp(32px,6vw,72px)] border-2 border-b-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              초대받은 사람들만의, 조용한 인문학 모임 공간
            </p>
            <h1 className="mt-5 text-[clamp(36px,7vw,72px)] font-extrabold leading-[1.05] tracking-tight">
              함께 읽고,
              <br />
              보고, 생각합니다.
            </h1>
          </div>
          <div className="border-2 border-ink border-t-0 bg-paper px-[clamp(24px,5vw,56px)] py-[clamp(24px,4vw,40px)] flex flex-col gap-4">
            <p className="text-[15px] leading-relaxed text-muted-2 max-w-[52ch]">
              일정 조율과 발제문 준비는 자동으로. 모임에서는 대화에만
              집중하도록.
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-between gap-4 w-full max-w-90 min-h-13 px-5 bg-ink text-paper font-semibold text-[15px] tracking-tight cursor-pointer hover:bg-muted-2 transition-colors"
            >
              <span className="whitespace-nowrap">Google 로 계속하기</span>
              <span aria-hidden="true">→</span>
            </button>
            <p className="text-xs text-muted">
              초대받은 오가니제이션에만 접근할 수 있어요.
            </p>
          </div>
        </div>
      </main>
      <Footer wide />
    </div>
  );
}
