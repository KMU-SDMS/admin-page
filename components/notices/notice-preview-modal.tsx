"use client";

import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  X,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Star,
  User,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NoticePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticeData: {
    title: string;
    body: string;
    is_important: boolean;
    date: string;
    id?: number;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function NoticePreviewModal({
  isOpen,
  onClose,
  noticeData,
  onEdit,
  onDelete,
}: NoticePreviewModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollHeader, setShowScrollHeader] = useState(false);

  // 키보드 접근성 (ESC로 닫기)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 스크롤 감지 - 정보 컨테이너(264px)가 모두 사라졌을 때 고정 헤더 표시
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowScrollHeader(target.scrollTop >= 264);
  };

  const getTargetBadge = () => {
    if (noticeData.is_important)
      return <Badge variant="destructive">중요공지</Badge>;
    return <Badge variant="default">일반공지</Badge>;
  };

  const modalStyles = isExpanded
    ? {
        width: "1558px",
        height: "880px",
        top: "100px",
        left: "181px",
        bottom: "auto",
        right: "auto",
      }
    : {
        width: "560px",
        height: "700px",
        bottom: "20px",
        right: "64px",
        top: "auto",
        left: "auto",
      };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="fixed translate-x-0 translate-y-0 max-w-none max-h-none p-0 gap-0 transition-all duration-300 flex flex-col rounded-[10px] overflow-hidden"
        style={{
          ...modalStyles,
          backgroundColor: "var(--color-semantic-background-normal-normal)",
          border: "1px solid var(--color-semantic-line-normal-normal)",
          color: "var(--color-semantic-label-normal)",
        }}
      >
        <DialogHeader
          className="flex flex-row items-center justify-between px-0 py-0 m-0 gap-0 border-b"
          style={{
            height: "48px",
            minHeight: "48px",
            maxHeight: "48px",
            backgroundColor:
              "var(--color-semantic-background-normal-alternative)",
            borderBottomColor: "var(--color-semantic-line-normal-normal)",
          }}
        >
          <div
            className="pl-8"
            style={{
              color: "var(--color-semantic-label-neutral)",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "Pretendard",
              lineHeight: "18.005px",
              letterSpacing: "0.252px",
            }}
          >
            {noticeData.id && `No. ${noticeData.id}`}
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 p-0 hover:bg-transparent"
              style={{
                color: "var(--color-semantic-label-alternative)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-neutral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-alternative)";
              }}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(noticeData.id!)}
                className="w-8 h-8 p-0 hover:bg-transparent"
                style={{
                  color: "var(--color-semantic-label-alternative)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color =
                    "var(--color-semantic-label-neutral)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color =
                    "var(--color-semantic-label-alternative)";
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(noticeData.id!)}
                className="w-8 h-8 p-0 hover:bg-transparent"
                style={{
                  color: "var(--color-semantic-label-alternative)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color =
                    "var(--color-semantic-label-neutral)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color =
                    "var(--color-semantic-label-alternative)";
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 p-0 hover:bg-transparent"
              style={{
                color: "var(--color-semantic-label-alternative)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-neutral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-alternative)";
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 p-0 hover:bg-transparent mr-4"
              style={{
                color: "var(--color-semantic-label-alternative)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-neutral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  "var(--color-semantic-label-alternative)";
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        {/* 스크롤 시 나타나는 고정 헤더 */}
        <div
          className="h-[44px] flex items-center border-b absolute top-[48px] left-0 right-0 z-10 transition-all duration-300 ease-in-out"
          style={{
            borderBottomColor: "var(--color-semantic-line-normal-normal)",
            backgroundColor: "var(--color-semantic-background-normal-normal)",
            opacity: showScrollHeader ? 1 : 0,
            transform: showScrollHeader ? "translateY(0)" : "translateY(-10px)",
            pointerEvents: showScrollHeader ? "auto" : "none",
          }}
        >
          {/* 중요공지 별 아이콘 */}
          <div style={{ marginLeft: "32px" }}>
            {noticeData.is_important && (
              <Star
                className="w-5 h-5"
                style={{ color: "#3b82f6" }}
                fill="#3b82f6"
              />
            )}
          </div>

          {/* 중요공지/일반공지 배지 */}
          <div style={{ marginLeft: "16px" }}>
            {noticeData.is_important ? (
              <div
                style={{
                  width: "50px",
                  height: "24px",
                  backgroundColor: "var(--color-semantic-status-positive)",
                  borderRadius: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--typography-caption-1-bold-fontSize)",
                    fontWeight: "var(--typography-caption-1-bold-fontWeight)",
                    lineHeight: "var(--typography-caption-1-bold-lineHeight)",
                    letterSpacing:
                      "var(--typography-caption-1-bold-letterSpacing)",
                    color: "var(--color-semantic-label-inverse)",
                  }}
                >
                  중요
                </span>
              </div>
            ) : (
              <span
                style={{
                  fontSize: "var(--typography-caption-1-bold-fontSize)",
                  fontWeight: "var(--typography-caption-1-bold-fontWeight)",
                  lineHeight: "var(--typography-caption-1-bold-lineHeight)",
                  letterSpacing:
                    "var(--typography-caption-1-bold-letterSpacing)",
                  color: "var(--color-semantic-label-inverse)",
                }}
              >
                일반공지
              </span>
            )}
          </div>

          {/* 작성자 정보 */}
          <div
            style={{
              marginLeft: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor:
                  "var(--color-semantic-background-interaction-disable)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User
                className="w-2.5 h-2.5"
                style={{ color: "var(--color-semantic-label-normal)" }}
              />
            </div>
            <span
              style={{
                fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                fontWeight: "var(--typography-label-1-normal-bold-fontWeight)",
                lineHeight: "var(--typography-label-1-normal-bold-lineHeight)",
                letterSpacing:
                  "var(--typography-label-1-normal-bold-letterSpacing)",
                color: "var(--color-semantic-label-neutral)",
              }}
            >
              관리자
            </span>
            <span
              style={{
                fontSize: "var(--typography-label-2-medium-fontSize)",
                fontWeight: "var(--typography-label-2-medium-fontWeight)",
                lineHeight: "var(--typography-label-2-medium-lineHeight)",
                letterSpacing: "var(--typography-label-2-medium-letterSpacing)",
                color: "var(--color-semantic-label-neutral)",
              }}
            >
              · {new Date(noticeData.date).toLocaleDateString("ko-KR")}
            </span>
          </div>

          {/* 조회 현황 */}
          <div style={{ marginLeft: "auto", marginRight: "32px" }}>
            <div
              style={{
                width: "124px",
                height: "24px",
                backgroundColor: "var(--color-semantic-fill-normal)",
                borderRadius: "32px",
                display: "flex",
                alignItems: "center",
                paddingLeft: "6px",
                paddingRight: "8px",
                gap: "2px",
              }}
            >
              <User
                className="w-3.5 h-3.5"
                style={{ color: "var(--color-semantic-label-alternative)" }}
              />
              <span
                style={{
                  fontSize: "var(--typography-caption-1-medium-fontSize)",
                  fontWeight: "var(--typography-caption-1-medium-fontWeight)",
                  lineHeight: "var(--typography-caption-1-medium-lineHeight)",
                  letterSpacing:
                    "var(--typography-caption-1-medium-letterSpacing)",
                  color: "var(--color-semantic-label-alternative)",
                }}
              >
                45명중 3명 안읽음
              </span>
            </div>
          </div>
        </div>
        <div
          className="overflow-y-auto h-[calc(100%-48px)] w-full"
          onScroll={handleScroll}
        >
          {/* 정보 컨테이너 - 264px */}
          <div className="h-[264px] w-full">
            {/* 작성자 */}
            <div
              className="h-[44px] flex items-center px-6 border-b"
              style={{
                borderBottomColor: "var(--color-semantic-line-normal-normal)",
              }}
            >
              <span
                className="w-[80px] flex-shrink-0"
                style={{
                  color: "var(--color-semantic-label-neutral)",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "18.005px",
                  letterSpacing: "0.252px",
                }}
              >
                작성자
              </span>
              <span
                style={{
                  color: "var(--color-semantic-label-normal)",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "24px",
                  letterSpacing: "0.144px",
                }}
              >
                관리자
              </span>
            </div>

            {/* 작성일 */}
            <div
              className="h-[44px] flex items-center px-6 border-b"
              style={{
                borderBottomColor: "var(--color-semantic-line-normal-normal)",
              }}
            >
              <span
                className="w-[80px] flex-shrink-0"
                style={{
                  color: "var(--color-semantic-label-neutral)",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "18.005px",
                  letterSpacing: "0.252px",
                }}
              >
                작성일
              </span>
              <span
                style={{
                  color: "var(--color-semantic-label-normal)",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "24px",
                  letterSpacing: "0.144px",
                }}
              >
                {new Date(noticeData.date).toLocaleDateString("ko-KR")}
              </span>
            </div>

            {/* 상태 */}
            <div
              className="h-[44px] flex items-center px-6 border-b"
              style={{
                borderBottomColor: "var(--color-semantic-line-normal-normal)",
              }}
            >
              <span
                className="w-[80px] flex-shrink-0"
                style={{
                  color: "var(--color-semantic-label-neutral)",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "18.005px",
                  letterSpacing: "0.252px",
                }}
              >
                상태
              </span>
              <span
                style={{
                  color: "var(--color-semantic-label-normal)",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "24px",
                  letterSpacing: "0.144px",
                }}
              >
                {getTargetBadge()}
              </span>
            </div>

            {/* 대상 */}
            <div
              className="h-[44px] flex items-center px-6 border-b"
              style={{
                borderBottomColor: "var(--color-semantic-line-normal-normal)",
              }}
            >
              <span
                className="w-[80px] flex-shrink-0"
                style={{
                  color: "var(--color-semantic-label-neutral)",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "18.005px",
                  letterSpacing: "0.252px",
                }}
              >
                대상
              </span>
              <span
                style={{
                  color: "var(--color-semantic-label-normal)",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "24px",
                  letterSpacing: "0.144px",
                }}
              >
                전체
              </span>
            </div>

            {/* 첨부 */}
            <div
              className="h-[44px] flex items-center px-6 border-b"
              style={{
                borderBottomColor: "var(--color-semantic-line-normal-normal)",
              }}
            >
              <span
                className="w-[80px] flex-shrink-0"
                style={{
                  color: "var(--color-semantic-label-neutral)",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "18.005px",
                  letterSpacing: "0.252px",
                }}
              >
                첨부
              </span>
              <span
                style={{
                  color: "var(--color-semantic-label-normal)",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "24px",
                  letterSpacing: "0.144px",
                }}
              >
                없음
              </span>
            </div>

            {/* 조회 */}
            <div
              className="h-[44px] flex items-center px-6 border-b"
              style={{
                borderBottomColor: "var(--color-semantic-line-normal-normal)",
              }}
            >
              <span
                className="w-[80px] flex-shrink-0"
                style={{
                  color: "var(--color-semantic-label-neutral)",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "18.005px",
                  letterSpacing: "0.252px",
                }}
              >
                조회
              </span>
              <span
                style={{
                  color: "var(--color-semantic-label-normal)",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: "Pretendard",
                  lineHeight: "24px",
                  letterSpacing: "0.144px",
                }}
              >
                0회
              </span>
            </div>
          </div>
          {/* 제목 및 내용 컨테이너 */}
          <div
            style={{
              paddingTop: "25px",
              paddingBottom: "22px",
              paddingLeft: "22.11px",
              paddingRight: "22.11px",
            }}
          >
            {/* 제목 */}
            <h2
              className="mb-4"
              style={{
                color: "var(--color-semantic-label-normal)",
                fontSize: "17px",
                fontWeight: 700,
                fontFamily: "Pretendard",
                lineHeight: "24.004px",
                letterSpacing: "0px",
              }}
            >
              {noticeData.title}
            </h2>

            {/* 내용 */}
            <div
              className="whitespace-pre-wrap"
              style={{
                color: "var(--color-semantic-label-normal)",
                fontSize: "15px",
                fontWeight: 500,
                fontFamily: "Pretendard",
                lineHeight: "24px",
                letterSpacing: "0.144px",
              }}
            >
              {noticeData.body}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
