import type { GroupMemberDto } from '@inos/types';

interface Props {
  members: GroupMemberDto[];
}

export function MemberList({ members }: Props) {
  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li key={member.id} className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-9">
              <span className="text-sm">
                {member.user?.nickname?.[0] ?? '?'}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{member.user?.nickname ?? '알 수 없음'}</p>
          </div>
          {member.role === 'LEADER' && (
            <span className="badge badge-primary badge-sm">리더</span>
          )}
        </li>
      ))}
    </ul>
  );
}
