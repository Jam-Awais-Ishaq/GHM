import { apiRequest } from "@/api/inspector";
import type { UpdateProfileNameResponse } from "@/api/types/profile";

export async function updateProfileName(name: string): Promise<UpdateProfileNameResponse> {
  return apiRequest<UpdateProfileNameResponse>("/api/profile/name", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
    credentials: "include",
  });
}
