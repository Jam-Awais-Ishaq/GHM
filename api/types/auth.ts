export type MagicLinkResponse = {
  success: boolean;
  message: string;
};

export type VerifyMagicLinkResponse = {
  success: boolean;
  message: string;
  role?: string;
  accessToken?: string;
};

export type BackendAuthUser = {
  id: string;
  role: string;
};

export type AdminTestResponse = {
  success: boolean;
  user?: BackendAuthUser;
};

export type LogoutResponse = {
  success: boolean;
  message: string;
};
