"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Eye, Send } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NoticePreviewModal } from "@/components/notices/notice-preview-modal";
import { RecentNoticesList } from "@/components/notices/recent-notices-list";
import { useNotices } from "@/hooks/use-notices";
import { useToast } from "@/hooks/use-toast";
import type { Notice } from "@/lib/types";

interface NoticeForm {
  title: string;
  content: string;
  is_important: boolean;
}

export default function NoticesPage() {
  const [form, setForm] = useState<NoticeForm>({
    title: "",
    content: "",
    is_important: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const { toast } = useToast();
  const {
    data: notices,
    isLoading: noticesLoading,
    refetch: refetchNotices,
    mutate: mutateNotice,
  } = useNotices();

  const handleInputChange = (field: keyof NoticeForm, value: any) => {
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

    setIsSubmitting(true);

    try {
      await mutateNotice({
        title: form.title.trim(),
        content: form.content.trim(),
        is_important: form.is_important,
      });

      toast({
        title: "공지 작성 완료",
        description: "공지사항이 성공적으로 작성되었습니다.",
      });

      // Reset form
      setForm({
        title: "",
        content: "",
        is_important: false,
      });
      setShowModal(false);
    } catch (error) {
      toast({
        title: "공지 작성 실패",
        description:
          error instanceof Error ? error.message : "공지 작성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetDisplay = (notice: Notice) => {
    return notice.is_important ? "중요공지" : "일반공지";
  };

  const isFormValid = form.title.trim() && form.content.trim();

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">공지 시스템</h1>
          <p className="text-muted-foreground">기숙사 공지사항 작성 및 관리</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Notice Creation Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  공지 작성
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                      id="title"
                      placeholder="공지사항 제목을 입력하세요"
                      value={form.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      maxLength={100}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {form.title.length}/100
                    </div>
                  </div>

                  {/* Important Notice Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_important"
                      checked={form.is_important}
                      onCheckedChange={(checked) =>
                        handleInputChange("is_important", checked)
                      }
                    />
                    <Label
                      htmlFor="is_important"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      중요공지로 설정
                    </Label>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                      id="content"
                      placeholder="공지사항 내용을 입력하세요"
                      value={form.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      rows={8}
                      maxLength={2000}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {form.content.length}/2000
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(true)}
                      disabled={!isFormValid}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      미리보기
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          작성 중...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          공지 작성
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notices */}
          <div>
            <RecentNoticesList
              notices={notices}
              isLoading={noticesLoading}
              getTargetDisplay={getTargetDisplay}
              onRefresh={refetchNotices}
              onNoticeClick={handleNoticeClick}
            />
          </div>
        </div>

        {/* Notice Preview Modal */}
        <NoticePreviewModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedNotice(null);
          }}
          noticeData={
            selectedNotice
              ? {
                  title: selectedNotice.title,
                  body: selectedNotice.content,
                  is_important: selectedNotice.is_important,
                  date: selectedNotice.date,
                }
              : {
                  title: form.title,
                  body: form.content,
                  is_important: form.is_important,
                  date: new Date().toISOString().split("T")[0],
                }
          }
        />
      </div>
    </Layout>
  );
}
