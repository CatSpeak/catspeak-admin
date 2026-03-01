import { Editor } from "@tinymce/tinymce-react";

export interface PostEditorProps {
  value?: string;
  onChange?: (content: string) => void;
}

const PostEditor = ({ value, onChange }: PostEditorProps) => {
  return (
    <Editor
      apiKey="d72e5aug2qv53tqqjayyehb51euax5r7mwaj2sw6mqioq6ta"
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
          "media",
          "searchreplace",
          "table",
          "visualblocks",
          "wordcount",
          // Your account includes a free trial of TinyMCE premium features
          // Try the most popular premium features until Mar 15, 2026:
          "checklist",
          "mediaembed",
          "casechange",
          "formatpainter",
          "pageembed",
          "a11ychecker",
          "tinymcespellchecker",
          "permanentpen",
          "powerpaste",
          "advtable",
          "advcode",
          "advtemplate",
          "uploadcare",
          "mentions",
          "tinycomments",
          "tableofcontents",
          "footnotes",
          "mergetags",
          "autocorrect",
          "typography",
          "inlinecss",
          "markdown",
          "importword",
          "exportword",
          "exportpdf",
        ],
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
        tinycomments_mode: "embedded",
        tinycomments_author: "Author name",
        mergetags_list: [
          { value: "First.Name", title: "First Name" },
          { value: "Email", title: "Email" },
        ],
        branding: false,
        onboarding: false,
        uploadcare_public_key: "a5d4d82e0f05d40efc37",
      }}
      initialValue=""
    />
  );
};

export default PostEditor;
