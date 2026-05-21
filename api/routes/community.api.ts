import { ApiError, apiRequest } from "@/api/inspector";
import type {
  CreateCommunityPostCommentResponse,
  CreateCommunityPostResponse,
  GetCommunityPostCommentsResponse,
  GetCommunityPostsResponse,
  ToggleCommunityPostLikeResponse,
} from "@/api/types/community";
import { env } from "@/config/env";

export type CreateCommunityPostPayload = {
  title: string;
  category: string;
  body: string;
  imageFile?: File | null;
};

/** Create a community feed post (multipart; auth cookie required). */
export async function createCommunityPost(
  payload: CreateCommunityPostPayload,
): Promise<CreateCommunityPostResponse> {
  const formData = new FormData();
  formData.append("title", payload.title.trim());
  formData.append("category", payload.category);
  formData.append("body", payload.body.trim());
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const res = await fetch(`${env.apiBaseUrl}/api/community/create`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as CreateCommunityPostResponse;
}

export function getCommunityPosts() {
  return apiRequest<GetCommunityPostsResponse>("/api/community");
}

export function toggleCommunityPostLike(postId: string) {
  return apiRequest<ToggleCommunityPostLikeResponse>(`/api/community/like/${postId}`, {
    method: "POST",
    credentials: "include",
  });
}

export function getCommunityPostComments(postId: string) {
  return apiRequest<GetCommunityPostCommentsResponse>(`/api/community/comment/${postId}`);
}

export function createCommunityPostComment(postId: string, body: string) {
  return apiRequest<CreateCommunityPostCommentResponse>(`/api/community/comment/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: body.trim() }),
    credentials: "include",
  });
}
