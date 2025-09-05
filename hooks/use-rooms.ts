"use client"

import { useState, useEffect } from "react"
import { mockRooms } from "@/lib/mock-data"
import type { Room } from "@/lib/types"

export function useRooms() {
  const [data, setData] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await new Promise((resolve) => setTimeout(resolve, 500)) // 로딩 시뮬레이션
      setData(mockRooms)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rooms")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchRooms,
  }
}
