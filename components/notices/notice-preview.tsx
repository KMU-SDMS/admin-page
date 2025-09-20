"use client";

import { Eye, Megaphone, Calendar, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Room } from "@/lib/types";

interface NoticePreviewProps {
  title: string;
  body: string;
  target: "ALL" | "FLOOR" | "ROOM";
  floor?: number;
  roomId?: number;
  rooms: Room[];
}

export function NoticePreview({
  title,
  body,
  target,
  floor,
  roomId,
  rooms,
}: NoticePreviewProps) {
  const getTargetDisplay = () => {
    if (target === "ALL") return "전체";
    if (target === "FLOOR") return `${floor}층`;
    if (target === "ROOM") {
      const room = rooms.find((r) => r.id === roomId);
      return room ? room.name : `호실 ${roomId}`;
    }
    return target;
  };

  const getTargetBadge = () => {
    if (target === "ALL") return <Badge variant="default">전체</Badge>;
    if (target === "FLOOR") return <Badge variant="secondary">{floor}층</Badge>;
    if (target === "ROOM") {
      const room = rooms.find((r) => r.id === roomId);
      return <Badge variant="outline">{room?.name || `호실 ${roomId}`}</Badge>;
    }
    return null;
  };

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-responsive-base">
          <Eye className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          미리보기
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {/* Notice Header */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
              <span className="text-responsive-base font-medium text-primary">
                공지사항
              </span>
            </div>
            <h2 className="text-responsive-xl font-bold text-balance leading-tight">
              {title}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-responsive-base text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                <span>대상: {getTargetDisplay()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">{getTargetBadge()}</div>
            </div>
          </div>

          <Separator className="my-4 sm:my-6" />

          {/* Notice Body */}
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-responsive-base leading-relaxed">
              {body}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
