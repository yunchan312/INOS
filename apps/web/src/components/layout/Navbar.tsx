import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[oklch(100%_0_0)] border-b border-[oklch(92%_0.005_80)]">
      <div className="container max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/home"
          className="font-bold tracking-tight text-[oklch(18%_0.003_80)]"
          style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: '22px' }}
        >
          INOS
        </Link>

        {user && (
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center"
              aria-label="내 계정"
            >
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.nickname}
                  className="w-8 h-8 rounded-full object-cover border border-[oklch(92%_0.005_80)]"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-[oklch(93%_0.04_68)] text-[oklch(47%_0.10_68)] flex items-center justify-center text-sm font-semibold">
                  {user.nickname[0]}
                </span>
              )}
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-sm z-50 mt-1 p-1 bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-[10px] w-40 shadow-none"
            >
              <li className="px-3 py-2 text-xs text-[oklch(47%_0.004_80)]">{user.nickname}</li>
              <li>
                <button
                  className="text-sm text-[oklch(18%_0.003_80)] hover:bg-[oklch(95.5%_0.003_80)] rounded-[6px] px-3 py-2 w-full text-left min-h-[44px]"
                  onClick={() => void logout()}
                >
                  로그아웃
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
