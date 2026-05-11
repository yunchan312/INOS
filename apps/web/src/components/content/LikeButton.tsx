import { useToggleLike } from '@/hooks/useContent';

interface Props {
  groupId: string;
  groupContentId: string;
  likeCount: number;
  liked?: boolean;
}

export function LikeButton({ groupId, groupContentId, likeCount, liked = false }: Props) {
  const { mutate, isPending } = useToggleLike(groupId, groupContentId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutate();
      }}
      disabled={isPending}
      className="flex items-center gap-1.5 transition-all duration-150"
      aria-label={liked ? '좋아요 취소' : '좋아요'}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={liked ? 'oklch(55% 0.22 18)' : 'none'}
        stroke={liked ? 'oklch(55% 0.22 18)' : 'oklch(60% 0.003 80)'}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'fill 0.15s, stroke 0.15s' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
      <span
        className="text-sm font-medium"
        style={{ color: liked ? 'oklch(55% 0.22 18)' : 'oklch(60% 0.003 80)' }}
      >
        {likeCount}
      </span>
    </button>
  );
}
