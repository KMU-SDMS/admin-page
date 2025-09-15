"use client";

import { useState, useMemo } from "react";
import { Users, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRooms } from "@/hooks/use-rooms";
import { useStudents } from "@/hooks/use-students";
import { useRollcalls } from "@/hooks/use-rollcalls";
import { RollCallChecklist } from "@/components/rollcall/rollcall-checklist";
import { PointsManagement } from "@/components/rollcall/points-management";
import { RoomGridView } from "@/components/rollcall/room-grid-view";

interface RollCallPageClientProps {
  initialRooms: any[];
  initialStudents: any[];
  initialRollcalls: any[];
}

export function RollCallPageClient({
  initialRooms,
  initialStudents,
  initialRollcalls,
}: RollCallPageClientProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");
  const [nameSearch, setNameSearch] = useState("");
  const [unconfirmedOnly, setUnconfirmedOnly] = useState(false);

  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const {
    data: students,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useStudents({
    roomId:
      selectedRoomId === "all" ? undefined : Number.parseInt(selectedRoomId),
    name: nameSearch || undefined,
  });
  const {
    data: rollcalls,
    isLoading: rollcallsLoading,
    refetch: refetchRollcalls,
    mutate: mutateRollcall,
  } = useRollcalls({
    date: selectedDate,
    roomId:
      selectedRoomId === "all" ? undefined : Number.parseInt(selectedRoomId),
    name: nameSearch || undefined,
    present: unconfirmedOnly ? false : undefined,
  });

  // Use initial data if hooks haven't loaded yet
  const displayRooms = rooms.length > 0 ? rooms : initialRooms;
  const displayStudents = students.length > 0 ? students : initialStudents;
  const displayRollcalls = rollcalls.length > 0 ? rollcalls : initialRollcalls;

  const filteredStudents = useMemo(() => {
    if (!unconfirmedOnly) return displayStudents;
    return displayStudents.filter((student) => {
      const rollcall = displayRollcalls.find((r) => r.studentId === student.id);
      return !rollcall || !rollcall.present;
    });
  }, [displayStudents, displayRollcalls, unconfirmedOnly]);

  const handleRefresh = () => {
    refetchStudents();
    refetchRollcalls();
  };

  return (
    <Tabs defaultValue="room-grid" className="space-y-4">
      <TabsList>
        <TabsTrigger value="room-grid" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          호실별 점호
        </TabsTrigger>
        <TabsTrigger value="checklist" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          출석 체크리스트
        </TabsTrigger>
        <TabsTrigger value="points" className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          상/벌점 관리
        </TabsTrigger>
      </TabsList>

      <TabsContent value="room-grid">
        <Card>
          <CardHeader>
            <CardTitle>호실별 점호 현황</CardTitle>
            <p className="text-sm text-muted-foreground">
              호실을 클릭하여 학생 출석 확인 및 상벌점을 부여할 수 있습니다.
            </p>
          </CardHeader>
          <CardContent>
            <RoomGridView
              rooms={displayRooms}
              students={displayStudents}
              rollcalls={displayRollcalls}
              selectedDate={selectedDate}
              onUpdateRollcall={mutateRollcall}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="checklist">
        <RollCallChecklist
          students={filteredStudents}
          rollcalls={displayRollcalls}
          rooms={displayRooms}
          isLoading={studentsLoading || rollcallsLoading}
          onUpdateRollcall={mutateRollcall}
          selectedDate={selectedDate}
        />
      </TabsContent>

      <TabsContent value="points">
        <PointsManagement
          students={displayStudents}
          rooms={displayRooms}
          isLoading={studentsLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
