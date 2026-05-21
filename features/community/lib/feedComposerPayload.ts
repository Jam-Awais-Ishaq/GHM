import type { FeedCategoryId } from "@/features/community/constants/feedCategories";
import { FEED_CATEGORIES } from "@/features/community/constants/feedCategories";

export function feedCategoryToApiLabel(categoryId: FeedCategoryId): string {
  return FEED_CATEGORIES.find((c) => c.id === categoryId)?.label ?? "Finds";
}

function extractFirstImageDataUrl(html: string): string | null {
  const match = html.match(/<img[^>]+src=["'](data:image\/[^"']+)["']/i);
  return match?.[1] ?? null;
}

function dataUrlToFile(dataUrl: string): File | null {
  const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) return null;

  const mime = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const ext = mime.includes("png")
    ? "png"
    : mime.includes("jpeg") || mime.includes("jpg")
      ? "jpg"
      : "webp";

  return new File([bytes], `feed-upload.${ext}`, { type: mime });
}

export function richHtmlToPlainBody(html: string): string {
  if (typeof document !== "undefined") {
    const el = document.createElement("div");
    el.innerHTML = html;
    return (el.textContent ?? "").replace(/\s+/g, " ").trim();
  }

  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildCreatePostPayload(html: string, categoryId: FeedCategoryId, title: string) {
  const imageDataUrl = extractFirstImageDataUrl(html);
  const imageFile = imageDataUrl ? dataUrlToFile(imageDataUrl) : null;

  let body = richHtmlToPlainBody(html);
  if (!body && imageFile) {
    body = "Shared a photo.";
  }

  return {
    title: title.trim(),
    category: feedCategoryToApiLabel(categoryId),
    body,
    imageFile,
  };
}
