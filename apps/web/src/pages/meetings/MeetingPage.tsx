import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type {
  CreateCustomPromptDto,
  DiscussionImpressionDto,
  DiscussionNoteDto,
  DiscussionStreamEvent,
  MeetingDto,
  PromptKind,
} from '@inos/types';
import { useAuth } from '@/hooks/useAuth';
import { useMeeting } from '@/hooks/useMeeting';
import { useDiscussion } from '@/hooks/useDiscussion';
import { useDiscussionNotes } from '@/hooks/useDiscussionNotes';
import { useUpsertNote } from '@/hooks/useUpsertNote';
import { useFinishMeeting } from '@/hooks/useFinishMeeting';
import { useNotesSocket } from '@/hooks/useNotesSocket';
import { useAddCustomPrompt, useCustomPrompts } from '@/hooks/useCustomPrompts';
import { useImpressions, useUpsertImpression } from '@/hooks/useImpressions';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { PromptCard } from '@/components/PromptCard';
import { discussionApi } from '@/api/endpoints/discussion';
import { useQueryClient } from '@tanstack/react-query';

interface Prompts {
  book: string[];
  movie: string[];
}

// 자체 발제하기 폼 — 작품 선택(드롭다운) + 질문 입력
function CustomPromptForm({
  meeting,
  onSubmit,
  isPending,
  isError,
}: {
  meeting: MeetingDto;
  onSubmit: (dto: CreateCustomPromptDto, reset: () => void) => void;
  isPending: boolean;
  isError: boolean;
}) {
  const kinds: { kind: PromptKind; label: string }[] = [
    ...(meeting.bookTitle
      ? [{ kind: 'BOOK' as const, label: `📖 ${meeting.bookTitle}` }]
      : []),
    ...(meeting.movieTitle
      ? [{ kind: 'MOVIE' as const, label: `🎬 ${meeting.movieTitle}` }]
      : []),
  ];
  const [kind, setKind] = useState<PromptKind>(kinds[0]?.kind ?? 'BOOK');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({ promptKind: kind, content: content.trim() }, () => setContent(''));
  };

  return (
    <section className="mt-10 border-2 border-ink bg-surface p-5">
      <p className="text-sm font-extrabold">자체 발제하기</p>
      <p className="mt-1 text-xs text-muted">
        나누고 싶은 질문을 직접 추가해보세요. 작품 아래에 내 이름과 함께 실려요.
      </p>

      <div className="mt-4">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          작품 선택
        </label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as PromptKind)}
          className="input-underline w-full sm:w-64 text-sm"
          aria-label="작품 선택"
        >
          {kinds.map((k) => (
            <option key={k.kind} value={k.kind}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          발제문
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 500))}
          maxLength={500}
          rows={3}
          placeholder="나누고 싶은 발제 질문을 적어보세요"
          className="w-full box-border resize-y border-2 border-ink bg-surface-2 px-3.5 py-3 text-sm leading-relaxed outline-none focus:border-point-hover"
        />
        <p className="mt-1 text-right text-[11px] text-muted">{content.length}/500</p>
      </div>

      {isError && (
        <p className="mt-2 text-xs text-danger">추가에 실패했어요. 다시 시도해주세요.</p>
      )}

      <div className="mt-4">
        <Button
          variant="primary"
          size="sm"
          loading={isPending}
          disabled={!content.trim() || kinds.length === 0}
          onClick={handleSubmit}
        >
          발제 추가
        </Button>
      </div>
    </section>
  );
}

