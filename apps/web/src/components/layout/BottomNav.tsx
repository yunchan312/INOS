import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/home',
    label: '홈',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'oklch(30% 0.13 268)' : 'none'} stroke={active ? 'oklch(30% 0.13 268)' : 'oklch(70% 0.003 80)'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/groups',
    label: '모임',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'oklch(30% 0.13 268)' : 'oklch(70% 0.003 80)'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/groups',
    label: '검색',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'oklch(30% 0.13 268)' : 'oklch(70% 0.003 80)'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    to: '/archives',
    label: '아카이브',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'oklch(30% 0.13 268)' : 'oklch(70% 0.003 80)'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
      </svg>
    ),
  },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[oklch(100%_0_0)] border-t border-[oklch(92%_0.005_80)] pb-safe md:hidden">
      <div className="grid grid-cols-4 h-14">
        {navItems.map((item) => (
          <NavLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            className="flex flex-col items-center justify-center"
          >
            {({ isActive }) => (
              <span
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-colors duration-150"
                style={isActive ? { backgroundColor: 'oklch(90% 0.03 268)' } : {}}
              >
                {item.icon(isActive)}
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? 'oklch(30% 0.13 268)' : 'oklch(70% 0.003 80)' }}
                >
                  {item.label}
                </span>
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
