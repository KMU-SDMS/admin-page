import React from "react";
import { cn } from "@/lib/utils";
import { getTypographyClass } from "@/lib/design-tokens";

// 타이포그래피 레벨 타입
export type TypographyLevel =
  | "display-1"
  | "display-2"
  | "title-1"
  | "title-2"
  | "title-3"
  | "heading-1"
  | "heading-2"
  | "headline-1"
  | "headline-2"
  | "body-1"
  | "body-1-reading"
  | "body-2"
  | "body-2-reading"
  | "label-1"
  | "label-2"
  | "caption-1"
  | "caption-2";

// 타이포그래피 가중치 타입
export type TypographyWeight = "regular" | "medium" | "bold";

// 타이포그래피 색상 타입
export type TypographyColor =
  | "normal"
  | "muted"
  | "secondary"
  | "strong"
  | "disable"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "inherit";

interface TypographyProps {
  level?: TypographyLevel;
  weight?: TypographyWeight;
  color?: TypographyColor;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

// 레벨별 기본 태그 매핑
const defaultTags: Record<TypographyLevel, keyof JSX.IntrinsicElements> = {
  "display-1": "h1",
  "display-2": "h1",
  "title-1": "h1",
  "title-2": "h2",
  "title-3": "h3",
  "heading-1": "h2",
  "heading-2": "h3",
  "headline-1": "h4",
  "headline-2": "h5",
  "body-1": "p",
  "body-1-reading": "p",
  "body-2": "p",
  "body-2-reading": "p",
  "label-1": "span",
  "label-2": "span",
  "caption-1": "span",
  "caption-2": "span",
};

// 가중치별 CSS 클래스 매핑
const weightClasses: Record<TypographyWeight, string> = {
  regular: "font-regular",
  medium: "font-medium",
  bold: "font-bold",
};

// 색상별 CSS 클래스 매핑
const colorClasses: Record<TypographyColor, string> = {
  normal: "text-foreground",
  muted: "text-muted-foreground",
  secondary: "text-foreground-secondary",
  strong: "text-foreground",
  disable: "text-foreground/opacity-35",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  inherit: "text-inherit",
};

export function Typography({
  level = "body-1",
  weight = "regular",
  color = "normal",
  className,
  children,
  as,
}: TypographyProps) {
  const Tag = as || defaultTags[level];

  // 타이포그래피 스타일 클래스 생성
  const typographyClass = `text-${level}`;
  const weightClass = weightClasses[weight];
  const colorClass = colorClasses[color];

  return (
    <Tag className={cn(typographyClass, weightClass, colorClass, className)}>
      {children}
    </Tag>
  );
}

// 편의 컴포넌트들
export const Display1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="display-1" as="h1" {...props}>
    {children}
  </Typography>
));
Display1.displayName = "Display1";

export const Display2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="display-2" as="h1" {...props}>
    {children}
  </Typography>
));
Display2.displayName = "Display2";

export const Title1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="title-1" as="h1" {...props}>
    {children}
  </Typography>
));
Title1.displayName = "Title1";

export const Title2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="title-2" as="h2" {...props}>
    {children}
  </Typography>
));
Title2.displayName = "Title2";

export const Title3 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="title-3" as="h3" {...props}>
    {children}
  </Typography>
));
Title3.displayName = "Title3";

export const Heading1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="heading-1" as="h2" {...props}>
    {children}
  </Typography>
));
Heading1.displayName = "Heading1";

export const Heading2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="heading-2" as="h3" {...props}>
    {children}
  </Typography>
));
Heading2.displayName = "Heading2";

export const Headline1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="headline-1" as="h4" {...props}>
    {children}
  </Typography>
));
Headline1.displayName = "Headline1";

export const Headline2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="headline-2" as="h5" {...props}>
    {children}
  </Typography>
));
Headline2.displayName = "Headline2";

export const Body1 = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="body-1" as="p" {...props}>
    {children}
  </Typography>
));
Body1.displayName = "Body1";

export const Body1Reading = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="body-1-reading" as="p" {...props}>
    {children}
  </Typography>
));
Body1Reading.displayName = "Body1Reading";

export const Body2 = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="body-2" as="p" {...props}>
    {children}
  </Typography>
));
Body2.displayName = "Body2";

export const Body2Reading = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="body-2-reading" as="p" {...props}>
    {children}
  </Typography>
));
Body2Reading.displayName = "Body2Reading";

export const Label1 = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="label-1" as="span" {...props}>
    {children}
  </Typography>
));
Label1.displayName = "Label1";

export const Label2 = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="label-2" as="span" {...props}>
    {children}
  </Typography>
));
Label2.displayName = "Label2";

export const Caption1 = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="caption-1" as="span" {...props}>
    {children}
  </Typography>
));
Caption1.displayName = "Caption1";

export const Caption2 = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "level">
>(({ children, ...props }, ref) => (
  <Typography ref={ref} level="caption-2" as="span" {...props}>
    {children}
  </Typography>
));
Caption2.displayName = "Caption2";
