import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrg } from '@/hooks/useOrg';
import { useCreateMeeting } from '@/hooks/useCreateMeeting';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(dt.getDate()).padStart(2, '0')}`;
}

function FieldLabelWithHint({ label, hint }: { label: string; hint: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.12em]">
      {label}
      <br />
      <span className="font-normal normal-case tracking-normal text-muted">
        {hint}
      </span>
    </p>
  );
}

export default function CreateMeetingPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const orgQuery = useOrg(orgId);
  const createMutation = useCreateMeeting(orgId);

  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDirector, setMovieDirector] = useState('');
  const [candidateFrom, setCandidateFrom] = useState(todayIso());
  const [candidateTo, setCandidateTo] = useState(addDays(todayIso(), 7));
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (orgQuery.data && orgQuery.data.myRole !== 'OWNER') {
      navigate(`/orgs/${orgId}`, { replace: true });
    }
  }, [orgQuery.data, orgId, navigate]);

  const bookFilled = !!bookTitle.trim() && !!bookAuthor.trim();
  const movieFilled = !!movieTitle.trim() && !!movieDirector.trim();
  const bookPartial = !!bookTitle.trim() !== !!bookAuthor.trim();
  const moviePartial = !!movieTitle.trim() !== !!movieDirector.trim();
  const canSubmit = useMemo(
    () =>
      (bookFilled || movieFilled) &&
      !bookPartial &&
      !moviePartial &&
      candidateFrom < candidateTo,
    [bookFilled, movieFilled, bookPartial, moviePartial, candidateFrom, candidateTo],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError('책 또는 영화 중 하나는 제목+저자/감독을 모두 입력해주세요');
      return;
    }
    createMutation.mutate(
      {
        bookTitle: bookFilled ? bookTitle.trim() : undefined,
        bookAuthor: bookFilled ? bookAuthor.trim() : undefined,
        movieTitle: movieFilled ? movieTitle.trim() : undefined,
        movieDirector: movieFilled ? movieDirector.trim() : undefined,
        candidateFrom,
        candidateTo,
        location: location.trim() ? location.trim() : undefined,
      },
      {
        onSuccess: () => navigate(`/orgs/${orgId}`),
        onError: (err) => {
          const anyErr = err as { response?: { data?: { message?: string | string[] } } };
          const msg = anyErr.response?.data?.message;
          setError(Array.isArray(msg) ? msg[0] : msg ?? '모임 생성에 실패했어요');
        },
      },
    );
  };

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-[760px] w-full flex-1 px-6 pt-10 page-enter">
        <Link
          to={`/orgs/${orgId}`}
          className="text-[13px] font-medium text-muted hover:text-ink"
        >
          ← 오가니제이션으로
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          새 모임
        </p>
        <h1 className="mt-2.5 text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight">
          무엇을 함께 읽을까요?
        </h1>
        <p className="mt-3 text-sm text-muted leading-relaxed max-w-[52ch]">
          책·영화 중 하나 이상 선택하고 후보 날짜를 정해주세요. 모든 멤버에게
          이메일 초대장이 전송돼요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 border-t-2 border-ink">
          <section className="py-7 border-b border-line grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-4">
            <FieldLabelWithHint label="책" hint="선택" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="제목"
                placeholder="예: 1984"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              />
              <Input
                label="저자"
                placeholder="예: 조지 오웰"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                error={
                  bookPartial ? '제목과 저자는 함께 입력해주세요' : undefined
                }
              />
            </div>
          </section>

          <section className="py-7 border-b border-line grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-4">
            <FieldLabelWithHint label="영화" hint="선택" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="제목"
                placeholder="예: 오펜하이머"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
              />
              <Input
                label="감독"
                placeholder="예: 크리스토퍼 놀란"
                value={movieDirector}
                onChange={(e) => setMovieDirector(e.target.value)}
                error={
                  moviePartial ? '제목과 감독은 함께 입력해주세요' : undefined
                }
              />
            </div>
          </section>

          <section className="py-7 border-b-2 border-ink grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-4">
            <FieldLabelWithHint label="일정" hint="후보 범위" />
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="시작"
                  type="date"
                  value={candidateFrom}
                  onChange={(e) => setCandidateFrom(e.target.value)}
                  min={todayIso()}
                />
                <Input
                  label="종료"
                  type="date"
                  value={candidateTo}
                  onChange={(e) => setCandidateTo(e.target.value)}
                  min={candidateFrom}
                />
              </div>
              <Input
                label="장소 (선택)"
                placeholder="예: 홍대입구 스타벅스"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </section>

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}

          <div className="mt-8">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={createMutation.isPending}
              disabled={!canSubmit}
            >
              <span>모임 만들기 · 초대장 발송</span>
              <span aria-hidden="true">→</span>
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
