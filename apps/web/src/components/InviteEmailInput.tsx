import { useState, type FormEvent } from 'react';
import { Button } from '@/components/Button';
import { useInviteMember } from '@/hooks/useInviteMember';

interface InviteEmailInputProps {
  orgId: string;
}

export function InviteEmailInput({ orgId }: InviteEmailInputProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const inviteMutation = useInviteMember(orgId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setMessage(null);
    inviteMutation.mutate(email.trim(), {
      onSuccess: (data) => {
        setMessage(`${data.inviteeEmail}에게 초대장을 보냈어요`);
        setEmail('');
      },
      onError: (err) => {
        const anyErr = err as { response?: { data?: { message?: string } } };
        setMessage(
          anyErr.response?.data?.message ?? '초대장 발송에 실패했어요',
        );
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="초대할 이메일"
          className="flex-1 input-underline text-sm"
          required
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={inviteMutation.isPending}
        >
          초대
        </Button>
      </div>
      {message && (
        <p className="text-xs text-neutral-500">{message}</p>
      )}
    </form>
  );
}
