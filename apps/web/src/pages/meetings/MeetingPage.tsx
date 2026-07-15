import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { DiscussionNoteDto, DiscussionStreamEvent, PromptKind } from '@inos/types';
import { useAuth } from '@/hooks/useAuth';
import { useMeeting } from '@/hooks/useMeeting';
import { useDiscussion } from '@/hooks/useDiscussion';
import { useDiscussionNotes } from '@/hooks/useDiscussionNotes';
import { useUpsertNote } from '@/hooks/useUpsertNote';
import { useFinishMeeting } from '@/hooks/useFinishMeeting';
import { useNotesSocket } from '@/hooks/useNotesSocket';
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

  // 노트 작성은 모임 당일부터 (로컬 날짜 기준)
  const todayStr = new Date().toLocaleDateString('en-CA');
  const meetingDayStr = meeting?.confirmedDate
    ? new Date(meeting.confirmedDate).toLocaleDateString('en-CA')
    : null;
  const notesLocked = !readOnly && (!meetingDayStr || todayStr < meetingDayStr);

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
              <span className="font-bold">모임 당일부터</span> 가능해요.
            </p>
          </div>
        )}

        {prompts.book.length > 0 && (
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
            </div>
          </section>
        )}

        {prompts.movie.length > 0 && (
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
            </div>
          </section>
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
      </main>
      <Footer />
    </div>
  );
}
