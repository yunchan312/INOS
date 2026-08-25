import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PromptKind } from "@inos/types";
import { useAuth } from "@/hooks/useAuth";
import { useMeeting } from "@/hooks/useMeeting";
import { useDiscussion } from "@/hooks/useDiscussion";
import { useCustomPrompts } from "@/hooks/useCustomPrompts";
import { Button } from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { PromptText } from "@/components/PromptText";

interface Slide {
  kind: PromptKind;
  workLabel: string;
  content: string;
  /** 자체 발제일 때 작성자 닉네임 */
  authorNickname?: string;
}

// 모임 진행용 전체화면 모드 — 발제 질문을 하나씩 크게 띄운다.
// 좌우 화살표/클릭으로 이동, ESC로 모임 페이지 복귀.
export default function PresentPage() {
  const { orgId, meetingId } = useParams<{
    orgId: string;
    meetingId: string;
  }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const meetingQuery = useMeeting(orgId, meetingId);
  const discussionQuery = useDiscussion(meetingId);
  const customPromptsQuery = useCustomPrompts(
    meetingId,
    !!discussionQuery.data,
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const meeting = meetingQuery.data;
  const discussion = discussionQuery.data;
  const customPrompts = useMemo(
    () => customPromptsQuery.data ?? [],
    [customPromptsQuery.data],
  );

  // 책 → 영화 순, 각 작품 안에서는 AI 발제 뒤에 자체 발제
  const slides = useMemo<Slide[]>(() => {
    if (!meeting) return [];
    const build = (
      kind: PromptKind,
      title: string | null,
      aiPrompts: string[],
    ) => {
      if (!title) return [];
      const label = `${kind === "BOOK" ? "📖" : "🎬"} ${title}`;
      return [
        ...aiPrompts.map((content) => ({ kind, workLabel: label, content })),
        ...customPrompts
          .filter((cp) => cp.promptKind === kind)
          .map((cp) => ({
            kind,
            workLabel: label,
            content: cp.content,
            authorNickname: cp.authorNickname,
          })),
      ];
    };
    return [
      ...build("BOOK", meeting.bookTitle, discussion?.bookPrompts ?? []),
      ...build("MOVIE", meeting.movieTitle, discussion?.moviePrompts ?? []),
    ];
  }, [meeting, discussion, customPrompts]);

  const total = slides.length;
  const exit = useCallback(
    () => navigate(`/orgs/${orgId}/meetings/${meetingId}`),
    [navigate, orgId, meetingId],
  );
  const go = useCallback(
    (delta: number) =>
      setIndex((i) => Math.min(total - 1, Math.max(0, i + delta))),
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Escape") {
        exit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, exit]);

  if (meetingQuery.isLoading || discussionQuery.isLoading) {
    return (
      <div className="min-h-dvh bg-paper p-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-40" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="min-h-dvh bg-paper flex items-center justify-center px-6">
        <EmptyState
          title="띄울 발제 질문이 없어요"
          description="발제문이 생성된 뒤에 다시 시도해주세요."
          action={
            <Button variant="ghost" onClick={exit}>
              모임으로 돌아가기
            </Button>
          }
        />
      </div>
    );
  }

  const slide = slides[index];

  return (
    <div className="fixed inset-0 flex flex-col bg-paper">
      {/* 상단 바 — 작품명 · 진행도 · 닫기 */}
      <header className="flex items-center justify-between gap-4 border-b-2 border-ink px-6 py-3">
        <p className="min-w-0 truncate text-sm font-bold tracking-tight">
          {slide.workLabel}
        </p>
        <div className="flex items-center gap-4">
          <span className="text-md font-extrabold tabular-nums">
            {String(index + 1).padStart(2, "0")}
            <span className="text-muted">
              {" "}
              / {String(total).padStart(2, "0")}
            </span>
          </span>
          <button
            type="button"
            onClick={exit}
            className="text-xs font-semibold text-muted border-b border-muted hover:text-ink hover:border-ink"
          >
            닫기 (ESC)
          </button>
        </div>
      </header>

      {/* 질문 — 좌우 가장자리를 클릭하면 이전/다음 */}
      {/* 질문이 화면보다 길면 잘리지 않고 스크롤되도록 */}
      <div className="relative flex flex-1 overflow-y-auto">
        <button
          type="button"
          aria-label="이전 질문"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="absolute inset-y-0 left-0 z-10 w-1/4 cursor-w-resize disabled:cursor-default"
        />
        <button
          type="button"
          aria-label="다음 질문"
          onClick={() => go(1)}
          disabled={index === total - 1}
          className="absolute inset-y-0 right-0 z-10 w-1/4 cursor-e-resize disabled:cursor-default"
        />

        <div className="m-auto w-full max-w-300 px-8 py-10 sm:px-14">
          {slide.authorNickname && (
            <p className="mb-6 flex items-center gap-2">
              <span className="border-2 border-ink bg-point px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-on-accent">
                자체 발제문
              </span>
              <span className="text-xs font-semibold text-muted">
                {slide.authorNickname}
              </span>
            </p>
          )}
          <PromptText
            key={index}
            content={slide.content}
            className="mx-auto text-3xl font-normal leading-relaxed"
          />
        </div>
      </div>

      {/* 하단 — 진행 바 + 이동 버튼 */}
      <footer className="border-t-2 border-ink pb-safe">
        <div
          className="h-1.5 bg-point transition-[width] duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            className="flex min-h-10 items-center border-2 border-ink px-4 text-sm font-bold hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 이전
          </button>
          <span className="hidden text-xs text-muted sm:block">
            ← → 키 또는 화면 좌우를 눌러 이동해요
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === total - 1}
            className="flex min-h-10 items-center border-2 border-ink bg-point px-4 text-sm font-bold text-on-accent hover:bg-point-hover disabled:opacity-30 disabled:cursor-not-allowed"
          >
            다음 →
          </button>
        </div>
      </footer>
    </div>
  );
}
