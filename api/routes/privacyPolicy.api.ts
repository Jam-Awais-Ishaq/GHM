import { apiRequest } from "@/api/inspector";
import type {
  PrivacyPolicyResponse,
  UpdatePrivacyPolicyResponse,
} from "@/api/types/privacyPolicy";

export async function getPrivacyPolicy(): Promise<PrivacyPolicyResponse> {
  return apiRequest<PrivacyPolicyResponse>("/api/privacy-policy");
}

export async function updatePrivacyPolicy(content: string): Promise<UpdatePrivacyPolicyResponse> {
  return apiRequest<UpdatePrivacyPolicyResponse>("/api/privacy-policy", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
    credentials: "include",
  });
}
