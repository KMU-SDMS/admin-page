"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import type { Notice } from "@/lib/types";
import { noticesApi } from "@/lib/api";
import { X, MoreHorizontal, Maximize2, Minimize2, Send } from "lucide-react";

interface NoticeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: Notice | null;
  onSuccess: () => void;
}

interface EditForm {
  title: string;
  content: string;
  is_important: boolean;
}

export function NoticeEditModal({
  isOpen,
  onClose,
  notice,
  onSuccess,
}: NoticeEditModalProps) {
  const [form, setForm] = useState<EditForm>({
    title: "",
    content: "",
    is_important: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { toast } = useToast();

  // 폼 초기화
  useEffect(() => {
    if (notice) {
      setForm({
        title: notice.title,
        content: notice.content,
        is_important: notice.is_important,
      });
    }
  }, [notice]);

  const handleInputChange = (
    field: keyof EditForm,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!notice) return;

    setIsSubmitting(true);

    try {
      await noticesApi.update({
        id: notice.id,
        title: form.title.trim(),
        content: form.content.trim(),
        is_important: form.is_important,
      });

      toast({
        title: "공지 수정 완료",
        description: "공지사항이 성공적으로 수정되었습니다.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "공지 수정 실패",
        description:
          error instanceof Error ? error.message : "공지 수정에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = form.title.trim() && form.content.trim();

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const modalStyles = isExpanded
    ? {
        width: "1558px",
        minWidth: "1558px",
        maxWidth: "1558px",
        height: "880px",
        minHeight: "880px",
        maxHeight: "880px",
        top: "100px",
        left: "181px",
        bottom: "auto",
        right: "auto",
      }
    : {
        width: "560px",
        minWidth: "560px",
        maxWidth: "560px",
        height: "700px",
        minHeight: "700px",
        maxHeight: "700px",
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
          backgroundColor: "var(--color-semantic-background-normal-normal)",
          border: "1px solid var(--color-semantic-line-normal-normal)",
          color: "var(--color-semantic-label-normal)",
          ...modalStyles,
        }}
      >
        {/* 모달 헤더 */}
        <DialogHeader
          className="flex flex-row items-center justify-end px-0 py-0 m-0 gap-0 border-b"
          style={{
            height: "48px",
            minHeight: "48px",
            maxHeight: "48px",
            backgroundColor:
              "var(--color-semantic-background-normal-alternative)",
            borderBottomColor: "var(--color-semantic-line-normal-normal)",
          }}
        >
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
        {/* 내용 영역 */}
        <div className="overflow-y-auto h-[calc(100%-48px-72px)] w-full">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {isExpanded ? (
              <>
                {/* 확장 모드: 정보 컨테이너 */}
                <div>
                  {/* 작성자 */}
                  <div
                    className="h-[44px] flex items-center px-6 border-b"
                    style={{
                      borderBottomColor:
                        "var(--color-semantic-line-normal-normal)",
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
                      borderBottomColor:
                        "var(--color-semantic-line-normal-normal)",
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
                      {notice
                        ? new Date(notice.date).toLocaleDateString("ko-KR")
                        : new Date().toLocaleDateString("ko-KR")}
                    </span>
                  </div>

                  {/* 중요 여부 */}
                  <div
                    className="h-[44px] flex items-center px-6 border-b"
                    style={{
                      borderBottomColor:
                        "var(--color-semantic-line-normal-normal)",
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
                      상단고정 여부
                    </span>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-is_important-expanded"
                        checked={form.is_important}
                        onCheckedChange={(checked) =>
                          handleInputChange("is_important", checked)
                        }
                      />
                      <label
                        htmlFor="edit-is_important-expanded"
                        className="cursor-pointer select-none"
                        style={{
                          color: "var(--color-semantic-label-normal)",
                          fontSize: "15px",
                          fontWeight: 500,
                          fontFamily: "Pretendard",
                          lineHeight: "24px",
                          letterSpacing: "0.144px",
                        }}
                      >
                        상단고정공지
                      </label>
                    </div>
                  </div>

                  {/* 제목 */}
                  <div
                    className="h-[44px] flex items-center px-6 border-b"
                    style={{
                      borderBottomColor:
                        "var(--color-semantic-line-normal-normal)",
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
                      제목
                    </span>
                    <Input
                      id="edit-title-expanded"
                      placeholder="제목을 입력하세요"
                      value={form.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      maxLength={100}
                      className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                      style={{
                        backgroundColor: "transparent",
                        color: "var(--color-semantic-label-normal)",
                        fontSize: "15px",
                        fontWeight: 500,
                        fontFamily: "Pretendard",
                        lineHeight: "24px",
                        letterSpacing: "0.144px",
                      }}
                    />
                  </div>
                </div>

                {/* 내용 영역 */}
                <div
                  className="flex-1 flex flex-col"
                  style={{
                    paddingTop: "25px",
                    paddingBottom: "22px",
                    paddingLeft: "22.11px",
                    paddingRight: "22.11px",
                  }}
                >
                  <Textarea
                    id="edit-content-expanded"
                    placeholder="공지사항 내용을 입력하세요"
                    value={form.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    maxLength={2000}
                    className="flex-1 border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--color-semantic-label-normal)",
                      fontSize: "15px",
                      fontWeight: 500,
                      fontFamily: "Pretendard",
                      lineHeight: "24px",
                      letterSpacing: "0.144px",
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                {/* 축소 모드: 기존 레이아웃 */}
                {/* 제목 영역 - 44px */}
                <div
                  className="px-6 border-b flex items-center"
                  style={{
                    height: "44px",
                    minHeight: "44px",
                    maxHeight: "44px",
                    borderBottomColor:
                      "var(--color-semantic-line-normal-normal)",
                  }}
                >
                  <Input
                    id="edit-title"
                    placeholder="제목을 입력하세요"
                    value={form.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    maxLength={100}
                    className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--color-semantic-label-normal)",
                      fontSize: "17px",
                      fontWeight: 700,
                      fontFamily: "Pretendard",
                      lineHeight: "24.004px",
                      letterSpacing: "0px",
                    }}
                  />
                </div>

                {/* 상단고정공지 체크박스 영역 */}
                <div
                  className="px-6 py-4 border-b flex items-center space-x-2"
                  style={{
                    borderBottomColor:
                      "var(--color-semantic-line-normal-normal)",
                  }}
                >
                  <Checkbox
                    id="edit-is_important"
                    checked={form.is_important}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_important", checked)
                    }
                  />
                  <label
                    htmlFor="edit-is_important"
                    className="cursor-pointer select-none"
                    style={{
                      color: "var(--color-semantic-label-normal)",
                      fontSize: "15px",
                      fontWeight: 500,
                      fontFamily: "Pretendard",
                      lineHeight: "24px",
                      letterSpacing: "0.144px",
                    }}
                  >
                    중요공지
                  </label>
                </div>

                {/* 내용 영역 */}
                <div className="flex-1 flex flex-col">
                  <Textarea
                    id="edit-content"
                    placeholder="공지사항 내용을 입력하세요"
                    value={form.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    maxLength={2000}
                    className="flex-1 border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--color-semantic-label-normal)",
                      fontSize: "15px",
                      fontWeight: 500,
                      fontFamily: "Pretendard",
                      lineHeight: "24px",
                      letterSpacing: "0.144px",
                      padding: "25px 22.11px 22px 22.11px",
                    }}
                  />
                </div>
              </>
            )}
          </form>
        </div>

        {/* 게시 박스 - 72px */}
        <div
          className="border-t flex items-center justify-end"
          style={{
            height: "72px",
            minHeight: "72px",
            maxHeight: "72px",
            borderTopColor: "var(--color-semantic-line-normal-normal)",
            paddingRight: "24px",
          }}
        >
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="gap-2"
            style={{
              width: "100px",
              height: "40px",
              borderRadius: "40px",
              backgroundColor: "var(--color-semantic-primary-normal)",
              color: "var(--color-semantic-inverse-label)",
            }}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                수정 중...
              </>
            ) : (
              <>
                <Send
                  className="w-4 h-4"
                  style={{
                    color: "var(--color-semantic-static-white)",
                  }}
                />
                게시
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
