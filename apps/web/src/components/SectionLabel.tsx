interface SectionLabelProps {
  num: string;
  children: string;
  hint?: string;
}

export function SectionLabel({ num, children, hint }: SectionLabelProps) {
  return (
    <div className="mb-4 flex items-baseline gap-2.5">
      <span className="text-[10px] font-semibold tabular-nums tracking-[0.16em] text-muted">
        {num}
      </span>
      <h2 className="text-xs font-semibold tracking-[0.06em] text-muted whitespace-nowrap">
        {children}
      </h2>
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </div>
  );
}
