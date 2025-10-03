import type React from "react";
import { Suspense } from "react";

// 정적 내보내기를 위한 설정 제거
import {
  Plus,
  Eye,
  Send,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NoticePreviewModal } from "@/components/notices/notice-preview-modal";
import { NoticeEditModal } from "@/components/notices/notice-edit-modal";
import { NoticeDeleteDialog } from "@/components/notices/notice-delete-dialog";
import { api } from "@/lib/api";
import type { Notice } from "@/lib/types";
import { NoticesPageClient } from "./notices-page-client";

async function getNotices(): Promise<{
  notices: Notice[];
  pageInfo: {
    total_notice: number;
    total_page: number;
    now_page: number;
  };
}> {
  try {
    const response = await api.notices.getPaginated({ page: 1 });
    return {
      notices: response.notices,
      pageInfo: response.page_info,
    };
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return {
      notices: [],
      pageInfo: { total_notice: 0, total_page: 1, now_page: 1 },
    };
  }
}

export default async function NoticesPage() {
  const noticesData = await getNotices();

  return (
    <Layout>
      <div className="h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <NoticesPageClient initialNoticesData={noticesData} />
        </Suspense>
      </div>
    </Layout>
  );
}
