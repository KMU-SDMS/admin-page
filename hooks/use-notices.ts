"use client"

import { useState, useEffect } from "react"
import { mockNotices } from "@/lib/mock-data"
import type { Notice, NoticeQuery } from "@/lib/types"

export function useNotices(params: NoticeQuery = {}) {
  const [data, setData] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await new Promise((resolve) => setTimeout(resolve, 500)) // 로딩 시뮬레이션

      let filteredNotices = [...mockNotices].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )

      // 개수 제한 적용
      if (params.limit) {
        filteredNotices = filteredNotices.slice(0, params.limit)
      }

      setData(filteredNotices)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notices")
    } finally {
      setIsLoading(false)
    }
  }

  const mutate = async (noticeData: {
    title: string
    body: string
    target: "ALL" | "FLOOR" | "ROOM"
    floor?: number
    roomId?: number
  }) => {
    try {
      const newNotice: Notice = {
        id: Math.max(...data.map((n) => n.id), 0) + 1,
        title: noticeData.title,
        body: noticeData.body,
        target: noticeData.target,
        targetValue:
          noticeData.target === "FLOOR"
            ? noticeData.floor?.toString()
            : noticeData.target === "ROOM"
              ? noticeData.roomId?.toString()
              : null,
        createdAt: new Date().toISOString(),
      }

      setData((prevData) => [newNotice, ...prevData])
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [params.limit])

  return {
    data,
    isLoading,
    error,
    refetch: fetchNotices,
    mutate,
  }
}
