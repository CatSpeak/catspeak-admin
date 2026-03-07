import { useNavigate } from "react-router-dom";
import { PostFormView } from "../components";
import { createPost } from "../api/createPost";

export default function PostCreatePage() {
  const navigate = useNavigate();

  const goBack = () => navigate("/news");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <nav className="text-sm text-gray-500">
          <span
            className="cursor-pointer hover:underline hover:text-gray-900 transition-colors"
            onClick={goBack}
          >
            News
          </span>
          <span className="mx-2">{">"}</span>
          <span className="text-gray-900 font-medium">Create New</span>
        </nav>
      </div>

      <PostFormView
        mode="create"
        onSubmitCreate={async (payload) => {
          await createPost(payload);
          navigate("/news");
        }}
      />
    </div>
  );
}
