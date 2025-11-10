"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "@/lib/api";
import type { Notice, NoticeQuery, NoticePageInfo } from "@/lib/types";

interface UseNoticesResult {
  data: Notice[];
  pageInfo?: NoticePageInfo;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (noticeData: {
    title: string;
    content: string;
    is_important: boolean;
  }) => Promise<void>;
}

export function useNotices(params: NoticeQuery = {}): UseNoticesResult {
  const [data, setData] = useState<Notice[]>([]);
  const [pageInfo, setPageInfo] = useState<NoticePageInfo | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);

  const fetchNotices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const parsedParams: NoticeQuery = paramsKey
        ? (JSON.parse(paramsKey) as NoticeQuery)
        : {};

      const response = await api.notices.getFiltered(parsedParams);
      const filteredNotices = Array.isArray(response?.notices)
        ? response?.notices
        : [];

      setData(filteredNotices);
      setPageInfo(response?.page_info);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notices");
      setData([]);
      setPageInfo(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [paramsKey]);

  const mutate = async (noticeData: {
    title: string;
    content: string;
    is_important: boolean;
  }) => {
    try {
      const newNotice = await api.notices.create(noticeData);
      setData((prevData) => [newNotice, ...prevData]);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  return {
    data,
    pageInfo,
    isLoading,
    error,
    refetch: fetchNotices,
    mutate,
  };
}
