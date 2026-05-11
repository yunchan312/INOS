import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useContents } from '@/hooks/useContent';
import { Layout } from '@/components/layout/Layout';
import { ContentCard } from '@/components/content/ContentCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type Filter = 'ALL' | 'MOVIE' | 'BOOK';

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="oklch(60% 0.003 80)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="영화, 책 검색..."
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors duration-150"
        style={{
          borderColor: 'oklch(92% 0.005 80)',
          backgroundColor: 'oklch(98.2% 0.002 80)',
          color: 'oklch(18% 0.003 80)',
        }}
      />
    </div>
  );
}

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: contents, isLoading } = useContents(
    filter === 'ALL' ? undefined : filter,
  );

  const filtered = contents?.filter((c) =>
    search.trim() === '' ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.creator ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const filters: { key: Filter; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'MOVIE', label: '영화' },
    { key: 'BOOK', label: '책' },
  ];

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1
            style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: 'clamp(28px, 7vw, 36px)',
              fontWeight: 700,
              color: 'oklch(18% 0.003 80)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            INOS
          </h1>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/group/new"
                className="min-h-[44px] px-4 rounded-[10px] text-sm font-medium flex items-center transition-colors duration-150"
                style={{ backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }}
              >
                + 모임
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="min-h-[44px] px-4 rounded-[10px] text-sm font-medium flex items-center border transition-colors duration-150"
              style={{ borderColor: 'oklch(88% 0.005 80)', color: 'oklch(47% 0.004 80)' }}
            >
              로그인
            </Link>
          )}
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-150"
              style={
                filter === f.key
                  ? { backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }
                  : { backgroundColor: 'oklch(95.5% 0.003 80)', color: 'oklch(47% 0.004 80)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : filtered?.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl border"
            style={{ borderColor: 'oklch(92% 0.005 80)', borderStyle: 'dashed' }}
          >
            <p className="text-sm" style={{ color: 'oklch(60% 0.003 80)' }}>
              {search ? '검색 결과가 없어요' : '아직 등록된 콘텐츠가 없어요'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {filtered?.map((content) => (
              <button
                key={content.id}
                onClick={() => navigate(`/contents/${content.id}`)}
                className="w-full text-left"
              >
                <ContentCard content={content} />
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
