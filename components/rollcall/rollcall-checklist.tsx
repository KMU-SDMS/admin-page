"use client"

import { useState } from "react"
import { Save, AlertCircle, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/hooks/use-toast"
import { AttendanceStatusButtons, type AttendanceStatus } from "@/components/rollcall/attendance-status-buttons"
import type { Student, Rollcall, Room } from "@/lib/types"

interface RollCallChecklistProps {
  students: Student[]
  rollcalls: Rollcall[]
  rooms: Room[]
  isLoading: boolean
  onUpdateRollcall: (data: any) => Promise<void>
  selectedDate: string
}

interface RollcallState {
  [studentId: number]: {
    present: boolean
    note: string
    saving: boolean
    error: string | null
  }
}

export function RollCallChecklist({
  students,
  rollcalls,
  rooms,
  isLoading,
  onUpdateRollcall,
  selectedDate,
}: RollCallChecklistProps) {
  const { toast } = useToast()
  const [rollcallState, setRollcallState] = useState<RollcallState>({})

  const getRollcallData = (studentId: number) => {
    const existing = rollcalls.find((r) => r.studentId === studentId)
    const state = rollcallState[studentId]

    return {
      present: state?.present ?? existing?.present ?? false,
      note: state?.note ?? existing?.note ?? "",
      saving: state?.saving ?? false,
      error: state?.error ?? null,
    }
  }

  const updateRollcallState = (studentId: number, updates: Partial<RollcallState[number]>) => {
    setRollcallState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
      },
    }))
  }

  const saveRollcall = async (student: Student, present: boolean, note: string, status?: AttendanceStatus) => {
    updateRollcallState(student.id, { saving: true, error: null })

    try {
      await onUpdateRollcall({
        date: selectedDate,
        studentId: student.id,
        roomId: student.roomId,
        present,
        status,
        note: note.trim() || undefined,
      })

      toast({
        title: "저장 완료",
        description: `${student.name} 학생의 출석 정보가 저장되었습니다.`,
      })

      updateRollcallState(student.id, { saving: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "저장에 실패했습니다."
      updateRollcallState(student.id, { saving: false, error: errorMessage })

      toast({
        title: "저장 실패",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handlePresentChange = (student: Student, present: boolean) => {
    const currentData = getRollcallData(student.id)
    updateRollcallState(student.id, { present })
    saveRollcall(student, present, currentData.note)
  }

  const handleStatusChange = async (studentId: number, status: AttendanceStatus) => {
    const student = students.find(s => s.id === studentId)
    if (!student) return

    const present = status === "PRESENT"
    updateRollcallState(studentId, { present })
    await saveRollcall(student, present, "", status)
  }

  const handleNoteChange = (studentId: number, note: string) => {
    updateRollcallState(studentId, { note })
  }

  const handleNoteSave = (student: Student) => {
    const currentData = getRollcallData(student.id)
    saveRollcall(student, currentData.present, currentData.note)
  }

  const getStatusBadge = (status: Student["status"]) => {
    const variants = {
      IN: { variant: "default" as const, label: "재실" },
      OUT: { variant: "secondary" as const, label: "외출" },
      LEAVE: { variant: "outline" as const, label: "외박" },
    }
    const config = variants[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="학생이 없습니다"
            description="선택한 조건에 해당하는 학생이 없습니다."
            icon={<Users className="h-12 w-12" />}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>출석 체크리스트 ({students.length}명)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>학생명</TableHead>
                <TableHead>학번</TableHead>
                <TableHead>호실</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>출석 상태 변경</TableHead>
                <TableHead>비고</TableHead>
                <TableHead>저장</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const room = rooms.find((r) => r.id === student.roomId)
                const rollcallData = getRollcallData(student.id)

                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.studentNo}</TableCell>
                    <TableCell>{room?.name || `호실 ${student.roomId}`}</TableCell>
                    <TableCell>
                      {(() => {
                        const rollcall = rollcalls.find(r => r.studentId === student.id)
                        const currentStatus = rollcall?.status || (rollcall?.present ? "PRESENT" : "ABSENT")
                        
                        const statusConfig = {
                          PRESENT: { variant: "default" as const, label: "재실" },
                          LEAVE: { variant: "outline" as const, label: "외박" },
                          ABSENT: { variant: "destructive" as const, label: "결석" },
                        }
                        
                        const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.PRESENT
                        
                        return (
                          <Badge variant={config.variant}>
                            {config.label}
                          </Badge>
                        )
                      })()}
                    </TableCell>
                    <TableCell>
                      <AttendanceStatusButtons
                        student={student}
                        rollcall={rollcalls.find(r => r.studentId === student.id)}
                        onStatusChange={handleStatusChange}
                        disabled={rollcallData.saving}
                        className="min-w-[150px] max-w-[180px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="비고 입력..."
                        value={rollcallData.note}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        className="w-40"
                        disabled={rollcallData.saving}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {rollcallData.saving ? (
                          <LoadingSpinner size="sm" />
                        ) : rollcallData.error ? (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <Button size="sm" variant="outline" onClick={() => handleNoteSave(student)}>
                              재시도
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleNoteSave(student)}>
                            <Save className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
