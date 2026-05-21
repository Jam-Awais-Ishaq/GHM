import { apiRequest } from "@/api/inspector";
import type {
  CreateCommentResponse,
  GetMealCommentsResponse,
  ToggleCommentLikeResponse,
} from "@/api/types/comments";

export type CreateCommentPayload = {
  mealId: number;
  content: string;
  parentCommentId?: number;
};

export function getMealComments(mealId: number) {
  return apiRequest<GetMealCommentsResponse>(`/api/comments/${mealId}`);
}

export function createComment(payload: CreateCommentPayload) {
  return apiRequest<CreateCommentResponse>("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mealId: payload.mealId,
      content: payload.content.trim(),
      ...(payload.parentCommentId != null
        ? { parentCommentId: payload.parentCommentId }
        : {}),
    }),
    credentials: "include",
  });
}

export function toggleCommentLike(commentId: number) {
  return apiRequest<ToggleCommentLikeResponse>(`/api/comments/like/${commentId}`, {
    method: "POST",
    credentials: "include",
  });
}
