interface SectionLabelProps {
  num: string;
  children: string;
  hint?: string;
}

export function SectionLabel({ num, children, hint }: SectionLabelProps) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="text-xs font-bold uppercase tracking-[0.16em]">{num}</span>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted whitespace-nowrap">
        {children}
      </h2>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
