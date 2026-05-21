export type ProfileUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
};

export type UpdateProfileNameResponse = {
  success: boolean;
  message: string;
  user: ProfileUser;
};
