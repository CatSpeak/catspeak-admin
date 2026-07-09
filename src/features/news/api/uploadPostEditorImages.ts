import axios, { type AxiosProgressEvent } from "axios";

export interface UploadedPostEditorImage {
  url: string;
  alt: string;
}

const DEFAULT_IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const DEFAULT_IMGBB_API_KEY = "8c538b190d6d922e156d4284e5ab0b36";

const URL_KEYS = [
  "url",
  "src",
  "mediaUrl",
  "secureUrl",
  "secure_url",
  "imageUrl",
  "fileUrl",
] as const;

function isUsableUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function collectUrls(value: unknown, urls: string[]): void {
  if (!value) return;

  if (typeof value === "string") {
    if (isUsableUrl(value) && !urls.includes(value)) {
      urls.push(value);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectUrls(item, urls));
    return;
  }

  if (typeof value !== "object") return;

  const record = value as Record<string, unknown>;

  for (const key of URL_KEYS) {
    const candidate = record[key];
    if (typeof candidate === "string" && isUsableUrl(candidate)) {
      if (!urls.includes(candidate)) {
        urls.push(candidate);
      }
      return;
    }
  }

  for (const key of [
    "data",
    "files",
    "images",
    "imageUrls",
    "media",
    "mediaUrls",
    "items",
    "result",
    "urls",
  ]) {
    collectUrls(record[key], urls);
  }
}

function getImgbbUploadUrl(): string {
  const uploadUrl =
    import.meta.env.VITE_IMGBB_UPLOAD_URL || DEFAULT_IMGBB_UPLOAD_URL;
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY || DEFAULT_IMGBB_API_KEY;

  const url = new URL(uploadUrl);
  url.searchParams.set("key", apiKey);
  return url.toString();
}

export async function uploadPostEditorImages(
  files: File[],
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<UploadedPostEditorImage[]> {
  const uploadedImages: UploadedPostEditorImage[] = [];
  const loadedByFile = new Map<number, number>();
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  for (const [index, file] of files.entries()) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name.replace(/\.[^.]+$/, ""));

    const response = await axios.post<unknown>(getImgbbUploadUrl(), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event) => {
        loadedByFile.set(index, event.loaded);
        const loadedBytes = Array.from(loadedByFile.values()).reduce(
          (sum, loaded) => sum + loaded,
          0,
        );

        onUploadProgress?.({
          ...event,
          loaded: loadedBytes,
          total: totalBytes,
        });
      },
    });

    const urls: string[] = [];
    collectUrls(response.data, urls);

    const url = urls[0];
    if (!url) {
      throw new Error(`Upload completed for ${file.name}, but no URL returned.`);
    }

    uploadedImages.push({
      url,
      alt: file.name || "carousel image",
    });
  }

  return uploadedImages;
}
