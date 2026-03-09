import { Editor } from "@tinymce/tinymce-react";

export interface PostEditorProps {
  value?: string;
  onChange?: (content: string) => void;
}

const EDITOR_CONTENT_STYLE = `
  /* Base typography */
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.8;
    color: #1f2937;
    font-size: 16px;
    max-width: 100%;
    padding: 8px 16px;
  }

  /* Headings */
  h1 { font-size: 2em; font-weight: 800; margin: 1.2em 0 0.6em; color: #111827; }
  h2 { font-size: 1.5em; font-weight: 700; margin: 1em 0 0.5em; color: #111827; }
  h3 { font-size: 1.25em; font-weight: 600; margin: 0.8em 0 0.4em; color: #1f2937; }
  h4, h5, h6 { font-weight: 600; margin: 0.6em 0 0.3em; color: #374151; }

  /* Paragraphs & lists */
  p { margin: 0 0 1em; }
  ul, ol { margin: 0.5em 0 1em 1.5em; }
  li { margin-bottom: 0.25em; }

  /* Blockquote */
  blockquote {
    border-left: 4px solid #6366f1;
    margin: 1.5em 0;
    padding: 0.75em 1.25em;
    background: #f5f3ff;
    color: #4338ca;
    border-radius: 0 8px 8px 0;
    font-style: italic;
  }

  /* Code */
  code {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Fira Code', 'Consolas', monospace;
    color: #dc2626;
  }
  pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 1em 1.25em;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.9em;
    line-height: 1.6;
    margin: 1.5em 0;
  }
  pre code {
    background: none;
    color: inherit;
    padding: 0;
  }

  /* Horizontal rule */
  hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 2em 0;
  }

  /* Images — responsive */
  img {
    max-width: 100%;
    height: auto;
    padding: 4px;
  }

  /* Figure / caption */
  figure.image {
    display: table;
    clear: both;
    text-align: center;
    margin: 1.5em auto;
  }
  figure.image img {
    display: block;
    margin: 0 auto;
  }
  figure.image figcaption {
    margin-top: 8px;
    font-size: 13px;
    color: #6b7280;
  }

  /* Image grid */
  .cms-image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin: 1.5em 0;
  }
  .cms-image-grid img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  /* Tables */
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5em 0;
  }
  th, td {
    border: 1px solid #e5e7eb;
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
  }

  /* ── Carousel block (editor preview) ── */
  .cms-carousel {
    position: relative;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding: 12px 0;
    margin: 1.5em 0;
    border: 2px dashed #a5b4fc;
    border-radius: 12px;
    background: #eef2ff;
    min-height: 120px;
  }
  .cms-carousel::before {
    content: '📸 Carousel';
    position: absolute;
    top: 4px;
    left: 8px;
    font-size: 11px;
    font-weight: 600;
    color: #6366f1;
    background: white;
    padding: 1px 8px;
    border-radius: 4px;
    z-index: 1;
  }
  .cms-carousel img {
    scroll-snap-align: center;
    flex-shrink: 0;
    max-width: 280px;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid #c7d2fe;
    cursor: default;
  }
`;

const TOOLBAR = [
  "undo redo",
  "blocks styles",
  "bold italic underline strikethrough",
  "alignleft aligncenter alignright alignjustify",
  "bullist numlist blockquote",
  "link image media insertcarousel",
  "table emoticons codesample",
  "removeformat",
].join(" | ");

const STYLE_FORMATS = [
  {
    title: "Lead paragraph",
    block: "p",
    styles: { "font-size": "1.15em", "line-height": "1.9", color: "#374151" },
  },
  {
    title: "Caption text",
    inline: "span",
    styles: { "font-size": "0.85em", color: "#6b7280" },
  },
  {
    title: "Highlight box",
    block: "div",
    wrapper: true,
    styles: {
      background: "#fef3c7",
      border: "1px solid #fbbf24",
      "border-radius": "8px",
      padding: "12px 16px",
      margin: "1em 0",
    },
  },
];

function setupEditor(editor: any) {
  editor.ui.registry.addButton("insertcarousel", {
    icon: "gallery",
    tooltip: "Insert image carousel",
    onAction: () => {
      editor.windowManager.open({
        title: "Insert Image Carousel",
        size: "medium",
        body: {
          type: "panel",
          items: [
            {
              type: "textarea",
              name: "urls",
              label: "Image URLs (one per line)",
              maximized: true,
            },
          ],
        },
        buttons: [
          { type: "cancel", text: "Cancel" },
          { type: "submit", text: "Insert", buttonType: "primary" },
        ],
        onSubmit: (api: any) => {
          const data = api.getData() as { urls: string };
          const urls = data.urls
            .split("\n")
            .map((u: string) => u.trim())
            .filter(Boolean);

          if (urls.length === 0) {
            editor.notificationManager.open({
              text: "Please enter at least one image URL.",
              type: "warning",
              timeout: 3000,
            });
            return;
          }

          const imgs = urls
            .map((url: string) => `<img src="${url}" alt="carousel image" />`)
            .join("\n  ");

          editor.insertContent(
            `<div class="cms-carousel">\n  ${imgs}\n</div><p></p>`,
          );
          api.close();
        },
      });
    },
  });

  editor.ui.registry.addIcon?.(
    "gallery",
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
  );
}

const PostEditor = ({ value, onChange }: PostEditorProps) => {
  return (
    <Editor
      tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.6.0/tinymce.min.js"
      value={value}
      onEditorChange={onChange}
      init={{
        plugins: [
          "anchor",
          "autolink",
          "charmap",
          "codesample",
          "emoticons",
          "link",
          "lists",
          "image",
          "media",
          "searchreplace",
          "table",
          "visualblocks",
          "wordcount",
          "quickbars",
          "autoresize",
        ],

        toolbar: TOOLBAR,
        style_formats: STYLE_FORMATS,

        /* Image handling */
        image_caption: true,
        image_advtab: true,
        image_title: true,

        /* Editor appearance */
        content_style: EDITOR_CONTENT_STYLE,
        promotion: false,
        branding: false,
        min_height: 500,
        max_height: 900,

        /* Quick toolbars */
        quickbars_selection_toolbar:
          "bold italic underline | quicklink h2 h3 blockquote",
        quickbars_insert_toolbar: "quickimage quicktable",

        /* Carousel block should be treated as non-editable container */
        valid_classes: {
          div: "cms-carousel cms-image-grid",
        },

        /* Mobile-friendly */
        mobile: {
          toolbar_mode: "sliding",
        },

        /* Register carousel button */
        setup: setupEditor,
      }}
    />
  );
};

export default PostEditor;
