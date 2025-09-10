"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Notice, NoticeQuery } from "@/lib/types";

export function useNotices(params: NoticeQuery = {}) {
  const [data, setData] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API 호출
      const notices = await api.get<Notice[]>("/notices", params);
      setData(notices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notices");
    } finally {
      setIsLoading(false);
    }
  };

  const mutate = async (noticeData: {
    title: string;
    body: string;
    target: "ALL" | "FLOOR" | "ROOM";
    floor?: number;
    roomId?: number;
  }) => {
    try {
      // API 호출로 공지사항 생성
      const newNotice = await api.post<Notice>("/notices", noticeData);
      setData((prevData) => [newNotice, ...prevData]);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [params.limit]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchNotices,
    mutate,
  };
}
