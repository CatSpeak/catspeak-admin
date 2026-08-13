import { useRef, useImperativeHandle, forwardRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

export interface BroadcastEmailEditorRef {
  insertText: (text: string) => void;
}

interface BroadcastEmailEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const GMAIL_EMAIL_CONTENT_STYLE = `
  body {
    font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #222222;
    font-size: 14px;
    padding: 12px;
    margin: 0;
  }
  h1 { font-size: 22px; font-weight: bold; margin: 12px 0 6px; color: #111; }
  h2 { font-size: 18px; font-weight: bold; margin: 10px 0 5px; color: #8f0d15; }
  h3 { font-size: 16px; font-weight: bold; margin: 8px 0 4px; color: #333; }
  p { margin: 0 0 10px 0; }
  a { color: #8f0d15; text-decoration: underline; }
  blockquote {
    border-left: 3px solid #cccccc;
    margin: 10px 0;
    padding-left: 12px;
    color: #666666;
  }
  img { max-width: 100%; height: auto; border-radius: 6px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e0e0e0; padding: 8px; text-align: left; }
`;

export const BroadcastEmailEditor = forwardRef<
  BroadcastEmailEditorRef,
  BroadcastEmailEditorProps
>(({ value, onChange, placeholder = "Nội dung email...", minHeight = 380 }, ref) => {
  const editorRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      if (editorRef.current) {
        editorRef.current.insertContent(text);
      } else {
        onChange(value + " " + text);
      }
    },
  }));

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#8f0d15] focus-within:border-transparent transition-all">
      <Editor
        tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.6.0/tinymce.min.js"
        value={value}
        onEditorChange={onChange}
        init={{
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "wordcount",
            "emoticons",
            "autoresize",
          ],
          toolbar:
            "undo redo | blocks fontfamily fontsize | " +
            "bold italic underline strikethrough forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | " +
            "link image table emoticons hr blockquote | " +
            "code fullscreen preview",
          menubar: false,
          statusbar: true,
          branding: false,
          promotion: false,
          content_style: GMAIL_EMAIL_CONTENT_STYLE,
          min_height: minHeight,
          placeholder: placeholder,

          /* Image & Object Resizing Features */
          image_advtab: true,
          image_title: true,
          image_caption: true,
          image_dimensions: true,
          object_resizing: true,
          automatic_uploads: true,

          /* Local File & Image Picker Callback */
          file_picker_types: "image media file",
          file_picker_callback: (cb: any, _value: any, meta: any) => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            if (meta.filetype === "image") {
              input.setAttribute("accept", "image/*");
            } else {
              input.setAttribute("accept", "*/*");
            }

            input.onchange = function () {
              const file = (input.files as FileList)[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = function () {
                const id = "blobid" + new Date().getTime();
                const blobCache = (window as any).tinymce.activeEditor.editorUpload.blobCache;
                const base64 = (reader.result as string).split(",")[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                cb(blobInfo.blobUri(), { title: file.name, alt: file.name });
              };
              reader.readAsDataURL(file);
            };

            input.click();
          },

          setup: (editor: any) => {
            editorRef.current = editor;
          },
        }}
      />
    </div>
  );
});

BroadcastEmailEditor.displayName = "BroadcastEmailEditor";
