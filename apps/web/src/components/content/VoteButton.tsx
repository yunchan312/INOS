import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/api/endpoints/content';

interface Props {
  groupId: string;
  groupContentId: string;
  currentScore?: number | null;
}

export function VoteButton({ groupId, groupContentId, currentScore }: Props) {
  const [score, setScore] = useState(currentScore ?? 0);
  const qc = useQueryClient();
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: (s: number) =>
      contentApi.voteContent(groupId, groupContentId, { score: s }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'contents'] }),
  });

  const handleVote = (s: number, i: number) => {
    setScore(s);
    mutate(s);
    const btn = btnRefs.current[i];
    if (btn) {
      btn.classList.remove('vote-spring');
      void btn.offsetWidth; // reflow to restart animation
      btn.classList.add('vote-spring');
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s, i) => (
        <button
          key={s}
          ref={(el) => { btnRefs.current[i] = el; }}
          className="w-8 h-8 rounded-full text-xs font-semibold border transition-colors duration-150 min-w-[44px] min-h-[44px]"
          style={
            score >= s
              ? { backgroundColor: 'oklch(62% 0.13 68)', borderColor: 'oklch(62% 0.13 68)', color: '#fff' }
              : { backgroundColor: 'transparent', borderColor: 'oklch(62% 0.13 68)', color: 'oklch(62% 0.13 68)' }
          }
          onClick={() => handleVote(s, i)}
          disabled={isPending}
          aria-label={`${s}점`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
