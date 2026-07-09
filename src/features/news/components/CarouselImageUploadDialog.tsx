import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Images,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { uploadPostEditorImages } from "../api/uploadPostEditorImages";

export interface CarouselInsertImage {
  src: string;
  alt: string;
}

interface CarouselImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (images: CarouselInsertImage[]) => void;
}

interface CarouselImageDraft {
  id: string;
  file: File;
  previewUrl: string;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

function isAllowedImage(file: File): boolean {
  return (
    ALLOWED_IMAGE_TYPES.includes(file.type) ||
    /\.(jpe?g|png|webp|gif)$/i.test(file.name)
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getUploadError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Failed to upload carousel images.";
}

export default function CarouselImageUploadDialog({
  isOpen,
  onClose,
  onInsert,
}: CarouselImageUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const [items, setItems] = useState<CarouselImageDraft[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const revokePreview = (previewUrl: string) => {
    if (objectUrlsRef.current.has(previewUrl)) {
      URL.revokeObjectURL(previewUrl);
      objectUrlsRef.current.delete(previewUrl);
    }
  };

  const resetDraft = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    setItems([]);
    setIsDragActive(false);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  const addFiles = (files: FileList | File[]) => {
    const nextItems: CarouselImageDraft[] = [];
    const rejected: string[] = [];

    Array.from(files).forEach((file) => {
      if (!isAllowedImage(file)) {
        rejected.push(`${file.name}: unsupported format`);
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        rejected.push(`${file.name}: over ${MAX_IMAGE_SIZE_MB} MB`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(previewUrl);
      nextItems.push({
        id: `${file.name}-${file.lastModified}-${previewUrl}`,
        file,
        previewUrl,
      });
    });

    if (nextItems.length > 0) {
      setItems((prev) => [...prev, ...nextItems]);
    }

    setError(rejected.length > 0 ? rejected.join(". ") : null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
    }
    event.target.value = "";
  };

  const handleDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragActive(true);
      return;
    }

    if (event.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    if (event.dataTransfer.files?.length) {
      addFiles(event.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        revokePreview(target.previewUrl);
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;

      const next = [...prev];
      const [item] = next.splice(index, 1);
      if (!item) return prev;

      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const handleClose = () => {
    if (isUploading) return;
    resetDraft();
    onClose();
  };

  const handleUpload = async () => {
    if (items.length === 0) {
      setError("Select at least one image.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadedImages = await uploadPostEditorImages(
        items.map((item) => item.file),
        (event) => {
          if (!event.total) return;
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        },
      );

      onInsert(
        uploadedImages.map((image, index) => ({
          src: image.url,
          alt: image.alt || items[index]?.file.name || "carousel image",
        })),
      );
      resetDraft();
      onClose();
    } catch (uploadError) {
      setError(getUploadError(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="carousel-upload-title"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Images size={18} />
            </span>
            <div className="min-w-0">
              <h2
                id="carousel-upload-title"
                className="truncate text-base font-bold text-gray-900"
              >
                Image carousel
              </h2>
              <p className="truncate text-xs text-gray-500">
                {items.length === 0
                  ? "Upload images"
                  : `${items.length} image${items.length === 1 ? "" : "s"} selected`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close carousel upload"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Choose carousel images"
          />

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center transition-all sm:min-h-[210px] ${isDragActive
              ? "border-primary bg-primary/5"
              : "border-gray-200 bg-gray-50/60 hover:border-primary/40 hover:bg-white"
              }`}
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
              <Upload size={22} />
            </span>
            <p className="text-sm font-bold text-gray-900">
              Drop images here or choose files
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
              JPG, PNG, WebP, or GIF. Up to {MAX_IMAGE_SIZE_MB} MB each.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <ImagePlus size={16} />
              Select images
            </button>
          </div>

          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Carousel order
                </h3>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Plus size={14} />
                  Add more
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="relative aspect-video bg-gray-100">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                    </div>

                    <div className="space-y-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveItem(index, -1)}
                            disabled={index === 0 || isUploading}
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Move ${item.file.name} earlier`}
                            title="Move earlier"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(index, 1)}
                            disabled={index === items.length - 1 || isUploading}
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Move ${item.file.name} later`}
                            title="Move later"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={isUploading}
                          className="rounded-lg border border-red-100 p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Remove ${item.file.name}`}
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600">
                <span>Uploading images</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="inline-flex justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={items.length === 0 || isUploading}
            className="inline-flex justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Images size={16} />
            )}
            Insert carousel
          </button>
        </div>
      </div>
    </div>
  );
}
