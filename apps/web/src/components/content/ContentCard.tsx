import type { ContentDto } from '@inos/types';

interface Props {
  content: ContentDto;
  action?: React.ReactNode;
  aiReason?: string;
}

export function ContentCard({ content, action, aiReason }: Props) {
  return (
    <div className="flex gap-3 bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-4 card-hover">
      {content.thumbnailUrl ? (
        <img
          src={content.thumbnailUrl}
          alt={content.title}
          className="w-16 h-22 object-cover rounded-[6px] flex-shrink-0 border border-[oklch(92%_0.005_80)]"
          style={{ height: '88px' }}
        />
      ) : (
        <div
          className="w-16 flex-shrink-0 rounded-[6px] flex items-center justify-center text-xs font-medium"
          style={{ height: '88px', backgroundColor: 'oklch(95.5% 0.003 80)', color: 'oklch(70% 0.003 80)' }}
        >
          {content.type === 'MOVIE' ? '영화' : '책'}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-[15px] text-[oklch(18%_0.003_80)] leading-snug line-clamp-2">
            {content.title}
          </p>
          <span
            className="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={
              content.type === 'MOVIE'
                ? { backgroundColor: 'oklch(93% 0.04 68)', color: 'oklch(47% 0.10 68)' }
                : { backgroundColor: 'oklch(90% 0.03 268)', color: 'oklch(35% 0.12 268)' }
            }
          >
            {content.type === 'MOVIE' ? '영화' : '책'}
          </span>
        </div>
        <p className="text-sm text-[oklch(47%_0.004_80)]">
          {content.creator}{content.releaseYear ? ` · ${content.releaseYear}` : ''}
        </p>
        {aiReason && (
          <p className="text-xs text-[oklch(47%_0.004_80)] mt-1 line-clamp-2 leading-relaxed">
            {aiReason}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
