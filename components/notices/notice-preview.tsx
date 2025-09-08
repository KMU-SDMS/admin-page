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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          미리보기
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Notice Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">공지사항</span>
            </div>
            <h2 className="text-xl font-bold text-balance">{title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>대상: {getTargetDisplay()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              {getTargetBadge()}
            </div>
          </div>

          <Separator />

          {/* Notice Body */}
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {body}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
