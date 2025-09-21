import { useState, useEffect } from "react";

interface ViewportInfo {
  width: number;
  height: number;
  aspectRatio: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    aspectRatio: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    breakpoint: "xs",
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;

      // 브레이크포인트 결정
      let breakpoint: keyof typeof BREAKPOINTS = "xs";
      if (width >= BREAKPOINTS["2xl"]) breakpoint = "2xl";
      else if (width >= BREAKPOINTS.xl) breakpoint = "xl";
      else if (width >= BREAKPOINTS.lg) breakpoint = "lg";
      else if (width >= BREAKPOINTS.md) breakpoint = "md";
      else if (width >= BREAKPOINTS.sm) breakpoint = "sm";

      setViewport({
        width,
        height,
        aspectRatio,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg && width < BREAKPOINTS["2xl"],
        isLargeDesktop: width >= BREAKPOINTS["2xl"],
        breakpoint,
      });
    };

    // 초기 설정
    updateViewport();

    // 리사이즈 이벤트 리스너
    window.addEventListener("resize", updateViewport);

    // orientationchange 이벤트 리스너 (모바일 회전)
    window.addEventListener("orientationchange", () => {
      // orientationchange 후 약간의 지연을 두고 실행
      setTimeout(updateViewport, 100);
    });

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  return viewport;
}

// 개별 브레이크포인트 훅들
export function useIsMobile() {
  const { isMobile } = useViewport();
  return isMobile;
}

export function useIsTablet() {
  const { isTablet } = useViewport();
  return isTablet;
}

export function useIsDesktop() {
  const { isDesktop } = useViewport();
  return isDesktop;
}

export function useBreakpoint() {
  const { breakpoint } = useViewport();
  return breakpoint;
}

// 화면 비율 기반 훅
export function useAspectRatio() {
  const { aspectRatio } = useViewport();
  return aspectRatio;
}

// 화면 크기 기반 훅
export function useScreenSize() {
  const { width, height } = useViewport();
  return { width, height };
}

// 뷰포트 높이 기반 compact 레이아웃 훅
export function useCompactLayout() {
  const { height } = useViewport();

  const isCompactHeight = height < 600; // 600px 미만은 compact
  const isVeryCompactHeight = height < 500; // 500px 미만은 매우 compact
  const isTallHeight = height > 900; // 900px 초과는 tall

  return {
    isCompactHeight,
    isVeryCompactHeight,
    isTallHeight,
    height,
  };
}

// 뷰포트 높이에 따른 스타일 클래스 반환
export function useHeightBasedClasses() {
  const { isCompactHeight, isVeryCompactHeight, isTallHeight } =
    useCompactLayout();

  const spacingClass = isVeryCompactHeight
    ? "spacing-compact"
    : isCompactHeight
    ? "spacing-normal"
    : "spacing-loose";

  const paddingClass = isVeryCompactHeight
    ? "padding-compact"
    : isCompactHeight
    ? "padding-normal"
    : "padding-loose";

  const marginClass = isVeryCompactHeight
    ? "margin-compact"
    : isCompactHeight
    ? "margin-normal"
    : "margin-loose";

  const tableRowClass = isVeryCompactHeight
    ? "table-row-compact"
    : isCompactHeight
    ? "table-row-normal"
    : "table-row-loose";

  const buttonClass = isVeryCompactHeight
    ? "btn-compact"
    : isCompactHeight
    ? "btn-normal"
    : "btn-loose";

  const cardClass = isVeryCompactHeight
    ? "card-compact"
    : isCompactHeight
    ? "card-normal"
    : "card-loose";

  return {
    spacingClass,
    paddingClass,
    marginClass,
    tableRowClass,
    buttonClass,
    cardClass,
    isCompactHeight,
    isVeryCompactHeight,
    isTallHeight,
  };
}
