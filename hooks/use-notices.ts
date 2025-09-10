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

      const notices = await api.notices.getAll();

      // id 순서대로 정렬 (내림차순)
      let sortedNotices = notices.sort((a, b) => b.id - a.id);

      // 개수 제한 적용
      if (params.limit) {
        sortedNotices = sortedNotices.slice(0, params.limit);
      }

      setData(sortedNotices);
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
    // POST API가 구현되지 않았으므로 로컬 상태만 업데이트
    try {
      const newNotice: Notice = {
        id: Math.max(...data.map((n) => n.id), 0) + 1,
        title: noticeData.title,
        content: noticeData.body,
        date: new Date().toISOString().split("T")[0],
        is_important: false,
      };

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
