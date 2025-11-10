"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import type { Student } from "@/lib/types";

interface StudentNotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSend: (payload: { studentNos: string[]; title: string; content: string }) => Promise<void> | void;
}

export function StudentNotifyModal({
  isOpen,
  onClose,
  students,
  onSend,
}: StudentNotifyModalProps) {
  const [selectedNos, setSelectedNos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const keyword = search.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(keyword) ||
        String(s.studentIdNum).toLowerCase().includes(keyword)
    );
  }, [students, search]);

  const sortedStudents = useMemo(() => {
    const selectedSet = new Set(selectedNos);
    return [...filteredStudents].sort((a, b) => {
      const aSel = selectedSet.has(a.studentIdNum) ? 1 : 0;
      const bSel = selectedSet.has(b.studentIdNum) ? 1 : 0;
      if (aSel !== bSel) return bSel - aSel; // 선택된 항목이 위로
      return a.name.localeCompare(b.name, "ko");
    });
  }, [filteredStudents, selectedNos]);

  const toggleNo = (no: string) => {
    setSelectedNos((prev) =>
      prev.includes(no) ? prev.filter((n) => n !== no) : [...prev, no]
    );
  };

  const handleSubmit = async () => {
    if (selectedNos.length === 0 || !title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await onSend({
        studentNos: selectedNos,
        title: title.trim(),
        content: content.trim(),
      });
      setSelectedNos([]);
      setTitle("");
      setContent("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary =
    selectedNos.length === 0
      ? "대상자 선택"
      : selectedNos.length === 1
      ? (() => {
          const s = students.find((x) => x.studentIdNum === selectedNos[0]);
          return s ? `${s.name} (${s.studentIdNum})` : "1명 선택";
        })()
      : `${selectedNos.length}명 선택`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>개인 알림 전송</DialogTitle>
          <DialogDescription>
            학생을 선택하고 제목과 내용을 입력해 전송하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* 대상 선택 (다중 선택 드롭다운) */}
          <div className="grid gap-2">
            <Label>대상 학생</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <span>{summary}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[420px] p-3">
                <div className="grid gap-2">
                  <Input
                    placeholder="이름 또는 학번 검색"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="max-h-64 overflow-auto space-y-2">
                    {sortedStudents.map((s) => {
                      const checked = selectedNos.includes(s.studentIdNum);
                      return (
                        <button
                          key={s.studentIdNum}
                          onClick={() => toggleNo(s.studentIdNum)}
                          className="w-full flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={checked}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={() => toggleNo(s.studentIdNum)}
                            />
                            <span className="text-sm">
                              {s.name} ({s.studentIdNum}) - {s.roomNumber}호
                            </span>
                          </div>
                        </button>
                      );
                    })}
                    {sortedStudents.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-6">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                  {selectedNos.length > 0 && (
                    <div className="text-right">
                      <Button
                        size="sm"
                        onClick={() => setOpen(false)}
                        style={{
                          backgroundColor: "var(--color-semantic-primary-normal)",
                          color: "var(--color-semantic-static-white)",
                        }}
                      >
                        선택 완료
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 제목 */}
          <div className="grid gap-2">
            <Label htmlFor="notify-title">제목</Label>
            <Input
              id="notify-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="개인 알림"
            />
          </div>

          {/* 내용 */}
          <div className="grid gap-2">
            <Label htmlFor="notify-content">내용</Label>
            <Textarea
              id="notify-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="청구서 확인 부탁드립니다."
              className="min-h-28"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || selectedNos.length === 0 || !title.trim() || !content.trim()
            }
            style={{
              backgroundColor: "var(--color-semantic-primary-normal)",
              color: "var(--color-semantic-static-white)",
            }}
          >
            {isSubmitting ? "전송 중..." : "전송"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