// 페이지 최하단 — 사용자별 작품 감상 (선택 사항)
function ImpressionSection({
  impressions,
  myUserId,
  onSave,
  isPending,
  isError,
}: {
  impressions: DiscussionImpressionDto[];
  myUserId: string | undefined;
  onSave: (content: string) => void;
  isPending: boolean;
  isError: boolean;
}) {
  const mine = impressions.find((i) => i.userId === myUserId);
  const [content, setContent] = useState(mine?.content ?? '');

  useEffect(() => {
    setContent(mine?.content ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine?.updatedAt]);

  const others = impressions.filter((i) => i.userId !== myUserId);
  const unchanged = content.trim() === (mine?.content ?? '');

  return (
    <section className="mt-12 border-t-2 border-ink pt-8 pb-10">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
        작품 감상 <span className="normal-case tracking-normal">· 선택</span>
      </h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, 2000))}
        placeholder="모임을 마친 소감이나 작품에 대한 감상을 자유롭게 남겨보세요."
        rows={3}
        className="mt-3 w-full box-border resize-y border-2 border-ink bg-surface px-3.5 py-3 text-sm leading-relaxed outline-none focus:border-point-hover"
      />
      <div className="mt-2 flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          loading={isPending}
          disabled={unchanged}
          onClick={() => onSave(content)}
        >
          {mine && !content.trim() ? '감상 삭제' : '감상 저장'}
        </Button>
        {mine && unchanged && <span className="text-xs text-muted">저장됨</span>}
        {isError && (
          <span className="text-xs text-danger">저장에 실패했어요.</span>
        )}
      </div>

      {others.length > 0 && (
        <div className="mt-6 flex flex-col gap-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            멤버 감상
          </p>
          {others.map((i) => (
            <div key={i.userId} className="border-l-4 border-point bg-point/15 px-4 py-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{i.content}</p>
              <p className="mt-2 text-xs font-semibold text-muted-2">{i.nickname}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function MeetingPage() {
  const { orgId, meetingId } = useParams<{ orgId: string; meetingId: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const meetingQuery = useMeeting(orgId, meetingId);
  const discussionQuery = useDiscussion(meetingId);
  const notesQuery = useDiscussionNotes(meetingId);
  const upsertNote = useUpsertNote(meetingId);
  const finishMeeting = useFinishMeeting(orgId, meetingId);
  const customPromptsQuery = useCustomPrompts(meetingId, !!discussionQuery.data);
  const addCustomPrompt = useAddCustomPrompt(meetingId);
  const impressionsQuery = useImpressions(orgId, meetingId, !!discussionQuery.data);
  const upsertImpression = useUpsertImpression(orgId, meetingId);

  const [streamedPrompts, setStreamedPrompts] = useState<Prompts>({ book: [], movie: [] });
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamDone, setStreamDone] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const meeting = meetingQuery.data;
  const discussion = discussionQuery.data;
  const notes: DiscussionNoteDto[] = notesQuery.data ?? [];

  const readOnly = meeting?.status === 'DONE';

  // 노트 작성은 모임 당일에만 (로컬 날짜 기준) — 열람은 항상 가능
  const todayStr = new Date().toLocaleDateString('en-CA');
  const meetingDayStr = meeting?.confirmedDate
    ? new Date(meeting.confirmedDate).toLocaleDateString('en-CA')
    : null;
  const notesLocked =
    !readOnly && (!meetingDayStr || todayStr !== meetingDayStr);

  // 종료 전 모임에서만 노트/종료 실시간 동기화
  useNotesSocket(meetingId, orgId, !!meeting && !readOnly);

  const hasStoredPrompts =
    discussion?.status === 'GENERATED' &&
    ((discussion.bookPrompts?.length ?? 0) > 0 ||
      (discussion.moviePrompts?.length ?? 0) > 0);

  const prompts: Prompts = hasStoredPrompts
    ? {
        book: discussion.bookPrompts ?? [],
        movie: discussion.moviePrompts ?? [],
      }
    : streamedPrompts;

  const shouldStream =
    !discussionQuery.isLoading &&
    !hasStoredPrompts &&
    !streamDone &&
    !!meetingId;

  useEffect(() => {
    if (!shouldStream || isStreaming) return;

    setIsStreaming(true);
    const url = discussionApi.sseUrl(meetingId!);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    const localPrompts: Prompts = { book: [], movie: [] };
    es.onmessage = (e: MessageEvent<string>) => {
      try {
        const event = JSON.parse(e.data) as DiscussionStreamEvent;
        if (event.type === 'section-start') {
          // section started
        } else if (event.type === 'section-end') {
          if (event.section === 'BOOK') localPrompts.book = event.prompts;
          else localPrompts.movie = event.prompts;
          setStreamedPrompts({ ...localPrompts });
        } else if (event.type === 'done') {
          setStreamDone(true);
          setIsStreaming(false);
          es.close();
          void queryClient.invalidateQueries({ queryKey: ['discussion', meetingId] });
          void queryClient.invalidateQueries({ queryKey: ['discussion-notes', meetingId] });
        } else if (event.type === 'error') {
          setIsStreaming(false);
          setStreamError(true);
          es.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setIsStreaming(false);
      es.close();
    };

    return () => {
      es.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStream, meetingId]);

  const handleSave = useCallback(
    (dto: { promptKind: PromptKind; questionIndex: number; content: string; isPublic: boolean }) => {
      upsertNote.mutate(dto);
    },
    [upsertNote],
  );

  const handleFinish = () => {
    finishMeeting.mutate(undefined, {
      onSuccess: () => navigate(`/orgs/${orgId}`),
    });
  };

  const notesByKey = (kind: PromptKind, idx: number) => ({
    myNote: notes.find((n) => n.promptKind === kind && n.questionIndex === idx && n.userId === user?.id),
    publicNotes: notes.filter((n) => n.promptKind === kind && n.questionIndex === idx && n.isPublic),
  });

  if (meetingQuery.isLoading) {
    return (
      <div className="min-h-dvh bg-paper">
        <Header />
        <main className="mx-auto max-w-3xl px-6 pt-10 pb-nav-safe page-enter space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </main>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-dvh bg-paper flex flex-col">
        <Header />
        <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
          <EmptyState
            title="모임을 찾을 수 없어요"
            action={
              <Button variant="ghost" onClick={() => navigate(`/orgs/${orgId}`)}>
                돌아가기
              </Button>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  const label =
    meeting.bookTitle && meeting.movieTitle
      ? `${meeting.bookTitle} · ${meeting.movieTitle}`
      : meeting.bookTitle ?? meeting.movieTitle ?? '모임';

  const customPrompts = customPromptsQuery.data ?? [];
  const customBook = customPrompts.filter((p) => p.promptKind === 'BOOK');
  const customMovie = customPrompts.filter((p) => p.promptKind === 'MOVIE');

  // 자체 발제 노트는 AI 문항과 충돌하지 않도록 questionIndex 100번대 사용 (작품별 등록순)
  const customBadge = (nickname: string) => (
    <span className="mb-2 flex items-center gap-2">
      <span className="border-2 border-ink bg-point px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-on-accent">
        자체 발제문
      </span>
      <span className="text-xs font-semibold text-muted">{nickname}</span>
    </span>
  );

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        <Link
          to={`/orgs/${orgId}`}
          className="text-[13px] font-medium text-muted hover:text-ink"
        >
          ← 오가니제이션으로
        </Link>

        <div className="mt-6 pb-7 border-b-2 border-ink">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {readOnly ? '종료된 모임' : '모임'}
            {meeting.location && ` · ${meeting.location}`}
          </p>
          <h1 className="mt-3 text-[clamp(30px,5vw,52px)] font-extrabold leading-[1.1] tracking-tight">
            {label}
          </h1>
        </div>

        {(isStreaming || (!hasStoredPrompts && !streamDone && discussionQuery.isLoading)) && (
          <div className="mt-6 border-2 border-ink bg-surface px-4">
            <div className="flex items-center gap-3 py-4">
              <div className="w-5 h-5 rounded-full border-2 border-line border-t-ink animate-spin shrink-0" />
              <p className="text-sm font-medium">AI가 발제 질문을 생성하고 있어요…</p>
            </div>
          </div>
        )}

        {(streamError ||
          (streamDone && prompts.book.length === 0 && prompts.movie.length === 0)) && (
          <div className="mt-6">
            <EmptyState
              title="발제 질문을 만들지 못했어요"
              description="책/영화 제목과 작가·감독 정보가 정확한지 확인해주세요. 정보가 부정확하면 AI가 작품을 특정하지 못해요."
            />
          </div>
        )}

        {notesLocked && (prompts.book.length > 0 || prompts.movie.length > 0) && (
          <div className="mt-6 border-2 border-ink bg-surface px-4 py-3">
            <p className="text-sm">
              발제 질문을 미리 읽어보세요. 노트 작성은{' '}
              <span className="font-bold">모임 당일에만</span> 가능해요.
            </p>
          </div>
        )}

        {(prompts.book.length > 0 || customBook.length > 0) && (
          <section className="mt-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted mb-1">
              📖 {meeting.bookTitle}
            </h2>
            <div>
              {prompts.book.map((q, i) => {
                const { myNote, publicNotes } = notesByKey('BOOK', i);
                return (
                  <PromptCard
                    key={`book-${i}`}
                    prompt={q}
                    promptKind="BOOK"
                    questionIndex={i}
                    myNote={myNote}
                    publicNotes={publicNotes}
                    readOnly={readOnly || notesLocked}
                    onSave={handleSave}
                  />
                );
              })}
              {customBook.map((cp, i) => {
                const idx = 100 + i;
                const { myNote, publicNotes } = notesByKey('BOOK', idx);
                return (
                  <PromptCard
                    key={cp.id}
                    prompt={cp.content}
                    promptKind="BOOK"
                    questionIndex={idx}
                    displayNumber={prompts.book.length + i + 1}
                    meta={customBadge(cp.authorNickname)}
                    myNote={myNote}
                    publicNotes={publicNotes}
                    readOnly={readOnly || notesLocked}
                    onSave={handleSave}
                  />
                );
              })}
            </div>
          </section>
        )}

        {(prompts.movie.length > 0 || customMovie.length > 0) && (
          <section className="mt-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted mb-1">
              🎬 {meeting.movieTitle}
            </h2>
            <div>
              {prompts.movie.map((q, i) => {
                const { myNote, publicNotes } = notesByKey('MOVIE', i);
                return (
                  <PromptCard
                    key={`movie-${i}`}
                    prompt={q}
                    promptKind="MOVIE"
                    questionIndex={i}
                    myNote={myNote}
                    publicNotes={publicNotes}
                    readOnly={readOnly || notesLocked}
                    onSave={handleSave}
                  />
                );
              })}
              {customMovie.map((cp, i) => {
                const idx = 100 + i;
                const { myNote, publicNotes } = notesByKey('MOVIE', idx);
                return (
                  <PromptCard
                    key={cp.id}
                    prompt={cp.content}
                    promptKind="MOVIE"
                    questionIndex={idx}
                    displayNumber={prompts.movie.length + i + 1}
                    meta={customBadge(cp.authorNickname)}
                    myNote={myNote}
                    publicNotes={publicNotes}
                    readOnly={readOnly || notesLocked}
                    onSave={handleSave}
                  />
                );
              })}
            </div>
          </section>
        )}

        {!readOnly &&
          !!discussionQuery.data &&
          (prompts.book.length > 0 || prompts.movie.length > 0) && (
            <CustomPromptForm
              meeting={meeting}
              isPending={addCustomPrompt.isPending}
              isError={addCustomPrompt.isError}
              onSubmit={(dto, reset) =>
                addCustomPrompt.mutate(dto, { onSuccess: reset })
              }
            />
          )}

        {!readOnly && !notesLocked && (prompts.book.length > 0 || prompts.movie.length > 0) && (
          <div className="mt-10 flex justify-start">
            <Button
              variant="outline"
              size="lg"
              loading={finishMeeting.isPending}
              onClick={handleFinish}
            >
              모임 종료
            </Button>
          </div>
        )}

        {!!discussionQuery.data && (
          <ImpressionSection
            impressions={impressionsQuery.data ?? []}
            myUserId={user?.id}
            isPending={upsertImpression.isPending}
            isError={upsertImpression.isError}
            onSave={(content) => upsertImpression.mutate(content)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
