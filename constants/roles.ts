export const roles = {
  user: "user",
  admin: "admin",
  moderator: "moderator",
} as const;

export type Role = (typeof roles)[keyof typeof roles];
