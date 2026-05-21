export type ReportRecord = {
  id: number;
  mealId: number;
  userId?: number;
  reason: string;
  createdAt: string;
};

export type CreateReportResponse = {
  success: boolean;
  message: string;
  data: ReportRecord;
  reportCount: number;
  mealAutoHidden: boolean;
};

export type MyReportStatusResponse = {
  success: boolean;
  hasReported: boolean;
  data: ReportRecord | null;
};
