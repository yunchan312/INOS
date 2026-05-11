import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useDiscussion, useDiscussionNotes, useUpsertNote, usePublishNote } from '@/hooks/useDiscussion';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { DiscussionNoteDto } from '@/api/endpoints/discussion';

interface NoteCardProps {
  questionIndex: number;
  question: string;
  myNote: DiscussionNoteDto | undefined;
  otherNotes: DiscussionNoteDto[];
  discussionId: string;
  isAfterMeeting: boolean;
}

function NoteCard({ questionIndex, question, myNote, otherNotes, discussionId, isAfterMeeting }: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(myNote?.content ?? '');
  const { mutate: upsert, isPending: upserting } = useUpsertNote(discussionId);
  const { mutate: publish, isPending: publishing } = usePublishNote(discussionId);

  const handleSave = () => {
    if (!draft.trim()) return;
    upsert(
      { questionIndex, content: draft.trim() },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handlePublish = () => {
    publish(questionIndex);
  };

  return (
    <div className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-5 space-y-4">
      {/* Question */}
      <div>
        <span
          className="text-xs font-semibold uppercase"
          style={{ letterSpacing: '0.1em', color: 'oklch(60% 0.003 80)' }}
        >
          Q{questionIndex + 1}
        </span>
        <p
          className="mt-1 font-semibold leading-snug"
          style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: '16px', color: 'oklch(18% 0.003 80)' }}
        >
          {question}
        </p>
      </div>

      {/* My answer */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: 'oklch(47% 0.004 80)' }}>내 답변</p>
        {editing || !myNote ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="답변을 입력하세요..."
              rows={4}
              disabled={myNote?.isPublic}
              className="w-full rounded-xl border px-4 py-3 text-sm resize-none outline-none transition-colors duration-150"
              style={{
                borderColor: 'oklch(88% 0.005 80)',
                backgroundColor: myNote?.isPublic ? 'oklch(97% 0.002 80)' : 'oklch(100%_0_0)',
                color: 'oklch(18% 0.003 80)',
              }}
            />
            {!myNote?.isPublic && (
              <div className="flex gap-2">
                {myNote && (
                  <button
                    onClick={() => { setEditing(false); setDraft(myNote.content); }}
                    className="px-4 py-2 text-sm font-medium rounded-[8px] border transition-colors duration-150"
                    style={{ borderColor: 'oklch(92% 0.005 80)', color: 'oklch(47% 0.004 80)' }}
                  >
                    취소
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={upserting || !draft.trim()}
                  className="flex-1 py-2 text-sm font-medium rounded-[8px] transition-colors duration-150"
                  style={{ backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }}
                >
                  {upserting ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className="rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{ backgroundColor: 'oklch(97% 0.002 80)', color: 'oklch(30% 0.003 80)' }}
            >
              {myNote.content}
            </div>
            <div className="flex items-center gap-2">
              {!myNote.isPublic ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 text-xs font-medium rounded-[6px] border transition-colors duration-150"
                    style={{ borderColor: 'oklch(92% 0.005 80)', color: 'oklch(47% 0.004 80)' }}
                  >
                    수정
                  </button>
                  {isAfterMeeting && (
                    <button
                      onClick={handlePublish}
                      disabled={publishing}
                      className="px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors duration-150"
                      style={{ backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }}
                    >
                      {publishing ? '공개 중...' : '공개하기'}
                    </button>
                  )}
                </>
              ) : (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'oklch(90% 0.08 150)', color: 'oklch(35% 0.12 150)' }}
                >
                  공개됨
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Others' answers (after meeting) */}
      {isAfterMeeting && otherNotes.length > 0 && (
        <div className="pt-4 border-t space-y-3" style={{ borderColor: 'oklch(92% 0.005 80)' }}>
          <p className="text-xs font-medium" style={{ color: 'oklch(47% 0.004 80)' }}>
            다른 멤버의 답변 ({otherNotes.length})
          </p>
          {otherNotes.map((note) => (
            <div key={note.id} className="space-y-1">
              <p className="text-xs font-medium" style={{ color: 'oklch(60% 0.003 80)' }}>
                {note.user.nickname}
              </p>
              <div
                className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                style={{ backgroundColor: 'oklch(97% 0.002 80)', color: 'oklch(30% 0.003 80)' }}
              >
                {note.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscussionViewPage() {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id);

  const { data: discussion, isLoading: discLoading } = useDiscussion(discussionId!);
  const { data: notes, isLoading: notesLoading } = useDiscussionNotes(discussionId!);

  if (discLoading || notesLoading) return <LoadingSpinner fullScreen />;
  if (!discussion) return null;

  const questions: string[] = discussion.questions ?? [];
  const isAfterMeeting = false;

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 pt-6 pb-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ color: 'oklch(47% 0.004 80)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(95.5% 0.003 80)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2
            style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: '22px',
              fontWeight: 700,
              color: 'oklch(18% 0.003 80)',
              letterSpacing: '-0.01em',
            }}
          >
            발제문
          </h2>
        </div>

        {/* Discussion body */}
        {discussion.body && (
          <div
            className="bg-[oklch(98.2%_0.002_80)] rounded-2xl p-5"
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'oklch(30% 0.003 80)' }}>
              {discussion.body}
            </p>
          </div>
        )}

        {/* Q&A notes */}
        {questions.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl border"
            style={{ borderColor: 'oklch(92% 0.005 80)', borderStyle: 'dashed' }}
          >
            <p className="text-sm" style={{ color: 'oklch(60% 0.003 80)' }}>질문이 없어요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, idx) => {
              const myNote = notes?.find(
                (n) => n.questionIndex === idx && n.userId === userId,
              );
              const otherNotes = notes?.filter(
                (n) => n.questionIndex === idx && n.userId !== userId && n.isPublic,
              ) ?? [];
              return (
                <NoteCard
                  key={idx}
                  questionIndex={idx}
                  question={question}
                  myNote={myNote}
                  otherNotes={otherNotes}
                  discussionId={discussionId!}
                  isAfterMeeting={isAfterMeeting}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
