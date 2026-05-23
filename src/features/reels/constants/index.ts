export const MAX_REEL_FILE_SIZE_MB = 500;
export const MAX_REEL_FILE_SIZE_BYTES = MAX_REEL_FILE_SIZE_MB * 1024 * 1024;

export const CHUNK_THRESHOLD_MB = 50;
export const CHUNK_THRESHOLD_BYTES = CHUNK_THRESHOLD_MB * 1024 * 1024;
export const UPLOAD_CHUNK_SIZE_BYTES = 5 * 1024 * 1024; // 5MB chunks

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov
  "video/webm",
  "video/x-matroska", // .mkv
];

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const DEBOUNCE_DELAY_MS = 300;

export const VISIBILITY_OPTIONS = [
  { value: "Public", label: "Public" },
  { value: "Private", label: "Private" },
  { value: "FriendsOnly", label: "Friends Only" },
];
