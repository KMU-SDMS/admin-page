"use client";

import { useState, useEffect } from "react";
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

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 페이지네이션 파라미터가 있으면 페이지네이션 API 사용
      if (params.page !== undefined) {
        const response = await api.notices.getPaginated(params);
        let filteredNotices = Array.isArray(response.notices)
          ? response.notices
          : [];

        // 클라이언트 사이드 필터링 적용
        filteredNotices = applyFilters(filteredNotices, params);

        setData(filteredNotices);
        setPageInfo(response.page_info);
      } else {
        // 기존 로직 유지 (페이지네이션 없이)
        const notices = await api.notices.getAll();

        // notices가 배열인지 확인하고 필터링/정렬 적용
        let processedNotices = Array.isArray(notices) ? notices : [];
        processedNotices = applyFilters(processedNotices, params);

        // 개수 제한 적용
        if (params.limit) {
          processedNotices = processedNotices.slice(0, params.limit);
        }

        setData(processedNotices);
        setPageInfo(undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notices");
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링 로직을 별도 함수로 분리
  const applyFilters = (notices: Notice[], filters: NoticeQuery): Notice[] => {
    let filteredNotices = [...notices];

    // 시간 필터 적용
    if (filters.timeFilter) {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.timeFilter) {
        case "this-week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "this-month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "all":
        default:
          // 모든 데이터 표시
          break;
      }

      if (filters.timeFilter !== "all") {
        filteredNotices = filteredNotices.filter((notice) => {
          const noticeDate = new Date(notice.date);
          return noticeDate >= cutoffDate;
        });
      }
    }

    // 정렬 필터 적용
    if (filters.sortFilter) {
      filteredNotices.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (filters.sortFilter === "latest") {
          return dateB.getTime() - dateA.getTime();
        } else {
          return dateA.getTime() - dateB.getTime();
        }
      });
    } else {
      // 기본값: 최신순
      filteredNotices.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
    }

    return filteredNotices;
  };

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
  }, [params.limit, params.page, params.timeFilter]);

  return {
    data,
    pageInfo,
    isLoading,
    error,
    refetch: fetchNotices,
    mutate,
  };
}
