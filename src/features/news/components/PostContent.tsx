import { useState, useCallback, useMemo, useRef } from "react";
import DOMPurify from "dompurify";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PostContentProps {
  html: string;
  className?: string;
}

interface CarouselImage {
  src: string;
  alt: string;
}

function CmsCarousel({ images }: { images: CarouselImage[] }) {
  const [current, setCurrent] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  const goTo = useCallback(
    (idx: number) => {
      const next = Math.max(0, Math.min(idx, total - 1));
      setCurrent(next);
      const viewport = viewportRef.current;
      if (viewport) {
        const child = viewport.children[next] as HTMLElement;
        if (child) {
          viewport.scrollTo({
            left: child.offsetLeft - viewport.offsetLeft,
            behavior: "smooth",
          });
        }
      }
    },
    [total],
  );

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    Array.from(viewport.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const mid = el.offsetLeft - viewport.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setCurrent(closest);
  }, []);

  if (total === 0) return null;
  if (total === 1) {
    return (
      <div className="my-6 rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
        <img
          src={images[0].src}
          alt={images[0].alt}
          className="inline-block! w-full max-h-[480px] object-contain rounded-none! p-0! m-0!"
        />
      </div>
    );
  }

  return (
    <div
      className="relative my-6 rounded-xl overflow-hidden bg-gray-50 border border-gray-200"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goTo(current - 1);
        if (e.key === "ArrowRight") goTo(current + 1);
      }}
    >
      {/* Viewport */}
      <div
        ref={viewportRef}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
        }}
        onScroll={handleScroll}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt}
            className="inline-block! snap-center shrink-0 w-full max-h-[480px] object-contain rounded-none! p-0! m-0!"
          />
        ))}
      </div>

      {/* Prev button */}
      {current > 0 && (
        <button
          onClick={() => goTo(current - 1)}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all z-10"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Next button */}
      {current < total - 1 && (
        <button
          onClick={() => goTo(current + 1)}
          aria-label="Next image"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all z-10"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Counter */}
      <span className="absolute top-2.5 right-3 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full z-10">
        {current + 1} / {total}
      </span>

      {/* Dots */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 py-2.5 bg-linear-to-t from-black/20 to-transparent">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to image ${i + 1}`}
            className={`w-2 h-2 rounded-full border-none transition-all ${
              i === current
                ? "bg-white scale-125 shadow-sm"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

interface ContentSegment {
  type: "html" | "carousel";
  content: string;
  images?: CarouselImage[];
}

function parseContentSegments(sanitizedHtml: string): ContentSegment[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedHtml, "text/html");

  const carouselEls = doc.querySelectorAll(".cms-carousel");
  if (carouselEls.length === 0) {
    return [{ type: "html", content: sanitizedHtml }];
  }

  const PLACEHOLDER_PREFIX = "<!--__CMS_CAROUSEL_";
  const carouselData: CarouselImage[][] = [];

  carouselEls.forEach((el, idx) => {
    const imgs: CarouselImage[] = [];
    el.querySelectorAll("img").forEach((img) => {
      imgs.push({
        src: img.getAttribute("src") || "",
        alt: img.getAttribute("alt") || "carousel image",
      });
    });
    carouselData.push(imgs);

    const placeholder = doc.createComment(`__CMS_CAROUSEL_${idx}__`);

    const parent = el.parentElement;
    if (parent && parent.tagName === "P") {
      parent.replaceWith(placeholder);
    } else {
      el.replaceWith(placeholder);
    }
  });

  const modifiedHtml = doc.body.innerHTML;

  const segments: ContentSegment[] = [];
  let remaining = modifiedHtml;

  for (let idx = 0; idx < carouselData.length; idx++) {
    const marker = `${PLACEHOLDER_PREFIX}${idx}__-->`;
    const markerPos = remaining.indexOf(marker);

    if (markerPos === -1) {
      continue;
    }

    const before = remaining.substring(0, markerPos).trim();
    if (before) {
      segments.push({ type: "html", content: before });
    }

    segments.push({
      type: "carousel",
      content: "",
      images: carouselData[idx],
    });

    remaining = remaining.substring(markerPos + marker.length);
  }

  const tail = remaining.trim();
  if (tail) {
    segments.push({ type: "html", content: tail });
  }

  return segments;
}

const CONTENT_CLASSES = [
  // Base text
  "text-gray-800 leading-relaxed",

  // Inline formatting
  "[&_strong]:font-bold [&_b]:font-bold",
  "[&_em]:italic [&_i]:italic",
  "[&_u]:underline [&_s]:line-through",

  // Paragraphs
  "[&_p]:mb-3 [&_p]:leading-relaxed",

  // Headings
  "[&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-gray-900",
  "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-gray-900",
  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-gray-800",
  "[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1",
  "[&_h5]:text-sm [&_h5]:font-semibold [&_h5]:mt-3 [&_h5]:mb-1",
  "[&_h6]:text-sm [&_h6]:font-medium [&_h6]:mt-2 [&_h6]:mb-1 [&_h6]:text-gray-600",

  // Lists
  "[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3",
  "[&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3",
  "[&_li]:mb-1",

  // Links
  "[&_a]:text-indigo-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-indigo-800 [&_a]:transition-colors",

  // Blockquote
  "[&_blockquote]:border-l-4 [&_blockquote]:border-indigo-400 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:bg-indigo-50 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-indigo-800",

  // Code
  "[&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-red-600 [&_code]:font-mono",
  "[&_pre]:bg-slate-800 [&_pre]:text-slate-200 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-sm",
  "[&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0",

  // Horizontal rule
  "[&_hr]:border-t-2 [&_hr]:border-gray-200 [&_hr]:my-6",

  // Images — inline-block so side-by-side works AND vertical margin is respected
  "[&_img]:inline-block [&_img]:max-w-full [&_img]:h-auto [&_img]:my-3 [&_img]:p-1",

  // Figure & caption
  "[&_figure]:my-5 [&_figure]:text-center [&_figure]:mx-auto [&_figure]:clear-both",
  "[&_figure_img]:mx-auto [&_figure_img]:my-0",
  "[&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-gray-500 [&_figcaption]:mt-2",

  // Tables
  "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4",
  "[&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-700 [&_th]:text-sm",
  "[&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-sm",
].join("\n  ");

const PostContent = ({ html, className = "" }: PostContentProps) => {
  const segments = useMemo(() => {
    const sanitized = DOMPurify.sanitize(html, {
      ADD_ATTR: [
        "style",
        "width",
        "height",
        "border",
        "cellpadding",
        "cellspacing",
        "class",
      ],
    });
    return parseContentSegments(sanitized);
  }, [html]);

  return (
    <div className={`${CONTENT_CLASSES} ${className}`}>
      {segments.map((seg, i) =>
        seg.type === "carousel" && seg.images ? (
          <CmsCarousel key={`carousel-${i}`} images={seg.images} />
        ) : (
          <div
            key={`html-${i}`}
            dangerouslySetInnerHTML={{ __html: seg.content }}
          />
        ),
      )}
    </div>
  );
};

export default PostContent;
