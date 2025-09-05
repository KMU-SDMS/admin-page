"use client"

import { useState, useEffect } from "react"
import { mockRollcalls } from "@/lib/mock-data"
import type { RollCall, RollcallQuery } from "@/lib/types"

export function useRollcalls(params: RollcallQuery = {}) {
  const [data, setData] = useState<RollCall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRollcalls = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await new Promise((resolve) => setTimeout(resolve, 500)) // 로딩 시뮬레이션

      let filteredRollcalls = [...mockRollcalls]

      // 날짜 필터링
      if (params.date) {
        filteredRollcalls = filteredRollcalls.filter((rollcall) => rollcall.date === params.date)
      }

      // 출석 상태 필터링
      if (params.present !== undefined) {
        filteredRollcalls = filteredRollcalls.filter((rollcall) => rollcall.present === params.present)
      }

      setData(filteredRollcalls)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rollcalls")
    } finally {
      setIsLoading(false)
    }
  }

  const mutate = async (rollcallData: Partial<RollCall> & { date: string; studentId: number; present: boolean }) => {
    try {
      const existingIndex = data.findIndex(
        (r) => r.studentId === rollcallData.studentId && r.date === rollcallData.date,
      )

      if (existingIndex >= 0) {
        // 기존 점호 기록 업데이트
        const updatedData = [...data]
        updatedData[existingIndex] = { ...updatedData[existingIndex], ...rollcallData }
        setData(updatedData)
      } else {
        // 새 점호 기록 추가
        const newRollcall: RollCall = {
          id: Math.max(...data.map((r) => r.id), 0) + 1,
          studentId: rollcallData.studentId,
          date: rollcallData.date,
          present: rollcallData.present,
          note: rollcallData.note || "",
        }
        setData([...data, newRollcall])
      }
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchRollcalls()
  }, [params.date, params.roomId, params.name, params.present])

  return {
    data,
    isLoading,
    error,
    refetch: fetchRollcalls,
    mutate,
  }
}
