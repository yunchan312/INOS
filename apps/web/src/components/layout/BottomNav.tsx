import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/',
    label: '홈',
    end: true,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#ffdf05' : 'none'} stroke={active ? 'oklch(30% 0.08 90)' : 'oklch(70% 0.003 80)'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/group',
    label: '그룹',
    end: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'oklch(30% 0.08 90)' : 'oklch(70% 0.003 80)'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/personal',
    label: '개인',
    end: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'oklch(30% 0.08 90)' : 'oklch(70% 0.003 80)'} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[oklch(100%_0_0)] border-t border-[oklch(92%_0.005_80)] pb-safe md:hidden">
      <div className="grid grid-cols-3 h-14">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex flex-col items-center justify-center"
          >
            {({ isActive }) => (
              <span
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-full transition-colors duration-150"
                style={isActive ? { backgroundColor: 'oklch(97% 0.07 100)' } : {}}
              >
                {item.icon(isActive)}
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? 'oklch(30% 0.08 90)' : 'oklch(70% 0.003 80)' }}
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
