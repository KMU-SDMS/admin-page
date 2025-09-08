"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Parcel, ParcelQuery } from "@/lib/types";

export function useParcels(params: ParcelQuery = {}) {
  const [data, setData] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParcels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const parcels = await api.get<Parcel[]>("/parcels", params);
      setData(parcels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch parcels");
    } finally {
      setIsLoading(false);
    }
  };

  const mutate = async (
    id: number,
    updateData: { pickedUp: boolean; pickedUpAt?: string; memo?: string },
  ) => {
    try {
      await api.patch(`/parcels/${id}`, updateData);
      await fetchParcels(); // Refresh data
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchParcels();
  }, [params.carrier, params.pickedUp, params.name, params.room]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchParcels,
    mutate,
  };
}
