import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface LegalLayoutProps {
  label: string;
  title: string;
  updatedAt: string; // 예: '2026.07.14'
  children: ReactNode;
}

export function LegalLayout({ label, title, updatedAt, children }: LegalLayoutProps) {
  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-[760px] w-full flex-1 px-6 pt-10 page-enter">
        <Link to="/" className="text-[13px] font-medium text-muted hover:text-ink">
          ← 홈으로
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {label}
        </p>
        <h1 className="mt-2.5 text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-[13px] text-muted">시행일 {updatedAt}</p>
        <div className="mt-8 border-t-2 border-ink">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="py-7 border-b border-line">
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.16em]">{num}</span>
        <h2 className="text-[15px] font-bold">{title}</h2>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-muted-2 space-y-2 max-w-[62ch]">
        {children}
      </div>
    </section>
  );
}
