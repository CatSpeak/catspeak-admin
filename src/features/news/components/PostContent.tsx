import DOMPurify from "dompurify";

interface PostContentProps {
  html: string;
  className?: string;
}

const PostContent = ({ html, className = "" }: PostContentProps) => {
  return (
    <div
      className={`text-gray-800
        [&_strong]:font-bold [&_b]:font-bold
        [&_em]:italic [&_i]:italic
        [&_u]:underline [&_s]:line-through
        [&_p]:mb-2
        [&_ul]:list-disc [&_ul]:ml-4
        [&_ol]:list-decimal [&_ol]:ml-4
        [&_h1]:text-2xl [&_h1]:font-bold
        [&_h2]:text-xl [&_h2]:font-bold
        [&_a]:text-blue-500 [&_a]:underline
        [&_img]:inline [&_img]:max-w-full [&_img]:h-auto [&_img]:p-2
        [&_table]:w-full [&_td]:align-top
        [&_figure]:my-4
        [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:opacity-70
        ${className}`}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html, {
          ADD_ATTR: [
            "style",
            "width",
            "height",
            "border",
            "cellpadding",
            "cellspacing",
          ],
        }),
      }}
    />
  );
};

export default PostContent;
