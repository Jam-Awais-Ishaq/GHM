export type ApiCommentUser = {
  id: number;
  name: string | null;
};

export type ApiComment = {
  id: number;
  content: string;
  mealId: number;
  userId: number;
  parentCommentId: number | null;
  isHidden: boolean;
  createdAt: string;
  _count: {
    likes: number;
    replies: number;
  };
  user: ApiCommentUser;
  replies?: ApiComment[];
};

export type GetMealCommentsResponse = {
  success: boolean;
  count: number;
  data: ApiComment[];
};

export type CreateCommentResponse = {
  success: boolean;
  message: string;
  data: ApiComment;
};

export type ToggleCommentLikeResponse = {
  success: boolean;
  message: string;
  liked: boolean;
  totalLikes: number;
};
