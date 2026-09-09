import { useEffect, useRef, useState } from 'react';
import { buildSpineFontsHref, spineFontChars } from '@/components/library/spineStyles';

/** 첫 화면 렌더를 방해하지 않을 만큼 늦되, 사용자가 서가에 닿기 전에는 시작되는 시점 */
const FALLBACK_DELAY_MS = 3000;

/**
 * 이미 받아둔 글자. <link>는 document.head에 남으므로 문서 단위로 기억해야 한다 —
 * 컴포넌트마다 세면 서가를 떠났다 돌아올 때 같은 요청을 다시 넣는다.
 */
const loadedChars = new Set<string>();

/**
 * 책등 서체 30벌을 서가가 화면에 들어올 때 불러온다.
 * 랜딩에서는 세 번째 섹션이라, 첫 화면 렌더를 이 폰트가 막을 이유가 없다.
 *
 * 한글 웹폰트 30벌은 통째로 부르면 CSS만 2.4MB다. 그래서 text=로 지금 선반에
 * 꽂힌 제목의 글자만 받는데, 실제 서재는 책이 나중에 도착하고 20권씩 더 열린다.
 * 그때마다 전부 다시 받지 않도록 **모자란 글자만** 이어서 요청한다 —
 * text= 응답은 unicode-range를 달고 오므로 여러 장이 글자별로 합쳐진다(실측).
 *
 * 반환한 ref를 서가 컨테이너에 걸면 된다.
 */
export function useShelfFonts(titles: string[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    // IntersectionObserver가 없는 환경에서는 그냥 바로 불러온다
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      // 스크롤이 닿기 전에 미리 받아둬야 글자가 바뀌는 게 덜 보인다
      { rootMargin: '400px' },
    );
    io.observe(el);

    // 안전망: 관찰자가 끝내 발화하지 않아도(탭이 백그라운드로 열렸다가 그대로
    // 서가까지 스크롤되는 등) 서체가 영영 안 붙는 일이 없게 한다.
    // 이때 모든 책등이 같은 폰트로 떨어져서 30벌을 만든 의미가 사라진다.
    const fallback = setTimeout(() => setVisible(true), FALLBACK_DELAY_MS);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    // 책이 아직 없으면 요청할 글자도 없다 — 빈 서가에서 30벌을 받지 않는다
    if (!visible || titles.length === 0) return;
    const missing = spineFontChars(titles).filter((c) => !loadedChars.has(c));
    const href = buildSpineFontsHref(missing);
    if (!href) return;

    missing.forEach((c) => loadedChars.add(c));
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    // 한 번 넣은 스타일시트는 지우지 않는다 — 지우면 다시 보일 때 글자가 튄다
  }, [visible, titles]);

  return ref;
}
