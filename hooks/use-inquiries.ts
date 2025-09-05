"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { Inquiry, InquiryQuery } from "@/lib/types"

export function useInquiries(params: InquiryQuery = {}) {
  const [data, setData] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInquiries = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const inquiries = await api.get<Inquiry[]>("/inquiries", params)
      setData(inquiries)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inquiries")
    } finally {
      setIsLoading(false)
    }
  }

  const mutate = async (id: number, updateData: { status: "OPEN" | "IN_PROGRESS" | "RESOLVED" }) => {
    try {
      await api.patch(`/inquiries/${id}`, updateData)
      await fetchInquiries() // Refresh data
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [params.status, params.category, params.name])

  return {
    data,
    isLoading,
    error,
    refetch: fetchInquiries,
    mutate,
  }
}
