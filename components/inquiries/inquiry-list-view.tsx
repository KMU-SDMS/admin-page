"use client"

import { useState } from "react"
import { Eye, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/ui/data-table"
import { InquiryDetailModal } from "./inquiry-detail-modal"
import type { Inquiry } from "@/lib/types"

interface InquiryWithStudent extends Inquiry {
  studentName: string
}

interface InquiryListViewProps {
  inquiries: InquiryWithStudent[]
  isLoading: boolean
  onStatusChange: (inquiryId: number, newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED") => Promise<void>
}

export function InquiryListView({ inquiries, isLoading, onStatusChange }: InquiryListViewProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithStudent | null>(null)

  const getStatusBadge = (status: string) => {
    const variants = {
      OPEN: { variant: "default" as const, label: "접수" },
      IN_PROGRESS: { variant: "secondary" as const, label: "처리중" },
      RESOLVED: { variant: "outline" as const, label: "완료" },
    }
    const config = variants[status as keyof typeof variants] || variants.OPEN
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getNextStatus = (currentStatus: string): "OPEN" | "IN_PROGRESS" | "RESOLVED" | null => {
    switch (currentStatus) {
      case "OPEN":
        return "IN_PROGRESS"
      case "IN_PROGRESS":
        return "RESOLVED"
      default:
        return null
    }
  }

  const handleStatusAdvance = async (inquiry: InquiryWithStudent) => {
    const nextStatus = getNextStatus(inquiry.status)
    if (nextStatus) {
      await onStatusChange(inquiry.id, nextStatus)
    }
  }

  const columns: Column<InquiryWithStudent>[] = [
    {
      key: "title",
      label: "제목",
      sortable: true,
      render: (inquiry) => (
        <div className="max-w-xs">
          <div className="font-medium line-clamp-1">{inquiry.title}</div>
          {inquiry.content && <div className="text-sm text-muted-foreground line-clamp-1 mt-1">{inquiry.content}</div>}
        </div>
      ),
    },
    {
      key: "category",
      label: "카테고리",
      sortable: true,
      render: (inquiry) => <Badge variant="outline">{inquiry.category}</Badge>,
    },
    {
      key: "studentName",
      label: "학생명",
      sortable: true,
    },
    {
      key: "status",
      label: "상태",
      sortable: true,
      render: (inquiry) => getStatusBadge(inquiry.status),
    },
    {
      key: "createdAt",
      label: "접수일시",
      sortable: true,
      render: (inquiry) => new Date(inquiry.createdAt).toLocaleString(),
    },
    {
      key: "updatedAt",
      label: "수정일시",
      sortable: true,
      render: (inquiry) => (inquiry.updatedAt ? new Date(inquiry.updatedAt).toLocaleString() : "-"),
    },
    {
      key: "actions",
      label: "작업",
      render: (inquiry) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedInquiry(inquiry)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {getNextStatus(inquiry.status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusAdvance(inquiry)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>문의 목록 ({inquiries.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={inquiries}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="문의가 없습니다."
            onRowClick={setSelectedInquiry}
          />
        </CardContent>
      </Card>

      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  )
}
