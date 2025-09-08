"use client";

import { useState } from "react";
import { Package, Filter, RefreshCw, Eye } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ExportCsvButton } from "@/components/ui/export-csv-button";
import { PackageDetailModal } from "@/components/packages/package-detail-modal";
import { useParcels } from "@/hooks/use-parcels";
import { useStudents } from "@/hooks/use-students";
import { useRooms } from "@/hooks/use-rooms";
import { useToast } from "@/hooks/use-toast";
import type { Parcel } from "@/lib/types";

interface ParcelWithDetails extends Parcel {
  studentName?: string;
  roomName?: string;
}

export default function PackagesPage() {
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [pickedUpFilter, setPickedUpFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParcel, setSelectedParcel] =
    useState<ParcelWithDetails | null>(null);

  const { toast } = useToast();

  const {
    data: parcels,
    isLoading: parcelsLoading,
    refetch: refetchParcels,
    mutate: mutateParcel,
  } = useParcels({
    carrier: carrierFilter === "all" ? undefined : carrierFilter,
    pickedUp:
      pickedUpFilter === "all" ? undefined : pickedUpFilter === "picked",
    name: searchQuery || undefined,
  });

  const { data: students } = useStudents();
  const { data: rooms } = useRooms();

  // Enrich parcels with student and room information
  const enrichedParcels: ParcelWithDetails[] = parcels.map((parcel) => {
    const student = students.find((s) => s.id === parcel.studentId);
    const room = rooms.find((r) => r.id === parcel.roomId);
    return {
      ...parcel,
      studentName: student?.name,
      roomName: room?.name,
    };
  });

  // Get unique carriers for filter
  const carriers = Array.from(new Set(parcels.map((p) => p.courier))).sort();

  const handlePickupToggle = async (
    parcel: ParcelWithDetails,
    pickedUp: boolean,
  ) => {
    try {
      await mutateParcel(parcel.id, {
        pickedUp,
        pickedUpAt: pickedUp ? new Date().toISOString() : undefined,
      });

      toast({
        title: pickedUp ? "수령 처리 완료" : "수령 취소 완료",
        description: `${parcel.studentName}님의 택배 수령 상태가 변경되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "처리 실패",
        description:
          error instanceof Error ? error.message : "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const columns: Column<ParcelWithDetails>[] = [
    {
      key: "courier",
      label: "택배사",
      sortable: true,
      render: (parcel) => <Badge variant="outline">{parcel.courier}</Badge>,
    },
    {
      key: "trackingNo",
      label: "운송장번호",
      render: (parcel) => parcel.trackingNo || "-",
    },
    {
      key: "studentName",
      label: "학생명",
      sortable: true,
      render: (parcel) => parcel.studentName || `학생 ${parcel.studentId}`,
    },
    {
      key: "roomName",
      label: "호실",
      sortable: true,
      render: (parcel) => parcel.roomName || `호실 ${parcel.roomId}`,
    },
    {
      key: "arrivedAt",
      label: "도착일시",
      sortable: true,
      render: (parcel) => new Date(parcel.arrivedAt).toLocaleString(),
    },
    {
      key: "pickedUp",
      label: "수령여부",
      render: (parcel) => (
        <Switch
          checked={parcel.pickedUp}
          onCheckedChange={(checked) => handlePickupToggle(parcel, checked)}
          disabled={parcelsLoading}
        />
      ),
    },
    {
      key: "memo",
      label: "메모",
      render: (parcel) => (
        <span className="max-w-32 truncate block">{parcel.memo || "-"}</span>
      ),
    },
    {
      key: "actions",
      label: "작업",
      render: (parcel) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedParcel(parcel);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const csvHeaders = [
    { key: "courier", label: "택배사" },
    { key: "trackingNo", label: "운송장번호" },
    { key: "studentName", label: "학생명" },
    { key: "roomName", label: "호실" },
    { key: "arrivedAt", label: "도착일시" },
    { key: "pickedUp", label: "수령여부" },
    { key: "memo", label: "메모" },
  ];

  const csvData = enrichedParcels.map((parcel) => ({
    ...parcel,
    arrivedAt: new Date(parcel.arrivedAt).toLocaleString(),
    pickedUp: parcel.pickedUp ? "수령완료" : "미수령",
  }));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">택배 관리</h1>
          <p className="text-muted-foreground">
            학생 택배 도착 및 수령 현황 관리
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              필터 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label>택배사</Label>
                <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체 택배사" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 택배사</SelectItem>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier} value={carrier}>
                        {carrier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>수령상태</Label>
                <Select
                  value={pickedUpFilter}
                  onValueChange={setPickedUpFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="picked">수령완료</SelectItem>
                    <SelectItem value="pending">미수령</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>학생명/호실 검색</Label>
                <SearchInput
                  placeholder="학생명 또는 호실 검색..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>

              <div className="space-y-2">
                <Label>작업</Label>
                <div className="pt-2">
                  <Button onClick={refetchParcels} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    새로고침
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>내보내기</Label>
                <div className="pt-2">
                  <ExportCsvButton
                    data={csvData}
                    filename="packages"
                    headers={csvHeaders}
                    disabled={parcelsLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">전체 택배</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {enrichedParcels.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">수령완료</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-green-600">
                {enrichedParcels.filter((p) => p.pickedUp).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">미수령</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-orange-600">
                {enrichedParcels.filter((p) => !p.pickedUp).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">오늘 도착</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-blue-600">
                {
                  enrichedParcels.filter((p) => {
                    const today = new Date().toDateString();
                    const arrivedDate = new Date(p.arrivedAt).toDateString();
                    return today === arrivedDate;
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packages Table */}
        <Card>
          <CardHeader>
            <CardTitle>택배 목록 ({enrichedParcels.length}건)</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={enrichedParcels}
              columns={columns}
              isLoading={parcelsLoading}
              emptyMessage="택배가 없습니다."
              onRowClick={setSelectedParcel}
            />
          </CardContent>
        </Card>

        {/* Package Detail Modal */}
        {selectedParcel && (
          <PackageDetailModal
            parcel={selectedParcel}
            onClose={() => setSelectedParcel(null)}
            onUpdate={async (id, data) => {
              await mutateParcel(id, data);
              setSelectedParcel(null);
              toast({
                title: "업데이트 완료",
                description: "택배 정보가 성공적으로 업데이트되었습니다.",
              });
            }}
          />
        )}
      </div>
    </Layout>
  );
}
