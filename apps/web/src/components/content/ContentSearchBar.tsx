import { useState } from 'react';
import type { ContentType } from '@inos/types';

interface Props {
  onSearch: (query: string, type?: ContentType) => void;
  isLoading?: boolean;
}

export function ContentSearchBar({ onSearch, isLoading }: Props) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<ContentType | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim(), type);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-[oklch(47%_0.004_80)]">유형</span>
        <select
          className="input-underline text-sm py-2 pr-6 bg-transparent cursor-pointer text-[oklch(18%_0.003_80)]"
          style={{ fontFamily: "'Pretendard', system-ui, sans-serif", borderBottom: '1px solid oklch(92% 0.005 80)', outline: 'none' }}
          value={type ?? ''}
          onChange={(e) => setType((e.target.value as ContentType) || undefined)}
        >
          <option value="">전체</option>
          <option value="MOVIE">영화</option>
          <option value="BOOK">책</option>
        </select>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <span className="text-xs font-medium text-[oklch(47%_0.004_80)]">검색</span>
        <input
          type="text"
          className="input-underline text-sm flex-1 text-[oklch(18%_0.003_80)] placeholder:text-[oklch(70%_0.003_80)]"
          placeholder="제목, 저자, 감독..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="min-h-[44px] px-5 rounded-[10px] text-sm font-medium transition-colors duration-150"
        style={
          !query.trim() || isLoading
            ? { backgroundColor: 'oklch(92% 0.005 80)', color: 'oklch(70% 0.003 80)', cursor: 'not-allowed' }
            : { backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }
        }
        disabled={isLoading || !query.trim()}
      >
        {isLoading
          ? <span className="w-4 h-4 inline-block rounded-full border-2 border-[oklch(60%_0.003_80)] border-t-[oklch(98%_0_0)] animate-spin" />
          : '검색'}
      </button>
    </form>
  );
}
