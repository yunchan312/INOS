import { Link } from 'react-router-dom';
import type { GroupDto } from '@inos/types';

interface Props {
  group: GroupDto;
}

export function GroupCard({ group }: Props) {
  return (
    <Link to={`/groups/${group.id}`} className="block">
      <div className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-5 card-hover">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[18px] text-[oklch(18%_0.003_80)] truncate leading-snug">
              {group.name}
            </p>
            {group.description && (
              <p className="text-sm text-[oklch(47%_0.004_80)] mt-1 line-clamp-1">
                {group.description}
              </p>
            )}
          </div>
          <span
            className="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'oklch(90% 0.03 268)', color: 'oklch(35% 0.12 268)' }}
          >
            {group.mode === 'GROUP' ? '그룹' : '개인'}
          </span>
        </div>
      </div>
    </Link>
  );
}
