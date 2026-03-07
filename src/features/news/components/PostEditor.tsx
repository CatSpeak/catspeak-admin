import { Editor } from "@tinymce/tinymce-react";

export interface PostEditorProps {
  value?: string;
  onChange?: (content: string) => void;
}

const PostEditor = ({ value, onChange }: PostEditorProps) => {
  return (
    <Editor
      // apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
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
          "template",
          "quickbars",
        ],
        toolbar:
          "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright | link image media template | bullist numlist blockquote | removeformat",

        image_caption: true,
        image_advtab: true,
        image_title: true,

        content_style: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.8;
            color: #333;
            font-size: 16px;
          }
          /* Make all images responsive */
          img {
            max-width: 100%;
            height: auto;
            padding: 8px;
          }
          /* Styling for image captions (<figure> and <figcaption>) */
          figure.image {
            display: table;
            clear: both;
            text-align: center;
            margin: 1em auto;
          }
          figure.image img {
            display: block;
            margin: 0 auto;
          }
          figure.image figcaption {
            margin-top: 8px;
            font-size: 14px;
            color: #666;
          }
          /* Custom Image Grid Class */
          .cms-image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 1.5em 0;
          }
          .cms-image-grid img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        `,

        quickbars_selection_toolbar:
          "bold italic underline | quicklink h2 h3 blockquote",
        quickbars_insert_toolbar: "quickimage quicktable",

        // images_upload_handler: async (blobInfo: any) => {
        //   return new Promise((resolve) => {
        //     // TODO: Replace this with your actual API call
        //     // const formData = new FormData();
        //     // formData.append('file', blobInfo.blob(), blobInfo.filename());
        //     // axios.post('/api/upload', formData).then(res => resolve(res.data.url));

        //     console.log("Mock Uploading...", blobInfo.filename());
        //     setTimeout(() => {
        //       // Resolving with a base64 string for demo purposes
        //       resolve(
        //         "data:" + blobInfo.blob().type + ";base64," + blobInfo.base64(),
        //       );
        //     }, 1000);
        //   });
        // },

        promotion: false,
        branding: false,
        height: 600,
      }}
    />
  );
};

export default PostEditor;
