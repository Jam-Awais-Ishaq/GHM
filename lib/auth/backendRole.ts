import { roles, type Role } from "@/constants/roles";

/** Maps backend JWT role (ADMIN | USER) to frontend session role. */
export function roleFromBackend(backendRole: string | undefined): Role {
  const normalized = backendRole?.trim().toUpperCase();
  if (normalized === "ADMIN") return roles.admin;
  if (normalized === "MODERATOR") return roles.moderator;
  return roles.user;
}
