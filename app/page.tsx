"use client";

import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  ClipboardCheck,
  Megaphone,
  Package,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useNotices } from "@/hooks/use-notices";
import { useRooms } from "@/hooks/use-rooms";

export default function HomePage() {
  const { stats, topStudents, isLoading: statsLoading } = useDashboardStats();
  const {
    data: notices,
    isLoading: noticesLoading,
    error: noticesError,
  } = useNotices({ limit: 3 });
  const { data: rooms } = useRooms();

  const getTargetDisplay = (notice: any) => {
    if (notice.target === "ALL") return "전체";
    if (notice.target === "FLOOR") return `${notice.floor}층`;
    if (notice.target === "ROOM") {
      const room = rooms.find((r) => r.id === notice.roomId);
      return room ? room.name : `호실 ${notice.roomId}`;
    }
    return notice.target;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">
            기숙사 관리 시스템 현황을 한눈에 확인하세요.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-center p-6">
                  <LoadingSpinner />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatCard
                title="총 학생 수"
                value={stats.totalStudents}
                icon={<Users className="h-4 w-4" />}
              />
              <StatCard
                title="출석"
                value={stats.presentCount}
                icon={<UserCheck className="h-4 w-4" />}
              />
              <StatCard
                title="결석"
                value={stats.absentCount}
                icon={<UserX className="h-4 w-4" />}
              />
              <StatCard
                title="외출/외박"
                value={stats.outLeaveCount}
                icon={<UserMinus className="h-4 w-4" />}
              />
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Students by Points */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>상/벌점 Top 5</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {topStudents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      포인트 데이터가 없습니다.
                    </p>
                  ) : (
                    topStudents.map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.studentNo}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-2">
                            <Badge
                              variant="secondary"
                              className="text-green-600"
                            >
                              상점 {student.meritPoints}
                            </Badge>
                            <Badge variant="secondary" className="text-red-600">
                              벌점 {student.demeritPoints}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mt-1">
                            총점: {student.totalScore}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notices */}
          <Card>
            <CardHeader>
              <CardTitle>최근 공지사항</CardTitle>
            </CardHeader>
            <CardContent>
              {noticesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : noticesError ? (
                <ErrorMessage message={noticesError} />
              ) : (
                <div className="space-y-4">
                  {notices.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      공지사항이 없습니다.
                    </p>
                  ) : (
                    notices.map((notice) => (
                      <div
                        key={notice.id}
                        className="space-y-2 p-3 rounded-lg border"
                      >
                        <h4 className="font-medium line-clamp-2">
                          {notice.title}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <Badge variant="outline">
                            {getTargetDisplay(notice)}
                          </Badge>
                          <span>
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button asChild className="h-auto flex-col gap-2 p-6">
                <Link href="/rollcall">
                  <ClipboardCheck className="h-6 w-6" />
                  <span>오늘 점호 열기</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto flex-col gap-2 p-6 bg-transparent"
              >
                <Link href="/notices">
                  <Megaphone className="h-6 w-6" />
                  <span>공지 작성</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto flex-col gap-2 p-6 bg-transparent"
              >
                <Link href="/packages">
                  <Package className="h-6 w-6" />
                  <span>택배 수령 처리</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
