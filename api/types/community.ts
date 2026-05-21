export type CommunityPostCategory = "FINDS" | "TIPS" | "PRICE_CHECKS";

export type ApiCommunityPost = {
  id: string;
  userId: number;
  title: string;
  category: CommunityPostCategory;
  body: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user?: {
    id: number;
    name: string | null;
  };
};

export type CreateCommunityPostResponse = {
  success: boolean;
  message: string;
  data: ApiCommunityPost;
};

export type GetCommunityPostsResponse = {
  success: boolean;
  data: ApiCommunityPost[];
};

export type ToggleCommunityPostLikeResponse = {
  success: boolean;
  liked: boolean;
};

export type ApiCommunityPostComment = {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
  };
};

export type ApiCommunityPostWithComments = {
  id: string;
  title: string;
  comments: ApiCommunityPostComment[];
};

export type GetCommunityPostCommentsResponse = {
  success: boolean;
  data: ApiCommunityPostWithComments;
};

export type CreateCommunityPostCommentResponse = {
  success: boolean;
  message: string;
  data: ApiCommunityPostComment;
};
