import { useEffect, useRef, useState } from 'react';
import { buildSpineFontsHref } from '@/components/library/spineStyles';

const LINK_ID = 'inos-spine-fonts';
/** 첫 화면 렌더를 방해하지 않을 만큼 늦되, 사용자가 서가에 닿기 전에는 시작되는 시점 */
const FALLBACK_DELAY_MS = 3000;

/**
 * 책등 서체 30벌을 서가가 화면에 들어올 때 불러온다.
 * 랜딩 최상단이 아니라 세 번째 섹션이라, 첫 화면 렌더를 이 폰트가 막을 이유가 없다.
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
    if (!visible || document.getElementById(LINK_ID)) return;
    const link = document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    link.href = buildSpineFontsHref(titles);
    document.head.appendChild(link);
    // 한 번 넣은 스타일시트는 지우지 않는다 — 지우면 다시 보일 때 글자가 튄다
  }, [visible, titles]);

  return ref;
}
