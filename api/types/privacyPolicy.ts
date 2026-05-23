export type PrivacyPolicyResponse = {
  success: boolean;
  content: string | null;
  updatedAt?: string | null;
};

export type UpdatePrivacyPolicyResponse = {
  success: boolean;
  message: string;
  content: string;
  updatedAt: string;
};
