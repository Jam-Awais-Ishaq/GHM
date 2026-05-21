"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { ApiError } from "@/api/inspector";
import type { ApiCommunityPost } from "@/api/types/community";
import { getCommunityPosts, toggleCommunityPostLike } from "@/api/routes/community.api";
import { FeedCommentPenButton } from "@/components/layout/FeedCommentPenButton";
import { CommunityCommentsPanel } from "@/features/community/components/CommunityCommentsPanel";
import { CommunityFeedPost } from "@/features/community/components/CommunityFeedPost";
import { FeedCommentModal } from "@/features/community/components/FeedCommentModal";
import {
  mapApiCommunityPostToFeedCard,
  type FeedPostCard,
} from "@/features/community/lib/mapCommunityPost";
import {
  PUBLIC_PAGE_ACCENT,
  PublicListPageShell,
} from "@/components/layout/PublicListPageShell";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

const FILTER_LABELS = ["All", "Finds", "Tips", "Price checks"] as const;

export default function CommunityPage() {
  const queryClient = useQueryClient();
  const { session, isSignedIn } = useAuth();
  const [activeFilter, setActiveFilter] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [commentsPanelPost, setCommentsPanelPost] = useState<FeedPostCard | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [likingPostId, setLikingPostId] = useState<string | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(() => new Set());
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const {
    data: feedPosts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const res = await getCommunityPosts();
      return res.data.map((post) => mapApiCommunityPostToFeedCard(post));
    },
    staleTime: 30_000,
  });

  const handlePostCreated = (post: ApiCommunityPost) => {
    void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    const card = mapApiCommunityPostToFeedCard(post, session?.nickname);
    queryClient.setQueryData<FeedPostCard[]>(["community-posts"], (prev) => [
      card,
      ...(prev ?? []),
    ]);
  };

  const handleLike = async (postId: string) => {
    setLikingPostId(postId);
    try {
      const res = await toggleCommunityPostLike(postId);
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        if (res.liked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    } catch (err) {
      console.error(err instanceof ApiError ? err.message : err);
    } finally {
      setLikingPostId(null);
    }
  };

  const byCategory =
    activeFilter === 0
      ? feedPosts
      : feedPosts.filter((post) => {
          if (activeFilter === 1) return post.category === "finds";
          if (activeFilter === 2) return post.category === "tips";
          return post.category === "price-checks";
        });

  const q = searchQuery.trim().toLowerCase();
  const filtered =
    q.length === 0
      ? byCategory
      : byCategory.filter((post) => {
          const haystack = `${post.title} ${post.body} ${post.author}`.toLowerCase();
          return haystack.includes(q);
        });

  useEffect(() => {
    if (!searchOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (searchWrapRef.current?.contains(target)) return;
      setSearchOpen(false);
      setSearchQuery("");
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [searchOpen]);

  const panelPost =
    commentsPanelPost != null
      ? feedPosts.find((p) => p.id === commentsPanelPost.id) ?? commentsPanelPost
      : null;

  return (
    <PublicListPageShell
      title="Feed"
      subtitle="Finds, tips & brags"
      headerAction={
        <FeedCommentPenButton
          onClick={() => {
            setEditingPostId(null);
            setComposerOpen(true);
          }}
        />
      }
    >
      <div
        className={cn(
          "mb-5 flex w-full min-w-0 items-center gap-2",
          "max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:pb-1",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {FILTER_LABELS.map((label, i) => {
          const active = i === activeFilter;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActiveFilter(i)}
              aria-pressed={active}
              className={cn(
                "shrink-0 cursor-pointer rounded-full px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/35",
                active
                  ? "text-white shadow-md shadow-orange-500/20"
                  : "border border-neutral-200/90 bg-white text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50/80",
              )}
              style={active ? { backgroundColor: PUBLIC_PAGE_ACCENT } : undefined}
            >
              {label}
            </button>
          );
        })}
        {searchOpen ? (
          <div ref={searchWrapRef} className="flex min-w-[220px] shrink-0 items-center">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="h-10 w-full rounded-full border border-neutral-200/90 bg-white px-4 text-sm text-neutral-800 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-2 focus:ring-[#FF5722]/25"
              aria-label="Search feed"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  setSearchQuery("");
                }
              }}
            />
          </div>
        ) : null}
        {!searchOpen ? (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50"
            aria-label="Search feed"
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-neutral-500">Loading feed…</p>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-red-600">Could not load feed. Try again later.</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">
          {feedPosts.length === 0
            ? "No posts yet. Be the first to share a find!"
            : "No posts match your filter."}
        </p>
      ) : (
        <ul className="w-full">
          {filtered.map((post) => (
            <li
              key={post.id}
              className="border-neutral-300/40 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-dotted"
            >
              <CommunityFeedPost
                post={post}
                likedByMe={likedPostIds.has(post.id)}
                liking={likingPostId === post.id}
                isSignedIn={isSignedIn}
                onLike={() => handleLike(post.id)}
                onCommentsOpen={() => setCommentsPanelPost(post)}
                onEditOpen={() => {
                  setEditingPostId(post.id);
                  setComposerOpen(true);
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <CommunityCommentsPanel
        open={commentsPanelPost != null}
        post={panelPost}
        onClose={() => setCommentsPanelPost(null)}
      />

      <FeedCommentModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        mode="feed"
        submitToApi={!editingPostId}
        onPostCreated={handlePostCreated}
        defaultTitle={
          (editingPostId ? feedPosts.find((p) => p.id === editingPostId)?.title : "") ?? ""
        }
        defaultCategory={
          editingPostId
            ? feedPosts.find((p) => p.id === editingPostId)?.category
            : undefined
        }
        defaultDetailsHtml={
          editingPostId ? feedPosts.find((p) => p.id === editingPostId)?.body ?? "" : ""
        }
      />
    </PublicListPageShell>
  );
}
