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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NoticePreview } from "@/components/notices/notice-preview";
import { RecentNoticesList } from "@/components/notices/recent-notices-list";
import { useNotices } from "@/hooks/use-notices";
import { useRooms } from "@/hooks/use-rooms";
import { useToast } from "@/hooks/use-toast";

interface NoticeForm {
  title: string;
  body: string;
  target: "ALL" | "FLOOR" | "ROOM" | "";
  floor?: number;
  roomId?: number;
}

export default function NoticesPage() {
  const [form, setForm] = useState<NoticeForm>({
    title: "",
    body: "",
    target: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { toast } = useToast();
  const {
    data: notices,
    isLoading: noticesLoading,
    refetch: refetchNotices,
    mutate: mutateNotice,
  } = useNotices();
  const { data: rooms } = useRooms();

  // Get unique floors for selection
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort(
    (a, b) => a - b,
  );

  const handleInputChange = (field: keyof NoticeForm, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Reset dependent fields when target changes
      if (field === "target") {
        delete updated.floor;
        delete updated.roomId;
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.body.trim() || !form.target) {
      toast({
        title: "입력 오류",
        description: "제목, 내용, 대상을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (form.target === "FLOOR" && !form.floor) {
      toast({
        title: "입력 오류",
        description: "층을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (form.target === "ROOM" && !form.roomId) {
      toast({
        title: "입력 오류",
        description: "호실을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await mutateNotice({
        title: form.title.trim(),
        body: form.body.trim(),
        target: form.target,
        floor: form.target === "FLOOR" ? form.floor : undefined,
        roomId: form.target === "ROOM" ? form.roomId : undefined,
      });

      toast({
        title: "공지 작성 완료",
        description: "공지사항이 성공적으로 작성되었습니다.",
      });

      // Reset form
      setForm({
        title: "",
        body: "",
        target: "",
      });
      setShowPreview(false);
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

  const getTargetDisplay = (notice: any) => {
    if (notice.target === "ALL") return "전체";
    if (notice.target === "FLOOR") return `${notice.floor}층`;
    if (notice.target === "ROOM") {
      const room = rooms.find((r) => r.id === notice.roomId);
      return room ? room.name : `호실 ${notice.roomId}`;
    }
    return notice.target;
  };

  const isFormValid = form.title.trim() && form.body.trim() && form.target;

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

                  {/* Target Selection */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>대상</Label>
                      <Select
                        value={form.target}
                        onValueChange={(value) =>
                          handleInputChange("target", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="공지 대상 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">전체</SelectItem>
                          <SelectItem value="FLOOR">특정 층</SelectItem>
                          <SelectItem value="ROOM">특정 호실</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.target === "FLOOR" && (
                      <div className="space-y-2">
                        <Label>층</Label>
                        <Select
                          value={form.floor?.toString() || ""}
                          onValueChange={(value) =>
                            handleInputChange("floor", Number.parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="층 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {floors.map((floor) => (
                              <SelectItem key={floor} value={floor.toString()}>
                                {floor}층
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {form.target === "ROOM" && (
                      <div className="space-y-2">
                        <Label>호실</Label>
                        <Select
                          value={form.roomId?.toString() || ""}
                          onValueChange={(value) =>
                            handleInputChange("roomId", Number.parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="호실 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms.map((room) => (
                              <SelectItem
                                key={room.id}
                                value={room.id.toString()}
                              >
                                {room.name} ({room.floor}층)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="space-y-2">
                    <Label htmlFor="body">내용</Label>
                    <Textarea
                      id="body"
                      placeholder="공지사항 내용을 입력하세요"
                      value={form.body}
                      onChange={(e) =>
                        handleInputChange("body", e.target.value)
                      }
                      rows={8}
                      maxLength={2000}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {form.body.length}/2000
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                      disabled={!isFormValid}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? "편집" : "미리보기"}
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

            {/* Preview */}
            {showPreview && isFormValid && (
              <NoticePreview
                title={form.title}
                body={form.body}
                target={form.target}
                floor={form.floor}
                roomId={form.roomId}
                rooms={rooms}
              />
            )}
          </div>

          {/* Recent Notices */}
          <div>
            <RecentNoticesList
              notices={notices}
              isLoading={noticesLoading}
              getTargetDisplay={getTargetDisplay}
              onRefresh={refetchNotices}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
