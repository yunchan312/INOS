import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

interface Props {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: Props) {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: 'oklch(98.2% 0.002 80)' }}
    >
      {!hideNav && <Navbar />}
      <main className="flex-1 pb-20 md:pb-0 page-enter">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
