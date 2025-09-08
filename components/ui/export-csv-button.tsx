"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportCsvButtonProps {
  data: any[];
  filename: string;
  headers: { key: string; label: string }[];
  disabled?: boolean;
}

export function ExportCsvButton({
  data,
  filename,
  headers,
  disabled,
}: ExportCsvButtonProps) {
  const exportToCsv = () => {
    if (data.length === 0) return;

    // Create CSV content
    const csvHeaders = headers.map((h) => h.label).join(",");
    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header.key];
          // Escape commas and quotes in CSV
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || "";
        })
        .join(","),
    );

    const csvContent = [csvHeaders, ...csvRows].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={exportToCsv}
      disabled={disabled || data.length === 0}
      variant="outline"
    >
      <Download className="h-4 w-4 mr-2" />
      CSV 내보내기
    </Button>
  );
}
