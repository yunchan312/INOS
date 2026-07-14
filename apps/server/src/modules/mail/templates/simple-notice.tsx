import { Section, Text } from '@react-email/components';
import { bodyText, Cta, EmailShell, INK, MUTED } from './email-shell';

export interface SimpleNoticeProps {
  preview: string;
  headerLabel: string;
  label: string;
  title: string;
  lines: string[];
  /** 목록으로 표시할 항목 (변경 내역 등) */
  listItems?: string[];
  ctaText?: string;
  ctaUrl?: string;
}

// 디자인 시스템 셸을 쓰는 범용 알림 메일 (org 변경/삭제 등)
export function SimpleNotice({
  preview,
  headerLabel,
  label,
  title,
  lines,
  listItems,
  ctaText,
  ctaUrl,
}: SimpleNoticeProps) {
  return (
    <EmailShell preview={preview} headerLabel={headerLabel}>
      <Section style={{ padding: '28px' }}>
        <Text
          style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: MUTED,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            margin: '10px 0 0',
            fontSize: '24px',
            fontWeight: 800,
            lineHeight: '1.25',
            letterSpacing: '-0.01em',
            color: INK,
          }}
        >
          {title}
        </Text>
        {lines.map((line, i) => (
          <Text
            key={i}
            style={{
              ...bodyText,
              margin: i === 0 ? '16px 0 0' : '12px 0 0',
            }}
          >
            {line}
          </Text>
        ))}
        {listItems && listItems.length > 0 && (
          <ul style={{ margin: '16px 0 0', paddingLeft: '20px' }}>
            {listItems.map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: INK,
                  margin: '4px 0',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
        {ctaText && ctaUrl && (
          <Section style={{ marginTop: '24px' }}>
            <Cta href={ctaUrl}>{ctaText}</Cta>
          </Section>
        )}
      </Section>
    </EmailShell>
  );
}

export default SimpleNotice;
