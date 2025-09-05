"use client"

import { useState, useMemo } from "react"
import { CalendarIcon, RefreshCw, Users, Award } from "lucide-react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"
import { ExportCsvButton } from "@/components/ui/export-csv-button"
import { useRooms } from "@/hooks/use-rooms"
import { useStudents } from "@/hooks/use-students"
import { useRollcalls } from "@/hooks/use-rollcalls"
import { RollCallChecklist } from "@/components/rollcall/rollcall-checklist"
import { PointsManagement } from "@/components/rollcall/points-management"
import { RoomGridView } from "@/components/rollcall/room-grid-view"

export default function RollCallPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all")
  const [nameSearch, setNameSearch] = useState("")
  const [unconfirmedOnly, setUnconfirmedOnly] = useState(false)

  const { data: rooms, isLoading: roomsLoading } = useRooms()
  const {
    data: students,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useStudents({
    roomId: selectedRoomId === "all" ? undefined : Number.parseInt(selectedRoomId),
    name: nameSearch || undefined,
  })
  const {
    data: rollcalls,
    isLoading: rollcallsLoading,
    refetch: refetchRollcalls,
    mutate: mutateRollcall,
  } = useRollcalls({
    date: selectedDate,
    roomId: selectedRoomId === "all" ? undefined : Number.parseInt(selectedRoomId),
    name: nameSearch || undefined,
    present: unconfirmedOnly ? false : undefined,
  })

  const filteredStudents = useMemo(() => {
    if (!unconfirmedOnly) return students
    return students.filter((student) => {
      const rollcall = rollcalls.find((r) => r.studentId === student.id)
      return !rollcall || !rollcall.present
    })
  }, [students, rollcalls, unconfirmedOnly])

  const handleRefresh = () => {
    refetchStudents()
    refetchRollcalls()
  }

  const csvHeaders = [
    { key: "name", label: "학생명" },
    { key: "studentNo", label: "학번" },
    { key: "roomName", label: "호실" },
    { key: "status", label: "상태" },
    { key: "present", label: "출석" },
    { key: "note", label: "비고" },
  ]

  const csvData = filteredStudents.map((student) => {
    const room = rooms.find((r) => r.id === student.roomId)
    const rollcall = rollcalls.find((r) => r.studentId === student.id)
    return {
      name: student.name,
      studentNo: student.studentNo,
      roomName: room?.name || "",
      status: student.status === "IN" ? "재실" : student.status === "OUT" ? "외출" : "외박",
      present: rollcall?.present ? "출석" : "결석",
      note: rollcall?.note || "",
    }
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">점호 관리</h1>
          <p className="text-muted-foreground">학생 출석 확인 및 상/벌점 관리</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              필터 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-2">
                <Label htmlFor="date">날짜</Label>
                <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>호실</Label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체 호실" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 호실</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name} ({room.floor}층)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>학생명 검색</Label>
                <SearchInput placeholder="학생명 입력..." value={nameSearch} onChange={setNameSearch} />
              </div>

              <div className="space-y-2">
                <Label>미확인만 표시</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="unconfirmed-only" checked={unconfirmedOnly} onCheckedChange={setUnconfirmedOnly} />
                  <Label htmlFor="unconfirmed-only" className="text-sm">
                    미확인만
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>작업</Label>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    새로고침
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>내보내기</Label>
                <div className="pt-2">
                  <ExportCsvButton
                    data={csvData}
                    filename="rollcall"
                    headers={csvHeaders}
                    disabled={studentsLoading || rollcallsLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
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
                  rooms={rooms}
                  students={students}
                  rollcalls={rollcalls}
                  selectedDate={selectedDate}
                  onUpdateRollcall={mutateRollcall}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist">
            <RollCallChecklist
              students={filteredStudents}
              rollcalls={rollcalls}
              rooms={rooms}
              isLoading={studentsLoading || rollcallsLoading}
              onUpdateRollcall={mutateRollcall}
              selectedDate={selectedDate}
            />
          </TabsContent>

          <TabsContent value="points">
            <PointsManagement students={students} rooms={rooms} isLoading={studentsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
