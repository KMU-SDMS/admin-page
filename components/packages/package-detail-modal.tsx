"use client";

import { useState } from "react";
import { Package, Calendar, User, FileText, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Parcel } from "@/lib/types";

interface ParcelWithDetails extends Parcel {
  studentName?: string;
  roomName?: string;
}

interface PackageDetailModalProps {
  parcel: ParcelWithDetails;
  onClose: () => void;
  onUpdate: (
    id: number,
    data: { pickedUp: boolean; pickedUpAt?: string; memo?: string },
  ) => Promise<void>;
}

export function PackageDetailModal({
  parcel,
  onClose,
  onUpdate,
}: PackageDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    pickedUp: parcel.pickedUp,
    memo: parcel.memo || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(parcel.id, {
        pickedUp: formData.pickedUp,
        pickedUpAt: formData.pickedUp ? new Date().toISOString() : undefined,
        memo: formData.memo.trim() || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update parcel:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      pickedUp: parcel.pickedUp,
      memo: parcel.memo || "",
    });
    setIsEditing(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            택배 상세 정보
          </DialogTitle>
          <DialogDescription>
            택배 정보를 확인하고 수령 처리 및 메모를 관리할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">택배 정보</span>
              </div>
              <div className="space-y-2 pl-6">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    택배사
                  </Label>
                  <div className="mt-1">
                    <Badge variant="outline">{parcel.courier}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    운송장번호
                  </Label>
                  <div className="mt-1 font-mono text-sm">
                    {parcel.trackingNo || "없음"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">수령인 정보</span>
              </div>
              <div className="space-y-2 pl-6">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    학생명
                  </Label>
                  <div className="mt-1">
                    {parcel.studentName || `학생 ${parcel.studentId}`}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">호실</Label>
                  <div className="mt-1">
                    {parcel.roomName || `호실 ${parcel.roomId}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">배송 정보</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 pl-6">
              <div>
                <Label className="text-sm text-muted-foreground">
                  도착일시
                </Label>
                <div className="mt-1">
                  {new Date(parcel.arrivedAt).toLocaleString()}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  수령일시
                </Label>
                <div className="mt-1">
                  {parcel.pickedUpAt
                    ? new Date(parcel.pickedUpAt).toLocaleString()
                    : "미수령"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pickup Status and Memo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">수령 관리</span>
            </div>
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="pickup-status">수령 상태</Label>
                <Switch
                  id="pickup-status"
                  checked={formData.pickedUp}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, pickedUp: checked }))
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo">메모</Label>
                {isEditing ? (
                  <Textarea
                    id="memo"
                    placeholder="택배 관련 메모를 입력하세요..."
                    value={formData.memo}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, memo: e.target.value }))
                    }
                    rows={3}
                  />
                ) : (
                  <div className="min-h-[80px] p-3 border rounded-md bg-muted/50 text-sm">
                    {parcel.memo || "메모가 없습니다."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <FileText className="h-4 w-4 mr-2" />
                편집
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
