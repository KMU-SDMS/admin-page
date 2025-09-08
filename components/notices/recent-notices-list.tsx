"use client";

import { RefreshCw, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import type { Notice } from "@/lib/types";

interface RecentNoticesListProps {
  notices: Notice[];
  isLoading: boolean;
  getTargetDisplay: (notice: Notice) => string;
  onRefresh: () => void;
}

export function RecentNoticesList({
  notices,
  isLoading,
  getTargetDisplay,
  onRefresh,
}: RecentNoticesListProps) {
  const getTargetBadge = (notice: Notice) => {
    if (notice.target === "ALL") return <Badge variant="default">전체</Badge>;
    if (notice.target === "FLOOR")
      return <Badge variant="secondary">{notice.floor}층</Badge>;
    if (notice.target === "ROOM") return <Badge variant="outline">호실</Badge>;
    return null;
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            최근 공지사항
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : notices.length === 0 ? (
          <EmptyState
            title="공지사항이 없습니다"
            description="아직 작성된 공지사항이 없습니다."
            icon={<FileText className="h-8 w-8" />}
            className="py-8"
          />
        ) : (
          <div className="space-y-4">
            {notices.slice(0, 10).map((notice) => (
              <div
                key={notice.id}
                className="space-y-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-2">
                  <h4 className="font-medium line-clamp-2 text-sm leading-relaxed">
                    {notice.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    {getTargetBadge(notice)}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {notice.body && (
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notice.body}
                  </div>
                )}
              </div>
            ))}
            {notices.length > 10 && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                총 {notices.length}개의 공지사항 중 최근 10개 표시
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
