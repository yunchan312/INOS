import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200 pt-safe">
      <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
        <Link to={isAuthenticated ? '/orgs' : '/'} className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">INOS</span>
        </Link>
        {isAuthenticated && (
          <div className="flex items-center gap-3">
            {user?.isAdmin && (
              <Link
                to="/admin"
                className="text-sm text-neutral-500 hover:text-neutral-800"
              >
                관리자
              </Link>
            )}
            <Link to="/orgs" aria-label="마이페이지">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.nickname}
                  className="w-8 h-8 rounded-full border border-neutral-200 object-cover hover:border-neutral-400 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium hover:bg-neutral-300 transition-colors">
                  {user?.nickname?.[0] ?? '?'}
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-neutral-500 hover:text-neutral-800"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
