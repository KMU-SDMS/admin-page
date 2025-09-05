"use client"

import { useState } from "react"
import { MessageSquare, User, Tag, Calendar, Clock, ChevronRight, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Inquiry } from "@/lib/types"

interface InquiryWithStudent extends Inquiry {
  studentName: string
}

interface InquiryDetailModalProps {
  inquiry: InquiryWithStudent
  onClose: () => void
  onStatusChange: (inquiryId: number, newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED") => Promise<void>
}

export function InquiryDetailModal({ inquiry, onClose, onStatusChange }: InquiryDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(inquiry.status)

  const getStatusBadge = (status: string) => {
    const variants = {
      OPEN: { variant: "default" as const, label: "접수", color: "text-blue-600" },
      IN_PROGRESS: { variant: "secondary" as const, label: "처리중", color: "text-orange-600" },
      RESOLVED: { variant: "outline" as const, label: "완료", color: "text-green-600" },
    }
    const config = variants[status as keyof typeof variants] || variants.OPEN
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleStatusUpdate = async () => {
    if (selectedStatus === inquiry.status) return

    setIsUpdating(true)
    try {
      await onStatusChange(inquiry.id, selectedStatus as "OPEN" | "IN_PROGRESS" | "RESOLVED")
      onClose()
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            문의 상세 정보
          </DialogTitle>
          <DialogDescription>문의 내용을 확인하고 상태를 변경할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{inquiry.title}</h3>
              {getStatusBadge(inquiry.status)}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>학생: {inquiry.studentName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>카테고리: {inquiry.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>접수일: {new Date(inquiry.createdAt).toLocaleString()}</span>
              </div>
              {inquiry.updatedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>수정일: {new Date(inquiry.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Content */}
          {inquiry.content && (
            <div className="space-y-2">
              <h4 className="font-medium">문의 내용</h4>
              <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">{inquiry.content}</div>
            </div>
          )}

          <Separator />

          {/* Status Management */}
          <div className="space-y-4">
            <h4 className="font-medium">상태 관리</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">접수</SelectItem>
                    <SelectItem value="IN_PROGRESS">처리중</SelectItem>
                    <SelectItem value="RESOLVED">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStatusUpdate} disabled={selectedStatus === inquiry.status || isUpdating}>
                {isUpdating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    업데이트 중...
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 mr-2" />
                    상태 변경
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
