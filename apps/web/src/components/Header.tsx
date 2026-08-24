import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const unreadCount = useUnreadNotificationCount();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-2 border-ink pt-safe">
      <div className="mx-auto max-w-3xl px-4 h-[60px] flex items-center justify-between">
        <Link
          to={isAuthenticated ? "/orgs" : "/"}
          className="flex items-baseline gap-2.5"
        >
          <span className="text-xl font-extrabold tracking-tight">INOS</span>
          <span className="hidden sm:inline text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            인문학의 OS
          </span>
        </Link>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <Link
              to="/notifications"
              aria-label={
                unreadCount > 0 ? `알림 ${unreadCount}개 안 읽음` : "알림함"
              }
              className="relative text-[13px] font-medium text-muted hover:text-ink"
            >
              알림
              {unreadCount > 0 && (
                <div className="absolute size-2 -right-2 -top-0.5 border border-ink bg-point text-center text-[10px] font-bold leading-4 rounded-full text-on-accent" />
              )}
            </Link>
            <Link
              to="/library"
              className="text-[13px] font-medium text-muted hover:text-ink"
            >
              라이브러리
            </Link>
            {user?.isAdmin && (
              <Link
                to="/admin"
                className="text-[13px] font-medium text-muted hover:text-ink"
              >
                관리자
              </Link>
            )}
            <Link to="/orgs" aria-label="마이페이지">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.nickname}
                  className="w-8 h-8 border-2 border-ink object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-ink text-point flex items-center justify-center text-xs font-bold">
                  {user?.nickname?.[0] ?? "?"}
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[13px] font-medium text-muted hover:text-ink"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
