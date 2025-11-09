"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type {
  OvernightStayApplication,
  OvernightStayPaginatedResponse,
  OvernightStayQuery,
  OvernightStayStatusUpdateRequest,
} from "@/lib/types";

interface UseOvernightStaysResult {
  data: OvernightStayApplication[];
  pageInfo?: OvernightStayPaginatedResponse["pageInfo"];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStatus: (
    payload: OvernightStayStatusUpdateRequest
  ) => Promise<void>;
}

export function useOvernightStays(
  params: OvernightStayQuery = {}
): UseOvernightStaysResult {
  const [data, setData] = useState<OvernightStayApplication[]>([]);
  const [pageInfo, setPageInfo] =
    useState<OvernightStayPaginatedResponse["pageInfo"]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);

  const fetchOvernightStays = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const parsedParams = paramsKey
        ? (JSON.parse(paramsKey) as OvernightStayQuery)
        : {};

      const response = await api.overnightStays.list(parsedParams);

      const items = Array.isArray(response?.data)
        ? response.data
        : [];

      setData(items);
      setPageInfo(response?.pageInfo);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch overnight stay applications"
      );
      setData([]);
      setPageInfo(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [paramsKey]);

  const updateStatus = useCallback(
    async (payload: OvernightStayStatusUpdateRequest) => {
      const targetIds = Array.isArray(payload.id)
        ? payload.id
        : [payload.id];

      await api.overnightStays.updateStatus(payload);

      setData((prev) =>
        prev.map((item) =>
          targetIds.includes(item.id)
            ? { ...item, status: payload.status }
            : item
        )
      );
    },
    []
  );

  useEffect(() => {
    fetchOvernightStays();
  }, [fetchOvernightStays]);

  return {
    data,
    pageInfo,
    isLoading,
    error,
    refetch: fetchOvernightStays,
    updateStatus,
  };
}

