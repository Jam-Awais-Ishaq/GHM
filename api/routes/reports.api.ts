import { apiRequest } from "@/api/inspector";
import type { CreateReportResponse, MyReportStatusResponse } from "@/api/types/reports";

export type CreateReportPayload = {
  mealId: number;
  reason: string;
};

export function getMyReportStatus(mealId: number) {
  return apiRequest<MyReportStatusResponse>(`/api/reports/meal/${mealId}/mine`, {
    credentials: "include",
  });
}

export function createReport(payload: CreateReportPayload) {
  return apiRequest<CreateReportResponse>("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mealId: payload.mealId,
      reason: payload.reason.trim(),
    }),
    credentials: "include",
  });
}
