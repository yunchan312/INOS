import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import type { CSSProperties, ReactNode } from 'react';

// ─── 디자인 토큰 (웹과 동일한 브루탈리스트 팔레트) ───────────────
export const INK = '#201e1d';
export const PAPER = '#f3f2f2';
export const YELLOW = '#ffdf05';
export const MUTED = '#6b6963';
export const MUTED_2 = '#45433f';
export const HAIRLINE = '#d6d4d0';

export const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

const microLabel: CSSProperties = {
  margin: 0,
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: MUTED,
  whiteSpace: 'nowrap',
};

// 받침 유무에 따라 이/가 조사를 붙인다
export function withSubjectParticle(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (last >= 0xac00 && last <= 0xd7a3) {
    return (last - 0xac00) % 28 === 0 ? `${word}가` : `${word}이`;
  }
  return `${word}이(가)`;
}

export function formatKoreanDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// ─── 카드 셸: INOS 헤더 바 + 본문 + 푸터 바 ─────────────────────
export function EmailShell({
  preview,
  headerLabel,
  children,
}: {
  preview: string;
  headerLabel: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          backgroundColor: PAPER,
          fontFamily: FONT_FAMILY,
          padding: '32px 12px',
        }}
      >
        <Container
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            border: `2px solid ${INK}`,
          }}
        >
          <Section
            style={{ borderBottom: `2px solid ${INK}`, padding: '18px 28px' }}
          >
            <Row>
              <Column>
                <Text
                  style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    color: INK,
                  }}
                >
                  INOS
                </Text>
              </Column>
              <Column align="right">
                <Text style={microLabel}>{headerLabel}</Text>
              </Column>
            </Row>
          </Section>

          {children}

          <Section
            style={{ borderTop: `2px solid ${INK}`, padding: '14px 28px' }}
          >
            <Row>
              <Column>
                <Text style={microLabel}>INOS</Text>
              </Column>
              <Column align="right">
                <Text style={microLabel}>인문학의 OS</Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── 옐로 히어로 블록 ───────────────────────────────────────────
export function YellowHero({
  label,
  title,
}: {
  label: string;
  title: ReactNode;
}) {
  return (
    <Section
      style={{
        backgroundColor: YELLOW,
        borderBottom: `2px solid ${INK}`,
        padding: '28px',
      }}
    >
      <Text
        style={{
          margin: 0,
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: INK,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          margin: '12px 0 0',
          fontSize: '26px',
          fontWeight: 800,
          lineHeight: '1.2',
          letterSpacing: '-0.01em',
          color: INK,
        }}
      >
        {title}
      </Text>
    </Section>
  );
}

// ─── 초대의 말 인용구 (옐로 좌측 룰) ─────────────────────────────
export function GreetingQuote({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: '0 0 20px',
        borderLeft: `4px solid ${YELLOW}`,
        padding: '4px 0 4px 14px',
        fontSize: '14px',
        lineHeight: '1.7',
        color: MUTED_2,
      }}
    >
      {children}
    </Text>
  );
}

// ─── 정보 테이블 (2px 보더 박스, 라벨/값 행) ─────────────────────
export function InfoBox({
  rows,
  style,
}: {
  rows: { label: string; value: ReactNode }[];
  style?: CSSProperties;
}) {
  return (
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ border: `2px solid ${INK}`, borderCollapse: 'collapse', ...style }}
    >
      <tbody>
        {rows.map((r, i) => {
          const borderBottom =
            i < rows.length - 1 ? `1px solid ${HAIRLINE}` : 'none';
          return (
            <tr key={i}>
              <td
                style={{
                  padding: '14px 0 14px 18px',
                  width: '46px',
                  verticalAlign: 'baseline',
                  borderBottom,
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: MUTED,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.label}
                </span>
              </td>
              <td style={{ padding: '14px 18px', borderBottom }}>
                <span
                  style={{ fontSize: '14px', lineHeight: '1.6', color: INK }}
                >
                  {r.value}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── CTA 버튼 (옐로 기본 / 잉크 다크) ───────────────────────────
export function Cta({
  href,
  children,
  dark,
}: {
  href: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <Button
      href={href}
      style={{
        display: 'block',
        backgroundColor: dark ? INK : YELLOW,
        color: dark ? PAPER : INK,
        border: `2px solid ${INK}`,
        padding: '14px 20px',
        fontSize: '15px',
        fontWeight: 700,
        textDecoration: 'none',
        textAlign: 'left',
      }}
    >
      {children}&nbsp;&nbsp;→
    </Button>
  );
}

// ─── 본문 텍스트 ────────────────────────────────────────────────
export const bodyText: CSSProperties = {
  margin: '0 0 16px',
  fontSize: '15px',
  lineHeight: '1.7',
  color: INK,
};

export const mutedText: CSSProperties = {
  ...bodyText,
  color: MUTED_2,
};

export const footnote: CSSProperties = {
  margin: '24px 0 0',
  paddingTop: '16px',
  borderTop: `1px solid ${HAIRLINE}`,
  fontSize: '12px',
  lineHeight: '1.7',
  color: MUTED,
};
